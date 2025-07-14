---
slug: automerge-3
title: Automerge 3.0
authors: []
tags: []
---

# Automerge 3.0

Automerge is a local-first data sync engine that makes it easy to build collaborative apps. Today we're excited to announce version 3.0 of Automerge!

The main update is a dramatic reduction in memory usage. Automerge stores the full history of documents to facilitate offline collaboration and version control workflows; in previous versions of the library, this could lead to gigabytes of memory usage when working with documents that had long histories. Now, in Automerge 3.0, **we've cut that down memory usage by over 10x**, sometimes dramatically more, making Automerge feasible to use in a much wider range of scenarios.

In addition to the memory usage improvements, we've also cleaned up some redundant APIs, particularly around the dealing with text strings.

If you're using Automerge already, you should upgrade today. Automerge 3.0 uses the same file format as Automerge 2 and the API is nearly fully backwards compatible. See [the migration guide](/docs/migrating-from-automerge-2-to-automerge-3) for more details.

If you're not using Automerge yet, now's a great time to take another look, as things have come a long way in performance and reliability. 

To learn more about how we achieved these improvements, read on.


## Improved Memory Use

Automerge is a data sync engine. As an application developer you work with plain-old-JavaScript-objects and Automerge takes care of persistence, and networking. Unlike most sync engines, Automerge is designed for local-first applications, which means that we need to support working offline, or using multiple independent sync servers, or not having a server at all and doing everything peer-to-peer.

Automerge achieves local first sync by storing every change you make to a document and then when concurrent changes are made - as they will be in a local-first application - we can provide good version control tools for detecting conflicts and reviewing history.  The downside is that we have to store a lot of metadata about changes - we assign a unique ID to every keystroke for example. Most of the technical work in Automerge is making it possible to store and manipulate these increasingly large histories.

Previous versions of Automerge already used a compressed columnar format to store and transmit this metadata. This format achieved a reasonably small metadata overhead "at rest" —  over the raw data for most documents. However, when a document was actually *loaded* for editing, we used an uncompressed format for the history, so the memory usage would balloon to a significantly larger overhead.

In Automerge 3.0, we've rearchitected the library so that it also uses the compressed representation at runtime. This has achieved huge memory savings. For example, pasting Moby Dick into an Automerge 2 document consumes 700Mb of memory, in Automerge 3 it only consumes 1.3Kb!

Beyond the obvious benefits of avoiding high memory usage on client devices, we've also seen that reduced memory usage can make it easier to reliably operate busy sync servers that can hold many large documents in memory at once. 

Finally, for documents with large histories load times can be much much faster (we recently had an example of a document which hadn't loaded after 17 hours loading in 9 seconds!).

## API Paper Cuts

We've also cleaned up several APIs in this release, particularly around handling text.

Automerge can manage two kinds of strings: "collaborative strings" that can merge edits from multiple users, and "non-collaborative strings" where edits from different users cannot be merged. 

In Automerge 1.0, we used native JavaScript strings to represent non-collaborative strings, and a special `Text` class to represent collaborative strings. In Automerge 2.0, we released an experimental API under the `next` namespace, making collaborative text the default case—using `string`s to represent collaborative text, and a special `RawString` class to represent the less common case of non-collaborative text.

In Automerge 3.0, we're fully committing to the new API—we've removed the `Text` API, and made the `next` API the default behavior of the library. (We've also renamed `RawString` to `ImmutableString` as a more descriptive name.)

## Try it out

Automerge 3.0 is used by default when installing the latest version (`2.1.0`) or `@automerge/automerge-repo` or `@automerge/react`. If you're new to automerge take a look at the [tutorial](/docs/tutorial/) to get started.

If you already have an Automerge codebase take a look at the [migration guide](/docs/migrating-from-automerge-2-to-automerge-3) to see if you need to change anything other than the version number of Automerge you depend on. If you just depend on `@automerge/automerge-repo` you'll need to run `npm update @automerge/automerge` (or your package manager's equivalent) to pull in the new version.

If things aren't working, please [create an issue](https://github.com/automerge/automerge-repo/issues/new) or if you have questions [join our Discord](https://discord.gg/zKGe4DCfgR).
