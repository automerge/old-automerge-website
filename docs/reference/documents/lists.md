---
sidebar_position: 3
---

# Lists

JavaScript Arrays are fully supported in Automerge. You can use `push`, `unshift`, `insertAt`, `deleteAt`, `splice`, loops, and nested objects.

```js
newDoc = Automerge.change(currentDoc, (doc) => {
  doc.list = []; // creates an empty list object
  doc.list.push(2, 3);
  doc.list.unshift(0, 1); // unshift() adds elements at the beginning
  doc.list[3] = Math.PI; // overwriting list element by index
  // now doc.list is [0, 1, 2, 3.141592653589793]
  // Looping over lists works as you'd expect:
  for (let i = 0; i < doc.list.length; i++) doc.list[i] *= 2;
  // now doc.list is [0, 2, 4, 6.283185307179586]
  doc.list.splice(2, 2, "automerge");
  // now doc.list is [0, 'hello', 'automerge', 4]
  doc.list[4] = { key: "value" }; // objects can be nested inside lists as well
  // Arrays in Automerge offer the convenience functions `insertAt` and `deleteAt`
  doc.list.insertAt(1, "hello", "world"); // inserts elements at given index
  doc.list.deleteAt(5); // deletes element at given index
  // now doc.list is [0, 'hello', 'world', 2, 4]
});
```

If you have previously worked with immutable state in JavaScript, you might be in the habit of
using [idioms like these](https://redux.js.org/recipes/structuring-reducers/updating-normalized-data):

```js
state = Automerge.change(state, "Add card", (doc) => {
  const newItem = { id: 123, title: "Rewrite everything in Rust", done: false };
  doc.cards = {
    ids: [...doc.cards.ids, newItem.id],
    entities: { ...doc.cards.entities, [newItem.id]: newItem },
  };
});
```

While this pattern works fine outside of Automerge, please **don't do this in Automerge**! Please
use mutable idioms to update the state instead, like this:

```js
state = Automerge.change(state, "Add card", (doc) => {
  const newItem = { id: 123, title: "Rewrite everything in Rust", done: false };
  doc.cards.ids.push(newItem.id);
  doc.cards.entities[newItem.id] = newItem;
});
```

Even though you are using mutating APIs, Automerge ensures that the code above does not actually
mutate `state`, but returns a new copy of `state` in which the changes are reflected. The problem
with the first example is that from Automerge's point of view, you are replacing the entire
`doc.cards` object (and everything inside it) with a brand new object. Thus, if two users
concurrently update the document, Automerge will not be able to merge those changes (instead, you
will just get a conflict on the `doc.cards` property).

You can avoid this problem by making the changes at a fine-grained level: adding one
item to the array of IDs with `ids.push(newItem.id)`, and adding one item to the map of entities
with `entities[newItem.id] = newItem`. This code works much better, since it tells Automerge
exactly which changes you are making to the state, and this information allows Automerge to deal
much better with concurrent updates by different users.

As a general principle with Automerge, you should make state updates at the most fine-grained
level possible. Don't replace an entire object if you're only modifying one property of that
object; just assign that one property instead.
