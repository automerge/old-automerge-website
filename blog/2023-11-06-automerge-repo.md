# Automerge-Repo: A "batteries-included" toolkit for building local-first applications

Today we are announcing our new library, [`automerge-repo`](https://github.com/automerge/automerge-repo), which makes it vastly easier to build local-first applications with Automerge. Take a look at our [quickstart guide](/docs/quickstart) or read on for some background and examples.

For those new to this idea: local-first applications are a way of building software that allows both real-time collaboration (think Google Docs) and offline working (think Git). They work by storing the user's data locally, on their own device, and syncing it with collaborators in the background. You can read more about the motivation for local-first software [in our essay](https://inkandswitch.com/local-first/), or watch a [talk introducing the idea](https://www.youtube.com/watch?v=PHz17gwiOc8).

A challenge in local-first software is how to merge edits that were made independently on different devices, and [CRDTs](https://crdt.tech/) were developed to solve this problem. Automerge is a fairly mature CRDT implementation. In fact, we wrote this blog post using it! The API is quite low-level though, and Automerge-Core has no opinion about how networking or storage should be done. Often, the first thing developers ask after discovering Automerge was how to connect it into an actual application.

Our new library, `automerge-repo`, extends the collaboration engine of Automerge-Core with networking and storage adapters, and provides integrations with React and other UI frameworks. You can get to building your app straight away by taking advantage of default implementations that solve common problems such as how to send binary data over a WebSocket, how often to send synchronization messages, what network format to use, or how to store data in places like the browser's IndexedDB or on the filesystem.

If you've been intimidated by the effort of integrating Automerge into your application because of these choices, this library is for you. Now you can simply create a repo, point it to a sync server, and get to work on your app.

## `automerge-repo`: a simple example

Let's start by taking a look at a simple example of how `automerge-repo` works. To begin, create and configure a repository for Automerge documents.

```
const repo = new Repo({
  storage: new IndexedDBStorageAdapter("automerge-demo"),
  network: [new WebsocketClientNetworkAdapter("wss://sync.automerge.org")]
})
```

The code in the example above creates a repository and adds a storage and network adapter to it. It tells `automerge-repo` to store all changes in an IndexedDB table called `automerge-demo` and to synchronize documents with the WebSocket server at `sync.automerge.org`. The library is designed to support a wide variety of network transports, and we include a simple client/server WebSocket adapter out of the box. Members of the community are already adding support for other transports, such as WebRTC.

In this example we're connecting to the public test server hosted by the Automerge team, but you can also run your own sync server. In fact, our [sync server](https://github.com/automerge/automerge-repo-sync-server) runs almost the same code as above, but with a different network and storage adapter.

:::note

The Automerge project provides a public sync server for you to experiment with `sync.automerge.org`. This is not a private instance, and as an experimental service has no reliability or data safety guarantees. Basically, it's good for demos and prototyping, but run your own sync server for production uses.

:::

Next, create a document and make some changes to it:

```
   > const handle = repo.create()
   > handle.change(doc => { doc.hello = "World." })
   > console.log(handle.url)
   automerge:2j9knpCseyhnK8izDmLpGP5WMdZQ
```

The code logs a URL to the document you created. On another computer, or in another browser, you could load this document using the same URL, as shown below:

```
   > const handle = repo.find("automerge:2j9knpCseyhnK8izDmLpGP5WMdZQ")
   > console.log(await handle.doc())
   // why don't you try it and find out?
```

What's happening here to make all this work? `automerge-repo` wraps the core Automerge library and handles all the work of moving the bytes around to make your application function.

## Key Concepts & Basic Usage

Let's go into a bit more detail. For full documentation please see [the docs](https://automerge.org/docs/repositories/).

### Repo

Create a repo by initializing it with an optional storage plugin and any number of network adapters. These are the options for initializing a repo:

```
export interface RepoConfig {
  // A unique identifier for this peer, the default is a random id
  peerId?: PeerId
  // Something which knows how to store and retrieve binary blobs
  storage?: StorageAdapter
  // Something which knows how to send and receive sync messages
  network: NetworkAdapter[]
  // A function which determines whether to share a document with a peer
  sharePolicy?: SharePolicy
}
```

Don't let the usage of "peer" confuse you into thinking this is limited to peer to peer connectivity, `automerge-repo` works with both client-server and peer-to-peer network transports.

The main methods on Repo are `find(url)` and `create()`, both of which return a `DocHandle` you can work with.

### Handle & Automerge URLs

A `DocHandle` is a reference to an Automerge document that a `Repo` syncs and stores . The `Repo` instance saves any changes you make to the document and syncs with connected peers. Likewise, you can listen over the network to a `Repo` for any changes it received.

Each `DocHandle` has a `.url` property. This is a string which uniquely identifies a document in the form `automerge:<base58 encoded bytes>`. Once you have a URL you can use it to request the document from other peers.

### `DocHandle.doc()` and `DocHandle.docSync()`

These two methods return the current state of the document. `doc()` is an asynchronous method that resolves when a repository loads the document from storage or retrieves it from a peer (whichever happens first), and `docSync()` is a synchronous method that assumes the document is already available.
The examples below illustrate asynchronously loading a document or synchronously loading a document and then interacting with it:

```
> const handle = repo.find("automerge:2j9knpCseyhnK8izDmLpGP5WMdZQ")
> const doc = await handle.doc()
> console.log(doc)
```

Or

```
> const handle = repo.find("automerge:2j9knpCseyhnK8izDmLpGP5WMdZQ")
> handle.whenReady().then(() => {
  console.log(handle.docSync())
})
```

In this latter example we use `DocHandle.whenReady`, which returns a promise that the repository resolves when it loads a document from storage or fetches it from another peer in the network.

### `change()` and `on("change")`

Use `DocHandle.change` when you modify a document.

```
> const handle = repo.find("automerge:2j9knpCseyhnK8izDmLpGP5WMdZQ")
> await handle.doc()
> handle.change(d => d.foo = "bar")
```

The `Repo` calls `DocHandle.on("change")` whenever the document is modified – either due to a local change or a sync message being received from another peer.

```
> const handle = repo.find("automerge:4CkUej7mAYnaFMfVnffDipc4Mtvn")
> await handle.doc()
> handle.on("change", ({doc}) => {
  console.log("document changed")
  console.log("New content: ", doc)
})
```

## Integrations

`automerge-repo` provides a set of primitives that you can use to build a wide range of applications. To make this easier, we have built integrations with a few common UI frameworks. You can easily add further integrations and we welcome contributions which integrate with popular frameworks!

### React Integration

[`@automerge/automerge-repo-react-hooks`](https://www.npmjs.com/package/@automerge/automerge-repo-react-hooks) makes it easy to use `automerge-repo` in a React application. Once you've constructed a `Repo` you can make it available to your React application using [`RepoContext`](https://automerge.org/automerge-repo/variables/_automerge_automerge_repo_react_hooks.RepoContext.html). Once available, call `useHandle` to obtain a `DocHandle`:

```
function TodoList(listUrl: AutomergeUrl) {
    const handle = useHandle(listUrl)
    // render the todolist
}
```

Note that when `Repo` receives changes over the network or registers local changes, the original Automerge document remains immutable, and any modified parts of the document get new objects. This means that you can continue to use reference equality checks you're used to for in-memory data, in places like `React.memo` or `useMemo`.

### Svelte Integration

[`@automerge/automerge-repo-svelte-store`](https://www.npmjs.com/package/@automerge/automerge-repo-svelte-store) provides `setContextRepo` to set the `Repo` which is used by the `document` store:

```
<script lang="ts">
  import { document } from "@automerge/automerge-repo-svelte-store"
  import { type AutomergeUrl } from "@automerge/automerge-repo"

  export let documentUrl: AutomergeUrl

  // Doc is an automerge store with a `change` method which accepts
  // a standard automerge change function
  const doc = document<HasCount>(documentUrl)
  const increment = () => {
    doc.change((d: HasCount) => (d.count = (d.count || 0) + 1))
  }
</script>

<button on:click={increment}>
  count is {$doc?.count || 0}
</button>
```

## What about &lt;X&gt;?

We'd love to help you make automerge work in your favorite development environment! Please reach out to us on GitHub or via [our Slack](https://join.slack.com/t/automerge/shared_invite/zt-e4p3760n-kKh7r3KRH1YwwNfiZM8ktw).

## Extending `automerge-repo`

You can extend `automerge-repo` by writing new storage or network adapters.

### Storage Adapters

A storage adapter represents some kind of backend that stores the data in a repo. Storage adapters can be implemented for any key/value store that allows you to query a range of keys with a given prefix. There is no concurrency control required (that's implemented in `automerge-repo`) so you can safely have multiple repos pointing at the same storage. For example, you could implement an adapter on top of Redis.

The `automerge-repo` library provides storage adapters for IndexedDB and the file system (on Node).

### Network Adapters

A network adapter represents a way of connecting to other peers. Network adapters raise events when a new peer is discovered or when a message is recieved, and implement a `send` method for transmitting messages to another peer. `automerge-repo` assumes a reliable, in-order transport for each peer; as long as you can provide this (e.g. using a TCP connection), you can implement an adapter. You could implement an adapter for [BLE](https://en.wikipedia.org/wiki/Bluetooth_Low_Energy), for example.

The `automerge-repo` library provides network adapters for WebSocket, MessageChannel, and BroadcastChannel.

### Other languages/platforms

This release of `automerge-repo` is just for javascript. Automerge is a multi-language library though and there are efforts under way to implement `automerge-repo` on other platforms. The most mature of these is [`automerge-repo-rs`](https://github.com/automerge/automerge-repo-rs). We welcome contributions and please reach out if you're starting to develop `automerge-repo` for a new platform.

## Beta Quality

`automerge-repo` works pretty well – we're using it at [Ink & Switch](https://www.inkandswitch.com/) for a bunch of internal projects. The basic shape of the API is simple and useful, and not having to think about the plumbing makes it much, much faster to get a useful application off the ground. However, there are some performance problems we're working on:

1. Documents with large histories (e.g. a collaboratively edited document with >60,000 edits) can be slow to sync.
2. The sync protocol currently requires that a document it is syncing be loaded into memory. This means that a sync server can struggle to handle a lot of traffic on large documents.

These two points mean that we're not ready to say this project is ready for production.

We're working hard on fixing the performance so that we _can_ say this is ready for production. But if you are interested in experimenting with the library now, or if you are only going to be working with relatively small documents or low traffic sync servers then you are good to go!

(If you want us to get to production faster, or you have some specific requirements, please consider [sponsoring](https://github.com/sponsors/automerge) Automerge development 🙂)

Finally, we don't want to give the impression that everything is smooth sailing. `automerge-repo` solves a bunch of the hard problems people were encountering around networking and storage. There are still plenty of other difficult problems in local first software where we don't have turnkey solutions: authentication and authorization, end-to-end encryption, schema changes, version control workflows etc. `automerge-repo` makes many things much easier, but it's a frontier out here.
