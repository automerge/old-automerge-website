---
sidebar_position: 5
---
# Text

`Automerge.Text` provides support for collaborative text editing. Under the hood, text is
represented as a list of characters, which is edited by inserting or deleting individual characters.
Compared to using a regular JavaScript array, `Automerge.Text` offers better performance.

> **Note:** Technically, text should be represented as a list of
> [Unicode _grapheme clusters_](http://www.unicode.org/reports/tr29/). What the user thinks of as a
> "character" may actually be a series of several Unicode code points, including accents,
> diacritics, and other combining marks. A grapheme cluster is the smallest editable unit of text:
> that is, the thing that gets deleted if you press the delete key once, or the thing that the
> cursor skips over if you press the right-arrow key once. Emoji make a good test case, since many
> emoji consist of a sequence of several Unicode code points (for example, the
> [skintone modifier](http://www.unicode.org/reports/tr51/) is a combining mark).

You can create a Text object inside a change callback. Then you can use `insertAt()` and
`deleteAt()` to insert and delete characters (same API as for list modifications, shown
[above](#updating-a-document)):

```js
newDoc = Automerge.change(currentDoc, doc => {
  doc.text = new Automerge.Text()
  doc.text.insertAt(0, 'h', 'e', 'l', 'l', 'o')
  doc.text.deleteAt(0)
  doc.text.insertAt(0, 'H')
})
```

To inspect a text object and render it, you can use the following methods (outside of a change
callback):

```js
newDoc.text.length // returns 5, the number of characters
newDoc.text.get(0) // returns 'H', the 0th character in the text
newDoc.text.toString() // returns 'Hello', the concatenation of all characters
for (let char of newDoc.text) console.log(char) // iterates over all characters
```

To figure out which regions were inserted by which users, you can use the elementId. The ElementID gives is a string of the form `${actorId}@${counter}`. Here, actorId is the ID of the actor who inserted that character.

```js
let elementId = newDoc.text.getElemId(index)
// '2@369125d35a934292b6acb580e31f3613'
```  

Note that the actorId changes with each call to `Automerge.init()`.
