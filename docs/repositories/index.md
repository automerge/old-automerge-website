# Repositories

`@automerge/automerge` provides a JSON-like CRDT and a sync protocol, but this still leaves a lot of plumbing to do to use it in an application. [`@automerge/automerge-repo`](https://www.npmjs.com/package/@automerge/automerge-repo) is that plumbing.

The entry point for an `automerge-repo` based application is to create a [`Repo`](https://automerge.org/automerge-repo/classes/_automerge_automerge_repo.Repo.html), passing it some form of [`StorageAdapter`](https://automerge.org/automerge-repo/classes/_automerge_automerge_repo.StorageAdapter.html) - which knows how to save data locally - and zero or more [`NetworkAdapter`](https://automerge.org/automerge-repo/classes/_automerge_automerge_repo.NetworkAdapter.html)s, which know how to talk to other peers running `automerge-repo`.

For example, this snippet creates a `Repo` which listens for websocket connections and stores data in the local file system:

```typescript
import { Repo } from "@automerge/automerge-repo"
import { WebSocketServer } from "ws"
import { NodeWSServerAdapter } from "@automerge/automerge-repo-network-websocket"
import { NodeFSStorageAdapter } from "@automerge/automerge-repo-storage-nodefs"

const wss = new WebSocketServer({ noServer: true })

const repo = new Repo({
  network: [new NodeWSServerAdapter(wss)],
  storage: new NodeFSStorageAdapter(dir),
})
```

A `Repo` is a little like a database. It allows you to create and request [`DocHandle`](https://automerge.org/automerge-repo/classes/_automerge_automerge_repo.DocHandle.html)s. Once you have a `DocHandle` you can make changes to it and listen for changes received from other peers.


```typescript
let doc = repo.create()
// Make a change ourselves and send that to everyone else
doc.change(d => d.text = "hello world")
// Listen for changes from other peers
doc.on("change", ({ doc }) => {
  console.log("new text is ", doc.text)
})
```

Any changes you make - or which are received from the network - will be stored in the attached storage adapter and distributed to other peers 
