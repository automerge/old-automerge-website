---
sidebar_position: 1
---

# Storage

In `automerge-repo` "storage" refers to any implementation of [`StorageAdapter`](https://automerge.org/automerge-repo/classes/_automerge_automerge_repo.StorageAdapter.html). You _can_ run a `Repo` without a `StorageAdapter` but it will be entirely transient and will have to load all it's data from remote peers on every restart.

`StorageAdapter` is designed to be safe to use concurrently, that is to say it is safe to have multiple `Repo`s talking to the same storage.

There are two built in storage adapters:

## IndexedDB

[`@automerge/automerge-repo-storage-indexeddb`](https://www.npmjs.com/package/@automerge/automerge-repo-storage-indexeddb) stores data in an [`IndexedDB`](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) in the browser.

```typescript
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb`

const storage = new IndexedDBStorageAdapter()
```

You can customize the object database and object store the storage uses, see [the docs](https://automerge.org/automerge-repo/classes/_automerge_automerge_repo_storage_indexeddb.IndexedDBStorageAdapter.html#constructor)

As noted above, this is safe for concurrent use so you can have multiple tabs pointing at the same storage. Note that they will not live update (you may want to use a [`MessageChannel`](https://automerge.org/automerge-repo/modules/_automerge_automerge_repo_network_messagechannel.html) or [`BroadcastChannel`](https://automerge.org/automerge-repo/modules/_automerge_automerge_repo_network_broadcastchannel.html) based `NetworkAdapter` for that) but on refresh the concurrent changes will be merged as per the normal merge rules.

## File system

[`@automerge/automerge-repo-storage-nodefs`](https://www.npmjs.com/package/@automerge/automerge-repo-storage-nodefs) is a `StorageAdapter` which stores its data in a directory on the local filesystem. The location can be customized as per [the docs](https://automerge.org/automerge-repo/classes/_automerge_automerge_repo_storage_nodefs.NodeFSStorageAdapter.html#constructor)

```typescript
import { NodeFSStorageAdapter } from "@automerge/automerge-repo-storage-nodefs";
const storage = new NodeFSStorageAdapter();
```

As with the `IndexedDB` adapter this adapter is safe for multiple processes to use the same data directory.

## Roll your own

`StorageAdapter` is designed to be easy to implement. It should be straightforward to build on top of any key/value store which supports range queries.
