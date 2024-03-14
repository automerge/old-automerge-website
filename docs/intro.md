---
sidebar_position: 0
---

# Overview

Automerge is a library for building collaborative, local-first apps. Different
copies of your app state can exist on different devices. These copies can be
independently updated, even when the device is offline. Divergent versions
of state can then be merged together automatically and synced.

Automerge will automatically:

* **Sync state** when the app is online

* **Merge divergent** state without losing conflicts

* **Version state**, enabling Git-like workflows

Automerge is [local-first](#local-first) but [server-friendly](#server-friendly) software.

# API

The primary API for Automerge is the Javascript API, consisting of a few modules:

* [`@automerge/automerge`](https://automerge.org/automerge/api-docs/js)
* [`@automerge/automerge-repo`](https://automerge.org/automerge-repo/)

In addition to the Javascript API, we provide bindings in several other languages:

  * [C](https://github.com/automerge/automerge/tree/main/rust/automerge-c)
  * [Rust](https://github.com/automerge/automerge-rs)
  * [Python](https://github.com/automerge/automerge-py)
  * [Swift (macOS, iOS)](https://automerge.org/automerge-swift/documentation/automerge/)

## Design principles

Automerge is a data structure library implementing a _Conflict-Free Replicated Data Type_ ([CRDT](https://crdt.tech/)).
While plenty of CRDT libraries exist, our design has some distinguishing principles:

- **Automatic merging** - enables [decentralized automatic merging](/docs/documents/conflicts/) of concurrent changes.
- **Local-first** - the user's local copy is a first-class citizen, enabling decentralized and privacy-preserving 
  data architectures.
- **Network-agnostic** - works with any connection-oriented network protocol and topology, with network
  connectors seperately available. 
- **Immutable state** - makes immutable snapshots of app state while efficiently storing full
  state version history and Git-like branching workflows.
- **Portability** - the [JS API](https://github.com/automerge/automerge) isomorphic, and
  the [Rust API](https://github.com/automerge/automerge-rs) compiles to WASM, enabling native APIs
  for other platforms.
- **Typesafe** - ships with [type definitions](https://github.com/automerge/automerge/blob/main/@types/automerge/index.d.ts) for TypeScript.

### Local-first

Automerge is designed for creating [local-first software](https://www.inkandswitch.com/local-first/),
i.e. software that treats a user's local copy of their data (on their own device) as primary, rather
than centralising data in a cloud service.

The local-first approach enables working offline while still enabling real-time online collaboration. 
By reducing the dependency on cloud services - which can be discontinued abruptly - local-first software 
can have greater longevity, enhanced privacy and improved performance. 

More importantly, local-first software it gives users control over their data.
The [essay on local-first software](https://www.inkandswitch.com/local-first/) goes into more
detail on the philosophy behind Automerge, and the pros and cons of this approach.

### Server-friendly

While we built Automerge to be local-first, it still works great in a classic client-server architecture.

You still get useful benefits, such as allowing several clients to concurrently update the data, 
easily sync between clients and server, version controlled app state, and support for Git-like
branching and merging workflows.
