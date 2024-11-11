---
sidebar_position: 3
---

# Prosemirror + VanillaJS + Automerge

Automerge supports rich text using [ProseMirror](https://prosemirror.net/). This guide will show you how to set up a simple collaborative rich text editor in a vanilla JS app; where "vanilla" means plain JavaScript without any frameworks or libraries.

We _do_ need a bundler in order to use Automerge, so we'll assume you have set up something like Vite and that you have two files, `index.html` and `main.js`.

First, put the following in `index.html`

```html title="index.html"
<!doctype html>
<html lang="en">
  <head>
    <title>Prosemirror + Automerge</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/main.js"></script>
  </body>
</html>
```

First, we need to get `automerge-repo` set up:

```js title="main.js"
import { DocHandle, Repo, isValidAutomergeUrl } from "@automerge/automerge-repo"
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb"
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket"
import { init } from "@automerge/automerge-prosemirror"

const repo = new Repo({
  storage: new IndexedDBStorageAdapter("automerge"),
  network: [new BrowserWebSocketClientAdapter("wss://sync.automerge.org")],
})
```

Now, we'll store the automerge URL for the document we are editing in the browsers URL hash. This way, we can share the URL with others to collaborate on the document.

```js title="main.js"
// Get the document ID from the URL fragment if it's there. Otherwise, create
// a new document and update the URL fragment to match.
const docUrl = window.location.hash.slice(1)
if (docUrl && isValidAutomergeUrl(docUrl)) {
  handle = repo.find(docUrl)
} else {
  handle = repo.create({ text: "" })
  window.location.hash = handle.url
}
// Wait for the handle to be available
await handle.whenReady()
```

At this point we have a document handle with a fully loaded automerge document, now we need to wire up a prosemirror editor.

```js title="main.js"
// This is the integration with automerge.
const { schema, doc, plugin } = init(handle, ["text"])

const editorConfig = {
  schema,
  plugins: [plugin],
}

// This is the prosemirror editor.
const view = new EditorView(document.querySelector("#editor"), {
  state: EditorState.create({
    doc, // Note that we initialize using the mirror
    plugins: exampleSetup({ schema, plugins: [plugin] }),
  }),
})
```

Now, you can open `index.html` in your browser and start editing the document. If you open the same URL in another browser window, you should see the changes you make in one window reflected in the other.
