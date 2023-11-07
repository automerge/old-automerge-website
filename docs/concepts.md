---
sidebar_position: 2
---

# Concepts

:::info

This documentation is mostly focused on the javascript implementation of automerge. Some things will translate to other languages but some things - in particular the "repository" concept and `automerge-repo` library - will not.

:::


## Core concepts

Using automerge means storing your data in automerge [documents](#Documents). Documents have a [URL](#Document-URLs)s which you can use to share or request documents with/from other peers using a [repository](#Repositories). Repositories give you [`DocHandle`](#dochandles)s which you use to make changes to the document and listen for changes from other peers.

Automerge as used in javascript applications is actually a composition of two libraries. [`automerge-repo`](https://www.npmjs.com/package/@automerge/automerge-repo) which provides the networking and storage plumbing, and [`automerge`](https://www.npmjs.com/package/@automerge/automerge) which provides the CRDT implementation, a transport agnostic [sync protocol](#sync-protocol), and a compressed [storage format](#storage-format) which `automerge-repo` uses to implement various networking and storage plugins.

### Documents

A document is the "unit of change" in automerge. It's like a combination of a JSON object and a git repository. What does that mean?

Like a JSON object an automerge document is a map from strings to values, where the values can themselves be maps, arrays, or simple types like strings or numbers. See the [data model](/docs/documents/) section for more details.

Like a git repository an automerge document has a history made up of commits. Every time you make a change to a document you are adding to the history of the document. The combination of this history and some rules about how to handle conflicts means that any two automerge documents can always be merged. See [merging](/docs/under-the-hood/merge_rules.md) for the gory details.

### Repositories

A repository manages connections to remote peers and access to some kind of local storage. Typically you create a repository at application startup and then inject it into the parts of your application which need it. The repository gives out `DocHandle`s, which allow you to access the current state of a document and make changes to it without thinking about how to store those changes, transmit them to others, or fetch changes from others.

Networking and storage for a repository is pluggable. There are various ready made network transports and storage implementations but it is also easy to build your own.

### DocHandles

A `DocHandle` is an object returned from the various methods on a repository which create or request a document. The `DocHandle` has methods on it to access the underlying automerge document and to create new changes which are stored locally and transmitted to connected peers.

### Document URLs

Documents in a repository have a URL. An automerge URL looks like this:

```
automerge:2akvofn6L1o4RMUEMQi7qzwRjKWZ
```

That is, a string of the form `automerge:<base58>`. This URL can be passed to a repository which will use it to check if the document is in any local storage or available from any connected peers.

### Sync Protocol

Repositories communicate with each other using an efficient sync protocol which is implmented in `automerge`. This protocol is transport agnostic and works on a per-document basis, a lot of the work `automerge-repo` does is handling running this sync protocol for multiple documents over different kinds of network.

### Storage Format

`automerge` implements a compact binary storage format which makes it feasible to store all the editing history of a document (for example, storing every keystroke in a large text document). `automerge-repo` implements the common logic of figuring out when to compress documents and doing so in a way which is safe for concurrent reads and writes.
