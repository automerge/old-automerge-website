# Automerge Repo 2.0

Automerge Repo was built to improve the developer experience of building Automerge applications by taking common patterns in Automerge applications and packaging them as a reusable library. This has worked really well, getting storage and networking up and running with Automerge Repo is very quick. We wanted to repeat the trick.

Over the last year we've been working on taking advantage of the rich history which Automerge records in order to build sophisticated version control workflows for general data types. In doing this we encountered a variety of common tasks related to examining the history of a document which have to be done in userland - so we've added these methods to Automerge Repo.

At the same time, we've also noticed a number of papercuts which lead to extra boilerplat in Automerge Repo applications. Firstly `Repo.find` returns a `DocHandle` immediately and the caller is responsible for waiting until it is ready. Secondly, there are a lot of different packages to install in order to get up and running with common network and storage setups. We've tried to address all of these, read on for more details.

## `find` and `findWithProgress`

One of the biggest changes is that `Repo.find` is now asynchronous, returning a `Promise<DocHandle<T>>` which resolves to a `DocHandle` which is ready to use. This is in contrast to the 1.0 API which immediately returned a `DocHandle<T>`, but then required you to wait until the `DocHandle` was ready before actually trying to access the document the handle represents. This simplifies a lot of code and removes some footguns.

This

```typescript
const handle = repo.find(<url>)
await handle.whenReady()
console.log(handle.docSync())
```

becomes

```typescript
const handle = await repo.find(<url>)
console.log(handle.doc())
```

Sometimes though, you don't want to await the result of `find`. Maybe you are not in an asynchronous context, or maybe you want to have some indication of the progress a request is making. For this you can use the new `Repo.findWithProgress`. This method returns a `FindProgress<T>` which is a little state machine that steps through the various stages of looking for a document (loading from storage, requesting from the network, ready, unavailable, etc.). This allows you to build more complex loading UIs.

## DocHandle version control methods

Automerge records the entire history of a document at a granular level and this is what allows us to build sophisticated version control on top of it. To date, the API to achieve these things has been a little low level. In Automerge Repo 2.0 we implement a few routines which are common to most applications.

* `DocHandle.view(<heads>)` returns a `DocHandle` which is "frozen" at the point in time represented by `heads`
* `DocHandle.history()` returns an array of Automerge URLs which can be passed to `DocHandle.view(<url>)` 
* `DocHandle.diff(<url | DocHandle>)` takes either a URL returned by `history` or another `DocHandle` and produces a set of patches representing the diff.

This can be used like so:

```typescript
const current = repo.find(<url>)
const history = current.history()
// now go back one step in history
const lastVersion = current.view(history[history.len() - 1])
// Get the diff 
const diff = lastVersion.diff(original)
// Now visualise the diff somehow (in a text editor you might do a line based diff for example)
visualiseDiff(diff)
```

For an example of how to use these APIs to build a "rewind" bar, take a look at [the `rewind` branch of the quickstart repo](https://github.com/automerge/automerge-repo-quickstart/tree/rewind)

## Suspense Support for React

The React hooks now have support for suspense. To use it, simply pass `{ suspense: true }` as the second argument to the hook. One nice benefit of this approach is that you don't need to worry about checking if the document is initialized: if

* `useHandle` is now called `useDocHandle` and integrates with React suspense.
* Added `useHandles` to load many handles at once
* `useDocument` and `useDocuments` now integrate with React suspense so you don't need to have special code to handle the loading state

## React and Vanilla JS meta packages

Automerge is designed for modularity; a powerful CRDT at the core and an extensible document management system built to allow you to bring your own storage and networking.

There are a bunch of packages in the `automerge-repo` ecosystem which most applications need. For example, a typical react application will start with this code:

```typescript
import { Repo } from "@automerge/automerge-repo"
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket"
import { BroadcastChannelNetworkAdapter } from "@automerge/automerge-repo-network-broadcastchannel"
import { IndexedDbStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb"
import { useDocument, useDocuments, useHandle, useHandles } from "@automerge/automerge-repo-react-hooks"
```

This is a lot of boilerplate and a lot of separate packages to install and update. To reduce this noise we've created two packages which just re-export these names - one for React applications and one for vanilla JS applications. 

A react application now looks a bit like this:

```typescript
import {
    Repo,
    WebSocketClientAdapter,
    IndexedDbStorageAdapter,
    useDocument
} from "@automerge/react"

// Create a pre-configured repo instance
const repo = Repo({
  network: [new WebSocketClientAdapter("ws://localhost:8080")]
  storage: new IndexedDbStorageAdapter()
})

// Use in your React components
function MyComponent() {
  const doc = useDocument(repo, "my-doc-id")

  if (!doc) return <div>Loading...</div>

  return <div>{doc.content}</div>
}

```

Whilst a vanilla app would look like

```typescript
import {
  Repo,
  MessageChannelNetworkAdapter,
  IndexedDBStorageAdapter,
  WebSocketClientAdapter,
} from "@automerge/vanillajs"

// Create a repo with your chosen adapters
const repo = new Repo({
  network: [
    new MessageChannelNetworkAdapter(/* your message channel to another repo here */),
    new IndexedDBStorageAdapter(),
    new WebSocketClientAdapter("wss://sync.automerge.org"),
  ],
})

// rest of the application
```

## Papercuts

* The `BrowserWebSocketClientAdapter` and `NodeWSServerAdapter`s are now called `WebSocketClientAdapter` and `WebSocketServerAdpater` respectively
* Updated the svelte integration to Svelte 5
