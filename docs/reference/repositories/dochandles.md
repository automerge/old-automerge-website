---
sidebar_position: 3
---

# `DocHandle`s

Once you have a `Repo` with a `NetworkAdapter` and a `StorageAdapter` you can get down to the business of creating and working with [`DocHandle`](https://automerge.org/automerge-repo/classes/_automerge_automerge_repo.DocHandle.html)s.

It's useful to understand a little about why we need a `DocHandle`. `@automerge/automerge` documents are fairly inert data structures. You can create a document, you can mutate it, you can generate sync messages to send elsewhere and you can receive sync messages from elsewhere. None of this is very "live" though. Because the document has no concept of a network, or of storage, you can't say "every time I change a document, tell everyone else about it and save the change to storage". This "live document" is what a `DocHandle` is. A `DocHandle` is a wrapper around a document managed by a `Repo`. It provides the following kinds of "liveness":

- Whenever you change the document using [`DocHandle.change`](https://automerge.org/automerge-repo/classes/_automerge_automerge_repo.DocHandle.html#change) or [`DocHandle.changeAt`](https://automerge.org/automerge-repo/classes/_automerge_automerge_repo.DocHandle.html#changeAt) the changes will be saved to the attached `StorageAdapter` and sent to any connected `NetworkAdapter`s
- Whenever a change is received from a connected peer the `DocHandle` will fire a "change" event
- There is a concept of an ephemeral message, which you can send using `DocHandle.broadcast`. Whenever a `DocHandle` receives an ephemeral message it will fire a `"ephemeral-message"` event
- You can wait for a `DocHandle` to be loaded, or to be retrieved from another peer
- `DocHandle`s have a `URL`, which can be used to uniquely refer to the document it wraps when requesting it from another peer

`DocHandle`s are very useful, how do you obtain one?

## Creating a `DocHandle`

This is the easy one, just call [`Repo.create`](https://automerge.org/automerge-repo/classes/_automerge_automerge_repo.Repo.html#create). This creates a new document, stores it, and then enqueues messages to all connected peers informing them of the new document.

## Waiting for a `DocHandle`

Typically you are _not_ creating a new document, but working with an existing one. Maybe the document URL was stored in `localStorage`, maybe the URL was in the hash fragment of the browser, etc. In this case you use [`Repo.find`](https://automerge.org/automerge-repo/classes/_automerge_automerge_repo.Repo.html#find) to lookup the document. This means the `DocHandle` can be in several different states, to understand this we'll first look at the states in detail, then some convenience methods `DocHandle` exposes for waiting for different states.

### `DocHandle` states

`Repo.find` will do two things simultaneously:

- Look in the attached `StorageAdapter` to see if we have any data for the document
- Send a request to any connected peers to ask if they have the document

These actions are asynchronous, as they complete the state of the document changes. This state is represented most explicitly in the [`HandleState`](https://automerge.org/automerge-repo/enums/_automerge_automerge_repo.HandleState.html) enum, which has the following states:

- `IDLE` - This is really just a start state, every dochandle immediately transitions to another state
- `AWAITING_NETWORK` - in this state we are waiting for the `NetworkAdapter`s to be ready to process messages. This typically occurs at application startup. Most `NetworkAdapter`s have an asynchronous startup period. The `Repo` waits until every `NetworkAdapter` has emitted a `ready` event before beginning to request documents
- `LOADING` - we are waiting for storage to finish trying to load this document
- `REQUESTING` - we are waiting to hear back from other peers about this document
- `READY` - The document is available, either we created it, found it in storage, or someone sent it to us
- `DELETED` - The document was removed from the repo
- `UNAVAILABLE` - We don't have the document in storage and none of our peers have the document either

The transitions between these states look like this:

```mermaid
stateDiagram-V2
    direction LR
    [*] --> LOADING: Repo.find
    [*] --> READY: Repo.create
    LOADING --> AWAITING_NETWORK
    AWAITING_NETWORK --> REQUESTING: network ready
    AWAITING_NETWORK --> DELETED
    LOADING --> READY: found in storage
    LOADING --> REQUESTING: not found in storage
    LOADING --> UNAVAILABLE: no peers had the doc
    LOADING --> DELETED
    UNAVAILABLE --> READY: Received sync for this doc
    UNAVAILABLE --> DELETED
    REQUESTING --> READY: Received sync for this doc
    READY --> DELETED
```

Note that every state can transition to `DELETED`, either via `DocHandle.delete` or `Repo.delete`.

One other point to note is that a `DocHandle` can be unavailable because we didn't have it in storage and no peers responded to our request for it, but then another peer comes online and sends us sync messages for the document and so it transitions to `READY`.

You can check what state a handle is in using [`DocHandle.inState`](https://automerge.org/automerge-repo/classes/_automerge_automerge_repo.DocHandle.html#inState).

### Waiting for a handle to be ready

If all we care about is whether the document is ready then we can use a few different methods.

- `DocHandle.isReady()` is a synchronous method which will return `true` if the document is ready
- `DocHandle.whenReady()` is an asynchronous method that will return when the handle is ready
- `DocHandle.doc()` is an asynchronous method which will return the value of the document when it is ready
- `DocHandle.docSync()` is a synchronous method which returns the value of the document if it is ready. This method _will throw if the handle is not ready_. Therefore you should guard calls to `docSync` with calls to `isReady`

Once the document is ready the value of the document (either `DocHandle.doc()` or `DocHandle.docSync()`) will be `undefined` if the document was unavailable, but otherwise will be an automerge document.
