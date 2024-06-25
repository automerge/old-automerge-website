---
sidebar_position: 3
---

# The JavaScript packages

The javascript API has been through several iterations and is currently split over a few libraries. This page describes how all these pieces fit together.

## Recommended Usage

If you just want to know how to use Automerge in greenfield applications, here's how the library is intended to be used:

Install both the `@automerge/automerge` and `@automerge/automerge-repo` packages. Then install the networking and storage plugins you need (typically `@automerge/automerge-repo-network-*` and `@automerge/automerge-repo-storage-*`) packages. Take a look at the cookbook for examples of different ways of using these.

When you're making changes to an automerge document you should use [the `next` API](#the-next-api)

## The `next` API

Over time we have made a number of changes to the automerge API which are not backwards compatible. In order to not break compatibility we have exposed the new API under a sub module of the library, this submodule used to be called "unstable" to reflect that we were not sure about it - but we're now fairly sure we like it so we're calling it "next" in expectation that it's what the next major version of automerge will look like.

### Differences from stable

- In the old API javascript strings are represented as scalar strings (see the [data model](/docs/documents/) for details) whilst in "next" javascript strings are `Text` sequences (i.e. they support concurrent insertions and deletions). This means that you should use `next.splice` to modify strings in the `next` API. Scalar strings in the `next` API are represented as instances of the `RawString` class.
- The next API exposes the `diff` and `changeAt` methods

### Using the next API

There are two ways to use the next API

#### Subpath Exports

If you are either using JavaScript in a modern browser or on node > 16 then you can do the following:

```javascript
import { default as A } from "@automerge/automerge/next";
```

Note that for this to work in typescript you will need to have the following in your `tsconfig.json`

```json
    ...
    "module": "NodeNext",
    "moduleResolution": "Node16",
    ...
```

#### The `{ next }` module

If for whatever reason you can't use `@automerge/automerge/next` then you can do this:

```javascript
import { next as A } from "@automerge/automerge";
```

## How we got here

### Automerge Classic

The first version of automerge was implemented in pure javascript and is what we now call automerge Classic. You can find it [on NPM](https://www.npmjs.com/package/automerge) and [GitHub](https://github.com/automerge/automerge-classic). This project went through several iterations which changed quite dramatically.

### `@automerge/automerge-wasm` and `@automerge/automerge`

More recently we rewrote automerge in Rust and deployed it to javascript by compiling to a wasm package at [`@automerge/automerge-wasm`](https://www.npmjs.com/package/@automerge/automerge-wasm). This wasm package is something we currently consider to be an implementation detail and should not be depended on by third parties. The `@automerge/automerge` package offers a very similar API to the original `automerge` package but implemented by forwarding logic to `@automerge/automerge-wasm`. It is consequently much faster.

### `@automerge/automerge-repo`

The core automerge libraries (both the original classic library and the WASM implementation) offer a compact storage format and a network agnostic sync protocol, but they don't actually do the work of wiring these things up to real storage engines (such as filesystems) or transports (such as websockets). `automerge-repo` implements all of this plumbing and is how we recommend using automerge going forward.
