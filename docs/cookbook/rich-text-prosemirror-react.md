---
sidebar_position: 2
---

# Prosemirror + React + Automerge

Automerge supports rich text editing on top of [ProseMirror](https://prosemirror.net/). This guide will show you how to set up a simple collaborative rich text editor in React using Automerge and ProseMirror.

All the code here can be found at https://github.com/automerge/automerge-prosemirror/examples/react

First, create a an example vite app using the `@automerge/vite-app` template. This will give you a basic React app with the Automerge dependencies already installed.

```bash
yarn create @automerge/vite-app
```

Then install our prosemirror dependencies


```bash
yarn add @automerge/prosemirror prosemirror-example-setup prosemirror-model prosemirror-state prosemirror-view
```

Now, the app created by `@automerge/vite-app` creates a document which contains a `Counter`, but we want a `string` which will contain the text. Modify `main.tsx` so that the handle initialization logic looks like this:

```jsx title="src/main.tsx"
...
let handle
if (isValidAutomergeUrl(rootDocUrl)) {
  handle = repo.find(rootDocUrl)
} else {
  handle = repo.create({text: ""})
}
...
```

First, let's create a basic skeleton component which just loads the document handle. The prosemirror bindings require that the document handle be loaded before we begin, so we'll add a bit of boilerplate to achieve this:

```jsx title="src/App.tsx"
import { AutomergeUrl } from "@automerge/automerge-repo"
import { useHandle } from "@automerge/automerge-repo-react-hooks"
import { useEffect, useState } from "react"

function App({ docUrl }: { docUrl: AutomergeUrl }) {
  const handle = useHandle<{text: string}>(docUrl)
  const [loaded, setLoaded] = useState(handle && handle.docSync() != null)
  useEffect(() => {
    if (handle != null) {
      handle.whenReady().then(() => {
        if (handle.docSync() != null) {
          setLoaded(true)
        }
      })
    }
  }, [handle])

  return <div id="editor"></div>
}

export default App
```

Now, we're going to create a ProseMirror editor. Prosemirror manages its own UI and state, it just needs to be attached to the DOM somehow. To achieve this we'll use the `useRef` hook to get hold of a reference to a dom element inside a React component which we can pass to prosemirror.

```jsx title="src/App.tsx"
import { AutomergeUrl } from "@automerge/automerge-repo"
import { useHandle } from "@automerge/automerge-repo-react-hooks"
// highlight-start
import { useEffect, useRef, useState } from "react"
import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {exampleSetup} from "prosemirror-example-setup"
import { AutoMirror } from "@automerge/prosemirror"
import "prosemirror-example-setup/style/style.css"
import "prosemirror-menu/style/menu.css"
import "prosemirror-view/style/prosemirror.css"
import "./App.css"
// highlight-end

function App({ docUrl }: { docUrl: AutomergeUrl }) {
  const editorRoot = useRef<HTMLDivElement>(null)
  const handle = useHandle<{text: string}>(docUrl)
  const [loaded, setLoaded] = useState(handle && handle.docSync() != null)
  useEffect(() => {
    if (handle != null) {
      handle.whenReady().then(() => {
        if (handle.docSync() != null) {
          setLoaded(true)
        }
      })
    }
  }, [handle])

  // highlight-start
  const [view, setView] = useState<EditorView | null>(null)
  useEffect(() => {
    // We're not using this for anything yet, but this `AutoMirror` object is
    // where we will integrate prosemirror with automerge
    const mirror = new AutoMirror(["text"])
    if (editorRoot.current != null && loaded) {
      const view = new EditorView(editorRoot.current, {
        state: EditorState.create({
          schema: mirror.schema, // It's important that we use the schema from the mirror
          plugins: exampleSetup({schema: mirror.schema}),
          doc: mirror.initialize(handle!, ["text"])
        }),
      })
      setView(view)
    }
    return () => {
      if (view) {
        view.destroy()
        setView(null)
      }
    }
  }, [editorRoot, loaded])
  // highlight-end

  return <div id="editor" ref={editorRoot}></div>
}

export default App
```

At this point if you run the application you'll find that there's a working prosemirror editor but it looks rubbish. Add the following to `src/App.css` and things will look a lot better:

```css title="src/App.css"
#root {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
  display:flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
}

/* center the editor inside the #root */
#editor {
  margin: 0 auto;
  width: 100%;
  max-width: 800px;
  flex: 1;
  background-color: #f8f9fa;
  color: #333;
}
```

Alright, now we're ready to collaborate.

Update `src/App.tsx` with the following changes:

```jsx title="src/App.tsx"
import { AutomergeUrl, DocHandleChangePayload } from "@automerge/automerge-repo"
import { useHandle } from "@automerge/automerge-repo-react-hooks"
import { useEffect, useRef, useState } from "react"
import {EditorState, Transaction} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {exampleSetup} from "prosemirror-example-setup"
import { AutoMirror } from "@automerge/prosemirror"
import "prosemirror-example-setup/style/style.css"
import "prosemirror-menu/style/menu.css"
import "prosemirror-view/style/prosemirror.css"
import "./App.css"

function App({ docUrl }: { docUrl: AutomergeUrl }) {
  const editorRoot = useRef<HTMLDivElement>(null)
  const handle = useHandle<{text: string}>(docUrl)
  const [loaded, setLoaded] = useState(handle && handle.docSync() != null)
  useEffect(() => {
    if (handle != null) {
      handle.whenReady().then(() => {
        if (handle.docSync() != null) {
          setLoaded(true)
        }
      })
    }
  }, [handle])

  const [view, setView] = useState<EditorView | null>(null)
  useEffect(() => {
    // We're not using this for anything yet, but this `AutoMirror` object is
    // where we will integrate prosemirror with automerge
    const mirror = new AutoMirror(["text"])
    // highlight-start
    let view: EditorView // We need a forward reference to use next
    // This is a callback which will update the prosemirror view whenever the document changes
    const onPatch: (args: DocHandleChangePayload<unknown>) => void = ({
      doc,
      patches,
      patchInfo,
    }) => {
      const newState = mirror.reconcilePatch(
        patchInfo.before,
        doc,
        patches,
        view!.state,
      )
      view!.updateState(newState)
    }
    // highlight-end
    if (editorRoot.current != null && loaded) {
      view = new EditorView(editorRoot.current, {
        state: EditorState.create({
          schema: mirror.schema, // It's important that we use the schema from the mirror
          plugins: exampleSetup({schema: mirror.schema}),
          doc: mirror.initialize(handle!, ["text"]),
        }),
        // highlight-start
        // Here we're intercepting the prosemirror transaction and feeding it through the AutoMirror
        dispatchTransaction: (tx: Transaction) => {
          const newState = mirror.intercept(handle!, tx, view!.state)
          view!.updateState(newState)
        },
        // highlight-end
      })
      setView(view)
      // highlight-next-line
      handle!.on("change", onPatch)
    }
    return () => {
      // highlight-start
      // we have to remove the listener when tearing down
      if (handle != null) {
        handle.off("change", onPatch)
      }
      // highlight-end
      setView(null)
      if (view != null) {
        view.destroy()
      }
    }
  }, [editorRoot, loaded])

  return <div id="editor" ref={editorRoot}></div>
}

export default App
```

Now, you can load up the app in a different tab, or a different browser (the URL will contain a document URL after the `#`), and you can see changes being merged from one side to the other.
