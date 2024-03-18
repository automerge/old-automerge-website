# Merry Commitmas - a year-end recap of what's new in Automerge

Since [releasing](./2023-11-06-automerge-repo.md) automerge-repo last month, we've been working closely with our users to improve the library based on real-world usage. One in-house project, the [Tiny Essay Editor](https://github.com/inkandswitch/tiny-essay-editor), is a Markdown editor with comment support which was used to write the [latest Ink & Switch essay, Embark](https://www.inkandswitch.com/embark/).

Like many Ink & Switch essays, Embark is a large piece: the final version is over 11,000 words and 60,000 characters. The full edit history is just shy of 200,000 edits. That means the team produced roughly 3x as much text as made it into the final version. The final version of the document with the full history and all the comments included is only 376kb and takes a little under 4s to load from disk, but from then on edits are reasonably snappy: most edits take 25ms (equivalent to 30fps) from keypress to paint on my desktop.

There's still plenty of room to improve here. Ultimately our goal is to reliably achieve single-frame updates even on very large documents and we still have a long way to go on memory usage. Still, we thought folks might enjoy hearing a little behind-the-scenes description of what we've been up to.

But first, a few feature updates:

## CodeMirror Integration

Tiny Essay Editor is built around the [automerge-codemirror](https://github.com/automerge/automerge-codemirror) integration and uses incremental updates to make sure it stays fast even on extremely large documents. We've managed to maintain next-frame performance for most edits and document sizes, but on very large documents we still have a few stalls caused by calculating network synchronization messages to work through.

That said, the CodeMirror integration is stable, efficient, and works well with both the marks and cursors APIs. If you need a well-supported plaintext editor (or want a reference to write your own integration for your favorite editor) start here. ProseMirror integration is coming too, more about that after Christmas.

## updateText for easy integration

By default, Automerge's text fields update by replacement, much like they would with any web form. If your application submits the full value for a field, Automerge will replace the whole value. Under the hood, Automerge's strings default to being editable, but integrating a full text editor component in your application is a lot of complication for making a simple text field editable.

The reason is that the interface Automerge exposes for modifying text is `Automerge.splice`, which lets you insert or delete characters at a particular index in the string. Unfortunately, browsers (and most other platforms) don't give you this information very easily; instead they just give you the whole content of the text field and you have to figure out yourself what changed.

Figuring out what changed between two strings is actually quite fiddly. There are algorithms you can study, such as the [Myers diff](https://www.nathaniel.ai/myers-diff/), and libraries [that implement them](https://www.npmjs.com/package/myers-diff)... but we decided that it would be worthwhile to just build one into Automerge and spare you the hassle. We've therefore introduced a function `Automerge.updateText`, which looks like this:

```javascript
let doc1 = Automerge.from({ text: "Hello world!" });

let doc2 = Automerge.clone(doc1);
doc2 = Automerge.change(doc2, (d) => {
  /// Note we just pass the new value we want the whole field to have
  Automerge.updateText(d, ["text"], "Goodbye world!");
});

doc1 = Automerge.change(doc1, (d) => {
  Automerge.updateText(d, ["text"], "Hello friends!");
});

/// text is now "Goodbye friends!"
const merged = Automerge.merge(doc1, doc2);
```

This approach is really handy for places like form fields where a full rich-text editor would be overkill, but isn't as efficient at capturing inputs, particularly for larger documents. Let us know how it works for you!

## Surfacing Sync State

As the Embark essay grew ever-larger, the team began to wonder whether they were up-to-date with each other, our storage server, and so on. We worked with them (thanks to Paul Sonnentag) to allow sync state to be forwarded among peers so that you could subscribe to the sync state of other systems. Right now TEE is just using this to confirm when changes are sent to (or received from) our storage server, particularly after editing offline, but the same infrastructure could be used to keep track of which of your devices were up-to-date, whether a collaborator had received your changes, or even to annotate a chat history. We're eager to see how you might use this. (And don't forget you can always send arbitrary messages to other peers with the ephemeral messaging API!)

## Loading faster

Finally, let's wrap up with some performance work. As we described above, the Embark essay's Automerge document history got pretty large – roughly 200,000 operations, with around 1000 edit sessions (one per editor tab). This uncovered some performance problems in Automerge: when we started, loading the editor took around 40 seconds!

If you've ever encountered the ["edit trace" benchmark](https://github.com/automerge/automerge-perf), which is widely used to benchmark CRDT performance, this might be confusing. That benchmark is even larger. It contains around 270,000 operations and Automerge can load it in ~200ms. Why were we taking two orders of magnitude longer to load a similar-sized document?

Well, notice that I said loading the _editor_ took 40s. In profiling this problem, we saw that the Tiny Essay Editor (TEE) created an empty Automerge document, and ran the sync protocol with our sync server to fetch the document. The sync protocol didn't send the whole document down the wire in one go – instead it would send the list of changes that the client doesn't have. In the case of the initial load, the client doesn't have _any_ of the changes, and so each change was sent down the wire individually. TEE would then apply each change one after another. Applying invididual changes in this way is much slower than loading the compressed document format (which is produced by `Automerge.save`).

We solved this in a straightforward way: when a peer requests a document it doesn't have at all, we skip the elaborate sync protocol and simply send the whole compressed document. Future synchronizations are very fast: the peers remember their last sync state and can quickly calculate the comparison

Unfortunately, even loading the compressed version of this document was much slower than we expected: it was taking somewhere around 5s. That's about 5s too long.

Investigating where the time was being spent we spotted a few performance problems, including:

- Automerge stores operations internally in a B-tree, which has a vector of operations on each node. We were losing some time allocating these little vectors every time we received a new change.
- Each node in the B-tree has an index on it, where we store things like the number of ops and the number of characters in its subtree. When loading a document we were updating these indexes for every edit in the document's history.

We solved these problems by making several changes:

1. Rather than storing the operations directly in the B-tree, we now store them in a separate table and just store indexes into this table in the B-tree. This consolidates allocations so we don't spend so much time making tiny allocations.
2. When loading a document, we wait until we've inserted every op into the B-tree before generating indexes.

Putting this all together, the load time for the Embark essay is reduced to around ~4 seconds on my machine. This is still about 4s too slow but we've managed to shave the first 90% off of the loading time in this application.

# That's it!

You can get all this good stuff by updating to Automerge 2.1.10 or later, as well as plenty of smaller improvements (like import/export) and bug fixes (like getting rid of a React hook race condition).
