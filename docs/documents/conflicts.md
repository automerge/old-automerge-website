---
sidebar_position: 5
---

# Conflicts

Automerge allows different nodes to independently make arbitrary changes to their respective copies
of a document. In most cases, those changes can be combined without any trouble. For example, if
users modify two different objects, or two different properties in the same object, then it is
straightforward to combine those changes.

## What is a Conflict?

If users concurrently insert or delete items in a list (or characters in a text document), Automerge
preserves all the insertions and deletions. If two users concurrently insert at the same position,
Automerge will ensure that on all nodes the inserted items are placed in the same order.

The only case Automerge cannot handle automatically, because there is no well-defined resolution, is
**when users concurrently update the same property in the same object** (or, similarly, the same
index in the same list). In this case, Automerge picks one of the concurrently written
values as the "winner", and it ensures that this winner is the same on all nodes:

```js
// Create two different documents
let doc1 = Automerge.change(Automerge.init(), (doc) => {
  doc.x = 1;
});
let doc2 = Automerge.change(Automerge.init(), (doc) => {
  doc.x = 2;
});
doc1 = Automerge.merge(doc1, doc2);
doc2 = Automerge.merge(doc2, doc1);
// Now, we can't tell which value doc1.x and doc2.x are going to assume --
// the choice is random. However, what's for certain is that they are equal.
assert.deepEqual(doc1, doc2);
```

Although only one of the concurrently written values shows up in the object, the other values are
not lost. They are merely relegated to a conflicts object. Suppose `doc.x = 2` is chosen as the
"winning" value:

```js
doc1; // {x: 2}
doc2; // {x: 2}
Automerge.getConflicts(doc1, "x"); // {'1@01234567': 1, '1@89abcdef': 2}
Automerge.getConflicts(doc2, "x"); // {'1@01234567': 1, '1@89abcdef': 2}
```

Here, we've recorded a conflict on property `x`. The object returned by `getConflicts` contains the
conflicting values, both the "winner" and the "loser". You might use the information in the
conflicts object to show the conflict in the user interface. The keys in the conflicts object are
the internal IDs of the operations that updated the property `x`.

The next time you assign to a conflicting property, the conflict is automatically considered to be
resolved, and the conflict disappears from the object returned by `Automerge.getConflicts()`.

Automerge uses a combination of LWW (last writer wins) and multi-value register. By default, if you read from `doc.foo` you will get the LWW semantics, but you can also see the conflicts by calling `Automerge.getConflicts(doc, 'foo')` which has multi-value semantics.

Every operation has a unique operation ID that is the combination of a counter and the actorId that generated it. Conflicts are ordered based on the counter first (using the actorId only to break ties when operations have the same counter value).
