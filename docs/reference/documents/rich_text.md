---
sidebar_position: 5
---

# Rich Text

As well as [supporting](../text) plain text Automerge supports rich text editing. The rich text APIs are extensions of the plain text API. In addition to using `splice` and `updateText` to modify a string, we also provide functions to manipulate two extra data types which are associated with a string:

* Marks: formatting spans which apply to a range of characters and can overlap
* Block markers which divide the text into blocks

## Marks

Marks represent things like bold or italic text, or inline elements such as hyperlinks. Every mark has a name - such as "bold" - and a value, which must be a primitive value such as a boolean or string. 

When you create a mark you must decide how that mark will behave when characters are inserted at its boundaries. For example, bold marks typically expand when characters are inserted at the boundaries whilst a hyperlink normally wouldn't.

To create a mark, call `Automerge.mark` with the start and end of the range, the name of the mark, the value of the mark, and an `expand` option. You can obtain the set of active marks on a string by calling `Automerge.marks`.

```typescript
import * as Automerge from "@automerge/automerge"

let doc = Automerge.from({text: "hello world"})

Automerge.change(doc, d => {
    Automerge.mark(d, ["text"], {start: 0, end: 5, expand: "both"}, "bold", true)
})

console.log(Automerge.marks(doc, ["text"]))

>> [ { name: 'bold', value: true, start: 0, end: 5 } ]
```

Here we can see that the bold span applies to the "hello".

It is up to your application to decide what different mark names mean, but if you are interested in interoperability consider adopting our [rich text schema](../../under-the-hood/rich_text_schema).

## Block Markers

Block markers are maps which are inserted inline in the text. They are used to divide text into structural roles such as paragraphs, headings, or code blocks. The underlying primitive of a block marker is very flexible, so specific editor integrations can use it however they like. The `automerge-prosemirror` bindings use the [rich text schema](../../under-the-hood/rich_text_schema).

Block markers can be created using `Automerge.splitBlock` and updated using `Automerge.updateBlock` and you can find the active block at a given index using `Automerge.block`.

## The Spans API

### Reading spans

Frequently working directly with block markers and spans is tedious. You can use `Automerge.spans` to retrieve a sequence of text spans grouped by their marks and interspersed with block markers. For example


```typescript
import  * as Automerge  from "@automerge/automerge"

let doc = Automerge.from({text: ""})

doc = Automerge.change(doc, d => {
    // Insert an opening paragraph block
    Automerge.splitBlock(d, ["text"], 0, {type: "paragraph", parents: []})
    // Note that the block markers appear inline in the text and so to insert 
    // _after_ the block marker we need to insert at position 1
    Automerge.splice(d, ["text"], 1, 0, "Hello")
    // Insert another paragraph
    Automerge.splitBlock(d, ["text"], 6, {type: "paragraph", parents: []})
    Automerge.splice(d, ["text"], 7, 0, "world")

    // Add a mark which covers the end of "hello" and the start of "world"
    Automerge.mark(d, ["text"], {start: 4, end: 8, expand: "both"}, "bold", true)
})

console.log(Automerge.spans(doc, ["text"]))
```

And this outputs:

```javascript
[
  { type: 'block', value: { parents: [], type: 'paragraph' } },
  { type: 'text', value: 'Hel' },
  { type: 'text', value: 'lo', marks: { bold: true } },
  { type: 'block', value: { type: 'paragraph', parents: [] } },
  { type: 'text', value: 'w', marks: { bold: true } },
  { type: 'text', value: 'orld' }
]
```

Here you can see that the text has been broken up into sections with distinct spans and separated by block markers.

### Updating spans

When writing an editor integration it's often difficult to capture exactly what change has been made by the underlying editor you are integrating with. In these cases you can use `Automerge.updateSpans` to update the block structure of the text. This function takes a sequence of spans and block markers - just like that output by `Automege.spans` - and attempts to perform a minimal diff to update the text to the new structure. 

:::warning
One important note: `Automerge.updateSpans` does not yet update the formatting spans of the text, just the block structure. You will need to separately reconcile the formatting span changes.
:::

For example, let's say we want to add a new paragraph marker in the string "hello world".

```javascript
import  * as Automerge  from "@automerge/automerge"

let doc = Automerge.from({text: "hello world"})

doc = Automerge.change(doc, d => {
    Automerge.updateSpans(d, ["text"], [
        { type: "text", value: "hello" },
        { type: "block", value: { type: "paragraph", parents: [] } },
        { type: "text", value: "world" }
    ])
})

console.log(Automerge.spans(doc, ["text"]))
```

This will output:


```javascript
[
  { type: 'text', value: 'hello' },
  { type: 'block', value: { type: 'paragraph', parents: [] } },
  { type: 'text', value: 'world' }
]
```

`updateSpans` will try and perform minimal updates to block markers and text.
