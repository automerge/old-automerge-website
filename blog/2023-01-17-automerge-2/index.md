---
slug: automerge-2
title: Automerge 2.0
authors: [pvh]
tags: []
---

# Introducing Automerge 2.0

Automerge 2.0 is here and ready for production. It’s our first supported release resulting from a ground-up rewrite. The result is a production-ready CRDT with huge improvements in performance and reliability. It's available in both JavaScript and Rust, and includes TypeScript types and C bindings for use in other ecosystems. Even better, Automerge 2.0 comes with improved documentation and, for the first time, support options for production users.

## Automerge, CRDTs, and Local-first Software

Before getting into the details of why we're excited about Automerge 2.0, let's take a bit of time to explain what Automerge is for anyone unfamiliar with the project.

Automerge is a [CRDT](https://crdt.tech/), or "conflict-free replicated data type", but if you're allergic to buzzwords you can just think of it as a version controlled data structure. Automerge lets you record changes made to data and then replay them in other places, reliably producing the same result in each. It supports JSON-like data, including arbitrarily nested maps and arrays, as well as some more advanced data types such as text and numeric counters.

This is useful for quite a few reasons: you can use it to implement real-time collaboration for an application without having to figure out tricky application-specific algorithms on the server. You can also use it to better support offline work. We think it has even more potential than just that.

Since the rise of the cloud, developers have largely had to choose between building cloud software or traditional installed software. Although installed software has some reliability and performance benefits, cloud software has dominated the market. Cloud software makes sharing data between users easy and includes ubiquitous access from any computing device. Unfortunately, the advantages of cloud software come at a high price. Cloud software is fragile and prone to outages, rarely supports offline use, and is expensive to scale to large audiences.

At Ink & Switch, we’ve been researching a model for developing software which we call [local-first software](https://www.inkandswitch.com/local-first/), with the goal of combining the best of both worlds: reliable, locally-executed software paired with scalable offline-friendly collaboration infrastructure. We believe that a strong data model based on recording change over time for every application should be a cornerstone of that effort.

## Automerge-RS: Rebuilt for Performance & Portability

Earlier versions of Automerge were implemented in pure JavaScript. Our initial implementations were theoretically sound but much too slow and used too much memory for most production use cases.

Furthermore, JavaScript support on mobile devices and embedded systems is limited. We wanted a fast and efficient version of Automerge that was available everywhere: in the browser, on any mobile device, and even microcontrollers like the [ESP32](https://en.wikipedia.org/wiki/ESP32).

Instead of trying to coordinate multiple distinct versions of Automerge, we decided to rewrite Automerge in Rust and use platform-specific wrappers to make it available in each language ecosystem. This way we can be confident that the core CRDT logic is identical across all platforms and that everyone benefits from new features and optimizations together.

For JavaScript applications, this means compiling the Rust to WebAssembly and providing a JavaScript wrapper that maintains the existing Automerge API. Rust applications can obviously use the library directly, and we're making sure that it's as easy as possible to implement support in other languages with well-designed traits and a comprehensive set of C bindings.

To deliver this new version, lab members Alex Good and Orion Henry teamed up with open source collaborators including Andrew Jeffery and Jason Kankiewicz to polish and optimize the Rust implementation and JavaScript wrapper. The result is a codebase that is hundreds of times faster than past releases, radically more memory efficient, better tested, and more reliable.

## Documenting Automerge

With Automerge 2.0 we've made a big investment in improving documentation. In addition to [sample code](https://github.com/automerge/automerge-rs/tree/main/javascript/examples), we now have a [quick-start guide](https://automerge.org/docs/quickstart/) that supports both Vite and create-react-app, as well as [internals](https://automerge.org/docs/how-it-works/backend/) documentation, [file format](https://alexjg.github.io/automerge-storage-docs/) and [sync protocol](https://automerge.org/docs/how-it-works/sync/) documentation. This work was led by lab alumnus Rae McKelvey and we hope it helps make getting started with Automerge much easier. Please let us know if there are other topics or areas you'd like to see covered!

## Supporting Automerge

Those who have been following Automerge for a while may have noticed that we describe Automerge 2.0 as our first _supported_ release. That’s because as part of the Automerge 2.0 release we’ve brought Alex Good onto the team full-time to provide support to external users, handle documentation, release management, and—of course—to continue implementing new Automerge features for the community.

This is a big moment for Ink & Switch and the Automerge project: we’re now able to provide support to our users thanks to sponsorship from enterprises like [Fly.io](https://fly.io/), [Prisma](https://www.prisma.io/), and [Bowtie](https://bowtie.works/) as well as so many others who have contributed either directly to Automerge or through supporting Martin Kleppmann on Patreon.

If your business is interested in sponsoring Automerge, you can [sponsor us directly](https://github.com/sponsors/automerge), or [get in touch with us for more information or other sponsorship methods](mailto:hello@inkandswitch.com). Every little bit helps, and the more sponsors we have, the more work we can do while still remaining an independent open source project.

> At Bowtie we support Automerge because it's the best way to achieve the resilliency properties that we're delivering to globally distributed private networks. It's clear to me that our sponsorship has furthered our software, and that this crew are among the best distributed-systems thinkers in the business.
> -- Issac Kelly, CTO, Bowtie.

## Performance: Speed, Memory and Disk

Using a CRDT inherently comes with overhead: we have to track additional information in order to be able to correctly merge work from different sources. The goal of all CRDT authors is to find the right trade-offs between preserving useful history, reducing CPU overhead, and efficiently storing data in memory and on disk.

With the Automerge project, our goal is to retain the full history of any document and allow an author to reconstruct any point in time on demand. As software developers we're accustomed to having this power: it's hard to imagine version control without history.

With Automerge 2.0, we've brought together an efficient binary data format with fast updates, save, and load performance. Without getting too into the details, we accomplish this by packing data efficiently in memory, ensuring that related data is stored close together for quick retrieval.

Let's take a look at some numbers. One of the most challenging benchmarks for CRDTs is realtime text collaboration. That's because a long editing session can result in hundreds of thousands of individual keystrokes to record and synchronize. Martin Kleppmann recorded the keystrokes that went into writing an academic paper and replaying that data has become a [popular benchmark](https://github.com/automerge/automerge-perf) for CRDTs.

| Insert ~260k operations  | Timing (ms) | Memory (bytes) |
| ------------------------ | ----------- | -------------- |
| Automerge 0.14           | ~500,000    | ~1,100,000,000 |
| Automerge 1.0.1          | 13,052      | 184,721,408    |
| Automerge 2.0.1          | 1,816       | 44,523,520     |
| Yjs                      | 1,074       | 10,141,696     |
| Automerge 2.0.2-unstable | 661         | 22,953,984     |

Of course, even the most productive authors struggle to type an entire paper quite so quickly. Indeed, writing a paper can occur over months or even years, making both storage size on disk and load performance important as well.

| Size on Disk   | bytes       |
| -------------- | ----------- |
| plain text     | 107,121     |
| automerge 2.0  | 129,062     |
| automerge 0.14 | 146,406,415 |

The binary format works wonders in this example, encoding a full history for the document with only 30% overhead. That's less than one additional byte per character! The naive JSON encoding often used circa automerge 0.14 could exceed 1,300 bytes _per character_. If you'd like to learn more about the file format, we have a [specification](https://alexjg.github.io/automerge-storage-docs/) document.

| Load ~260k operations    | Timing (ms) |
| ------------------------ | ----------- |
| Automerge 1.0.1          | 590         |
| Automerge 2.0.1          | 593         |
| Automerge 2.0.2-unstable | 438         |

Loading the compressed document is fast as well, ensuring the best possible start-up time.

While we are proud of these results, we will continue to invest in improved performance with each release as you can see with the preliminary numbers for the upcoming Automerge 2.0.2 release.

A few notes about methodology before we move on. The particular implementation we used to run the benchmarks can be found [here](https://github.com/alexjg/automerge-perf-comparisons). These numbers were produced on Ryzen 9 7900X. The "timing" column is how long it takes to apply every single edit in the trace, whilst the "memory" common is the peak memory usage during this process.

The improvements found in "2.0.2-unstable" mostly result from an upcoming improved API for text. Also note that the "automerge 1.0.1" here is actually the `automerge@1.0.1-preview-7` release. Automerge 1.0.1 was a significant rewrite from 0.14 and has a similar architecture to the Rust implementation. Improvements between 1.0.1 and 2.0.1 are a result of both optimization and adopting WebAssembly rather than an architectural change.

## Portability & Mobile Devices

Because the core logic of Automerge is now built in Rust, we're able to port it more easily to a wide variety of environments and bind it to almost any language. We have users today who directly build on Automerge using the Rust APIs (and the helpful [autosurgeon](https://github.com/automerge/autosurgeon) library). We also have a [C-bindings API](https://github.com/automerge/automerge-rs/tree/main/rust/automerge-c) designed and contributed by Jason Kankiewicz, and are excited to see the [`automerge-go`](https://github.com/automerge/automerge-go) implementation underway by Conrad Irwin.

In the future, we hope to provide bindings for other languages including Swift, Kotlin, and Python. If you're interested in getting involved in those projects please let us know!

One important note is that React-Native does not support WASM today. Developers building mobile applications will need to bind directly via C. If you're interested in either working on or sponsoring work on this problem, feel free to get in touch.

# What’s Next

With the release of Automerge 2.0 out the door, we will of course be listening closely to the community about their experience with the release, but in the months ahead, we expect to work on at least some of the following features:

## Native Rich Text Support

As with most CRDTs, Automerge originally focused on optimizing editing of plaintext. In the [Peritext paper](https://www.inkandswitch.com/peritext/) by Ink & Switch we discuss an algorithm for supporting rich text with good merging accuracy, and we are planning to integrate this algorithm into Automerge. Support for rich text will also make it easier to implement features like comments or cursor and selection sharing.

## Automerge-Repo

We’ve worked hard to keep Automerge platform-agnostic and support a wide variety of deployment environments. We don’t require a particular network stack or storage system, and Automerge has been used successfully in, client-server web applications, peer-to-peer desktop software, and as a data synchronization engine for cloud services. Unfortunately, excluding network and storage from the library has left a lot of the busy-work up to application developers, and asked them to learn a lot about distributed systems just to get started.

Our new library, [Automerge-Repo](https://github.com/automerge/automerge-repo), is a modular batteries-included approach to building web applications with Automerge. It works both in the browser (desktop and mobile) and in Node, and supports a variety of networking and storage adapters. There are even text editor bindings for Quill and Prosemirror as well as React Hooks to make it easy to get started quickly.

It's under active development, and available in beta right now. We'll talk more about it when we announce GA, but if you're starting a browser-based application now, it's probably the right place to start.

## Rust Developer Experience Improvements

We've seen tremendous enthusiasm for the native Rust experience of Automerge, and the current Rust API is powerful and fast. Unfortunately, it's also low-level and can be difficult to work with directly. To make building Rust applications against automerge easier, Alex built [Autosurgeon](https://github.com/automerge/autosurgeon), a library that helps bind Rust data structures to Automerge documents, and we'll continue to listen to our Rust users and improve on that experience.

## Improved Synchronization

Automerge's current synchronization system has some great properties. In many cases it can bring two clients up to date with only a single round-trip each direction. That said, we see big potential to improve the CPU performance of this process, and also lots of opportunity to improve sync performance of many documents at once. We also expect to provide other optimizations our users and sponsors have requested, such as more efficient first-document loading, network compaction of related changes, and enabling something akin to a Git “shallow clone” for clients which don't need historical data.

## Built-in Branches

While we retain the full history of Automerge documents and provide APIs to access it, we don’t currently provide an efficient way to reconcile many closely related versions of a given document. This feature is particularly valuable for supporting offline collaboration in professional environments and (combined with Rich Text Support) should make it much easier for our friends in journalism organizations to build powerful and accurate editing tools.

## History Management

Today the best way to remove something from an Automerge document's history is to recreate the document from scratch or to reset to a time before that change went in. In the future, we plan to provide additional tools to give developers more control over document history. We expect this to include the ability to share just the latest version of a document (similar to a shallow clone in `git`), and to share updates that bypass changes you don't want to share (as when a developer squashes commits before publishing).

# Conclusion

Automerge 2.0 is here, it’s ready for you, and we’re tremendously excited to share it with you. We’ve made Automerge faster, more memory efficient, and we’re bringing it to more platforms than ever. We’re adding features, making it easier to adopt, and have begun growing a team to support it. There has never been a better moment to start building local-first software: why not [give it a try](https://automerge.org/docs/hello/), and please feel welcome to [join us in the Automerge Slack](https://join.slack.com/t/automerge/shared_invite/zt-e4p3760n-kKh7r3KRH1YwwNfiZM8ktw), too.

:::caution

A note to existing users: Automerge 2.0 is found on npm at `@automerge/automerge`. We have deprecated the `automerge` package.

:::
