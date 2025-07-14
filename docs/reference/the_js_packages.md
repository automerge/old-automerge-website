---
sidebar_position: 3
---

# The JavaScript packages

The javascript API has been through several iterations and is currently split over a few libraries. In greenfield applications, here's how the library is intended to be used:

Install both the `@automerge/automerge` and `@automerge/automerge-repo` packages. Then install the networking and storage plugins you need (typically `@automerge/automerge-repo-network-*` and `@automerge/automerge-repo-storage-*`) packages. Take a look at the cookbook for examples of different ways of using these.

## `@automerge/react` and `@automerge/vanilla`

For React and vanilla JS applications we offer the `@automerge/react` and `@automerge/vanilla` packages respectively. These packages just re-export the public items from `automerge` and `automerge-repo` and several common network and storage adapters for your convenience.


## Relationship between `@automerge/automerge` and `@automerge/automerge-repo`

The core automerge libraries (both the original classic library and the WASM implementation) offer a compact storage format and a network agnostic sync protocol, but they don't actually do the work of wiring these things up to real storage engines (such as filesystems) or transports (such as websockets). `automerge-repo` implements all of this plumbing and is how we recommend using automerge going forward.
