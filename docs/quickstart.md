---
sidebar_position: 1
---

# 5-Minute Quick Start

It's easy to build a local-first web application with real-time synchronization using Automerge. In this quickstart, we'll start with the standard `yarn create vite` example Typescript application and use Automerge to turn it into a simple local-first application.

All the code here can be found at the [automerge-repo-quickstart](https://github.com/automerge/automerge-repo-quickstart) repo.

Let's begin.

## Setup

First, let's initialize an off-the-shelf React app using Vite as our bundler. We're not going to remind you along the way, but we recommend you initialize a git repo and check in the code at whatever interval feels comfortable.

```bash 
$ yarn create vite
# Project name: hello-automerge-repo
# Select a framework: React
# Select a variant: TypeScript

$ cd hello-automerge-repo
$ yarn
```

Next, we'll add some automerge dependencies for the project. We'll introduce each of these libraries as they come up in the tutorial.

```bash
yarn add @automerge/automerge \
  @automerge/automerge-repo \
  @automerge/automerge-repo-react-hooks \
  @automerge/automerge-repo-network-broadcastchannel \
  @automerge/automerge-repo-storage-indexeddb \
  vite-plugin-wasm \
  vite-plugin-top-level-await
```

Because Vite support for WebAssembly modules (used by Automerge) currently requires configuring a plugin, replace `vite.config.ts` with the following:

```typescript
// vite.config.ts
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import wasm from "vite-plugin-wasm"
import topLevelAwait from "vite-plugin-top-level-await"

export default defineConfig({
  plugins: [topLevelAwait(), wasm(), react()],

  worker: {
    format: "es",
    plugins: [wasm()],
  },
})
```

With that out of the way, we're ready to build the application.

# Using Automerge

The central concept of Automerge is one of documents. An Automerge document is a JSON-like data structure that is kept synchronized between all communicating peers with the same document ID.

To create or find Automerge documents, we'll use a Repo. The Repo (short for repository) keeps track of all the documents you load and makes sure they're properly synchronized and stored. Let's go ahead and make one. Add the following imports to `src/main.tsx`:

```typescript
import { isValidAutomergeUrl, Repo } from '@automerge/automerge-repo'
import { BroadcastChannelNetworkAdapter } from '@automerge/automerge-repo-network-broadcastchannel'
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb"
import {next as A} from "@automerge/automerge" //why `next`? See the the "next" section of the conceptual overview
```

## Initializing a repository

Before we can start finding or creating documents, we'll need a repo. Here, we create one that can synchronize with other tabs using a sort of pseudo-network built into the browser that allows communication between tabs with the same shared origin: the BroadcastChannel.

```js
const repo = new Repo({
  network: [new BroadcastChannelNetworkAdapter()],
  storage: new IndexedDBStorageAdapter(),
})
```

## Creating (or finding) a document

Now that we have the repo, we want to either create a document if we don't have one already or we want to load a document. To keep things simple, we'll check the URL hash for a document ID, and if we don't find one, we'll start a new document and set it in the hash.

Add this code right after the repo initialization code.

```typescript
const rootDocUrl = `${document.location.hash.substr(1)}`
let handle
if (isValidAutomergeUrl(rootDocUrl)) {
    handle = repo.find(rootDocUrl)
} else {
    handle = repo.create<{counter?: A.Counter}>()
    handle.change(d => d.counter = new A.Counter())
}
const docUrl = document.location.hash = handle.url
// @ts-ignore
window.handle = handle // we'll use this later for experimentation
```

A real application would probably handle routing differently, but this is enough to get started.

## Working with the document

The main way of interacting with a Repo is through `DocHandles`, which allow you to read data from a document or make changes to it, and which emit `"change"` events whenever the document changes -- either through local actions or over the network.

Now that we have a document handle stuck onto the window, let's experiment with it. Start your application now with:

`$ yarn dev`

You won't see any changes from the default example application on screen, but we've attached an Automerge document to the `window` object, which makes it conveniently available in the Chrome debugger. 

Your new document is empty, because we just created it. Let's start by initializing a counter. Run the following command in your Chrome debugger.

```typescript
handle.change(d => { d.counter.increment(10) })
```

`DocHandle.change` allows you to modify the document managed by a `DocHandle` and takes care of storing new changes and notifying any peers of new changes.

Next, run this code to see the contents of your document. The contents will look a bit complex, but you should see a counter with a value of 10 if you poke around.

```typescript
handle.docSync()
```

Calling `DocHandle.docSync()` return the current value of the document synchronously, or returns undefined if the document is unavailable either because it is still loading, or because it can't be found. To avoid this problem, prefer the asynchronous form: `await handle.doc()`. If you want to render loading states differently from an unavailable state, you can inspect `handle.state` and branch accordingly.

## Updating your app to use Automerge

We've already created or fetched our initial document via `main.tsx`, but usually when we want to work with a document in a React application, we will refer to it by URL. Let's start by editing the call signature for `App.tsx` to pass in the URL for your newly created document, and then make it available to your component with the `useDocument` hook.

We also need to make the `repo` object we created available throughout the application, so we use a React Context provider for that. In `main.tsx`, modify the `React.render()` call to look like this:

```typescript
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RepoContext.Provider value={repo}>
      <App docUrl={docUrl}/>
    </RepoContext.Provider>
  </React.StrictMode>,
)
```

and also add another import line:

```typescript
import { RepoContext } from '@automerge/automerge-repo-react-hooks'
```

Inside `App.tsx`, add these imports:

```typescript
import {AutomergeUrl} from '@automerge/automerge-repo'
import {useDocument} from '@automerge/automerge-repo-react-hooks'
import {next as A} from "@automerge/automerge"
```

and change the first few lines to these:

```typescript
interface CounterDoc {
  counter: A.Counter
}

function App({docUrl}: {docUrl: AutomergeUrl}) {
  const [doc, changeDoc] = useDocument<CounterDoc>(docUrl)
```

Now you've got access to the document in a more native React-style way: a hook that will update every time the document changes.

Our last step here is to change our code to use these new values by replacing how we render the `button` element.

```typescript
        <button onClick={() => changeDoc((d) => d.counter.increment(1))}>
          count is { doc && doc.counter.value }
        </button>
```

Go ahead and try this out. Open a second (or third) tab with the same URL and see how as you click the counter in any tab, the others update.

If you close all the tabs and reopen them, the counter value is preserved.

Congratulations! You have a working Automerge-backed React app with live local synchronization. How does it work? We'll learn through some experimentation in the next section.

## Collaborating over the internet

The handle we have created has a URL, we can access that with `DocHandle.url`, this URL can be used to sync the document with any peer who has it. Open up your browser debugger and run `console.log(handle.url)`, this should print something that looks like `"automerge:45NuQi1e45PKsemx8GhSCu62gyag"`, make a note of this for later.

First, we'll add a network adapter to the `Repo` in our web app which syncs to a sync server via a websocket. Add the following dependency to the web app we've been building:

```bash
yarn add @automerge/automerge-repo-network-websocket
```

Then add a network adapter connecting the repo to `sync.automerge.org`

```
// main.tsx
// Add this import
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket"

...

// now update the repo definition to look like this:
const repo = new Repo({
    network: [
        new BroadcastChannelNetworkAdapter(),
        // This is the new line
        new BrowserWebSocketClientAdapter('wss://sync.automerge.org')
    ],
    storage: new IndexedDBStorageAdapter(),
})
```

This creates a repo which syncs changes it sees to `sync.automerge.org`, and any other process can connect to that server and use the URL to get the changes we've made. 

:::note

The Automerge project provides a public sync server for you to experiment with `sync.automerge.org`. This is not a private instance, and as an experimental service has no reliability or data safety guarantees. Basically, it's good for demos and prototyping, but run your own sync server for production uses.

:::

To see this in action we'll create a little node app. Change into a clean directory and run

```bash
npm create @automerge/repo-node-app amg-quickstart
cd amg-quickstart
```

Now open `index.js` and add the following:


```js
// repo is already set up by the `repo-node-app` helper
const doc = repo.find("<url copied from the debugger>")
console.log(await doc.doc())
// This is required because we don't have a way of shutting down the repo
setTimeout(() => process.exit(), 1000)
```

Now run this with `node index.js` and you should see the contents of the document.

Now add the following at the end of `index.js` (but before the setTimeout)

```js
doc.change(d => {
    d.counter.increment(1)
})
```

This change will be reflected in any connected and listening handles. Go back to the original browser window and watch it as you run `node index.js`. What you should see is that every time you run the script the counter in the browser changes.

## Saving the document

If you provide a `Repo` with a `StorageAdapter` then it will save documents for use later. In the browser we might used IndexedDB:

```js
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb"
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket"

const repo = new AutomergeRepo.Repo({
  network: [new BrowserWebSocketClientAdapter("wss://sync.automerge.org")],
  storage: new IndexedDBStorageAdapter(),
})
```

Documents will be stored in `IndexedDB` and methods like `Repo.find` will consult storage when loading. The upshot is that if you had a document locally, it will continue to be available regardless of whether you are connected to any peers.


## More

If you're hungry for more, look in the [Cookbook](/docs/cookbook/modeling-data/) section.
