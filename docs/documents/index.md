
# Document Data Model

Automerge documents are quite similar to JSON objects. A document always consists of a root map which is a map from strings to other automerge values, which can themselves be composite types.

The types in automerge are:

* Composite types
    * Maps
    * [List](lists)
    * [Text](./text)
* Scalar (non-composite) types:
    * IEEE 754 64 bit floating point numbers
    * Unsigned integers
    * Signed integers
    * Booleans Strings
    * Timestamps
    * Counters
    * Byte arrays

See [below](#javascript-language-mapping) for how these types map to JavaScript types.

## Maps

Maps have string keys and any automerge type as a value. "string" here means a unicode string. The underlying representation in automerge is as UTF-8 byte sequences but they are exposed as utf-16 strings in javascript.

## Lists

A list is an ordered sequence of automerge values. The underlying data structure is an RGA sequence, which means that concurrent insertions and deletions can be merged in a manner which attempts to preserve user intent.

## Text

Text is an implementation of the [peritext](https://www.inkandswitch.com/peritext/) CRDT. This is conceptually similar to a [list](#lists) where each element is a single unicode scalar value representing a single character. In addition to the characters `Text` also supports "marks". Marks are tuples of the form `(start, end, name, value)` which have the following meanings:

* `start` - the index of the beginning of the mark
* `end` - the index of the end of the mark
* `name` - the name of the mark
* `value` - any scalar (as in automerge scalar) value

For example, a bold mark from charaters 1 to 5 might be represented as `(1, 5, "bold", true)`.

Note that the restriction to scalar values for the value of a mark will be lifted in future, although mark values will never be mutable - instead you should always create a new mark when updating a value. For now, if you need complex values in a mark you should serialize the value to a string.

## Timestamps

Timestamps are the integer number of milliseconds since the unix epoch (midnight 1970, UTC).

## Counter

Counters are a simple CRDT which just merges by adding all concurrent operations. They can be incremented and decremented.

## Javascript language mapping

The mapping to javascript is accomplished with the use of proxies. This means that in the javascript library maps appear as `object`s and lists appear as `Array`s. There is only one numeric type in javascript - `number` - so the javascript library guesses a bit. If you insert a javascript `number` for which [`Number.isInteger`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger) returns `true` then the number will be inserted as an integer, otherwise it will be a floating point value.

How `Text` and `String` are represented will depend on whether you are using [the `next` API](/docs/the_js_packages#the-next-api)

Timestamps are represented as javascript `Date`s.

Counters are represented as instances of the `Counter` class.

Putting it all together, here's an example of an automerge document containing all the value types:

```typescript
import  * as A  from "@automerge/automerge/next"

let doc = A.from({
    map: { 
        key: "value",
        nested_map: {key: "value"},
        nested_list: [1]
    },
    list: ["a", "b", "c", {nested: "map"}, ["nested list"]],
    // Note we are using the `next` API for text, so text sequences are strings
    text: "some text",
    // In the `next` API non mergable strings are instances of `RawString`.
    // You should generally not need to use these. They are retained for backwards
    // compatibility
    raw_string: new A.RawString("rawstring"), 
    integer: 1,
    float: 2.3,
    boolean: true,
    bytes: new Uint8Array([1, 2, 3]),
    date: new Date(),
    counter: new A.Counter(1),
    none: null,
})

doc = A.change(doc, d => {
    // Insert 'Hello' at the begnning of the string
    A.splice(d, ["text"], 0, 0, "Hello ")
    d.counter.increment(20)
    d.map.key = "new value"
    d.map.nested_map.key = "new nested value"
    d.list[0] = "A"
    d.list.insertAt(0, "Z")
    d.list[4].nested = "MAP"
    d.list[5][0] = "NESTED LIST"
})

console.log(doc)

// Prints
// {
//   map: {
//     key: 'new value',
//     nested_map: { key: 'new nested value' },
//     nested_list: [ 1 ]
//   },
//   list: [ 'Z', 'A', 'b', 'c', { nested: 'MAP' }, [ 'NESTED LIST' ] ],
//   text: 'Hello world',
//   raw_string: RawString { val: 'rawstring' },
//   integer: 1,
//   float: 2.3,
//   boolean: true,
//   bytes: Uint8Array(3) [ 1, 2, 3 ],
//   date: 2023-09-11T13:35:12.229Z,
//   counter: Counter { value: 21 },
//   none: null
// }
```
