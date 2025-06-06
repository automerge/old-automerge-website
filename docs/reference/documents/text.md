---
sidebar_position: 4
---

# Text

Automerge provides support for collaborative text editing. Under the hood, whenever you create a `string` in Automerge you are creating a collaborative text object which supports merging concurrent changes to the `string`.

:::note
This is only true in the `next` API. In the original API collaborative text was represented by the `Automerge.Text` class. See the [next API](../../the_js_packages#the-next-api) section for more details.
:::

If you want changes to a `string` to be collaborative, you should use `Automerge.splice` to modify the string.

```js
import { next as Automerge } from "@automerge/automerge"

let doc = Automerge.from({text: "hello world"})

// Fork the doc and make a change
let forked = Automerge.clone(doc)
forked = Automerge.change(forked, d => {
    // Insert ' wonderful' at index 5, don't delete anything
    Automerge.splice(d, ["text"], 5, 0, " wonderful")
})

// Make a concurrent change on the original document
doc = Automerge.change(doc, d => {
    // Insert at the start, delete 5 characters (the "hello")
    Automerge.splice(d, ["text"], 0, 5, "Greetings")
})

// Merge the changes
doc = Automerge.merge(doc, forked)

console.log(doc.text) // "Greetings wonderful world"
```

## Using `updateText` when you can't use `splice`

`splice` works in terms of low level input events, sometimes it's hard to get hold of these. For example, in a simple web form the `input` event is fired every time an `input` element changes, but the value of the event is the whole content of the text box. In this case you can use `Automerge.updateText`, which will figure out what has changed for you and convert the changes into `splice` operations internally.

Imagine you have a simple text box:

```html
<input id="myInput" type="text" value="hello world">
```

Then with this HTML you can use `updateText` to make the text box collaborative:

```typescript

const handle: DocHandle<{text: string}> = ... // some how get a DocHandle

const input = document.getElementById("input")!

input.value = handle.docSync()!.text!

// On every keystroke use `updateText` to update the value of the text field
input.oninput = (e) => {
    handle.change((doc) => {
        // @ts-ignore
        const newValue: string = e.target.value
        console.log("newValue", newValue)
        am.updateText(doc, ["text"], newValue)
    })
}

// Any time the document changes, update the value of the text field
handle.on("change", () => {
    // @ts-ignore
    input.value = handle.docSync()!.text!
})
```

:::warning
`updateText` works best when you call it as frequently as possible. If the text has changed a lot between calls to `updateText` (for example if you were calling it in `onchange`) the diff will not merge well with concurrent changes. The best case is to call it after every keystroke.
:::
