---
sidebar_position: 1
---

# Modeling Data

All data in Automerge must be stored in a document. A document can be modeled in a variety of ways, and there are many design patterns that can be used. An application could have many documents, typically identified by a UUID.

In this section, we will discuss how to model data within a particular document, including how to version and manage data with Automerge in production scenarios.

## How many documents?

You can decide which things to group together as one Automerge document (more fine grained or more coarse grained) based on what makes sense in your app. Having hundreds of docs should be fine — we've built prototypes of that scale. One major automerge project, [PushPin](https://github.com/automerge/pushpin), was built around very granular documents. This had a lot of benefits, but the overhead of syncing many thousands of documents was high.

We believe on the whole there's an art to the granularity of data that is universal. When should you have two JSON documents or two SQLite databases or two rows? We suspect that an Automerge document is best suited to being a unit of collaboration between two people or a small group.

## Setting up an initial document structure

When you create a document using `Automerge.init()`, it's just an empty JSON document with no properties. As the first change, most applications will need to initialize some empty collection objects that are expected to be present within the document.

The easiest way of doing this is with a call to `Automerge.change()` that sets up the document schema in the form that you need it, like in the code sample above. You can then [sync](/docs/cookbook/real-time/) this initial change to all of your devices; once everybody has the schema, you can have different users updating the document on different devices, and the updates should merge nicely. For example:

```js
// Set up the `cards` array in doc1
let doc1 = Automerge.change(Automerge.init(), (doc) => {
  doc.cards = [];
});

// In doc2, don't create `cards` again! Instead, merge
// the schema initialization from doc1
let doc2 = Automerge.merge(Automerge.init(), doc1);

// Now we can update both documents
doc1 = Automerge.change(doc1, (doc) => {
  doc.cards.push({ title: "card1" });
});

doc2 = Automerge.change(doc2, (doc) => {
  doc.cards.push({ title: "card2" });
});

// The merged document will contain both cards
doc1 = Automerge.merge(doc1, doc2);
doc2 = Automerge.merge(doc2, doc1);
```

However, sometimes it's inconvenient to have to sync the initial change to a device before you can modify the document on that device. If you want two devices to be able to independently set up their own document schema, but still to be able to merge those documents, you have to be careful. Simply doing `Automerge.change()` on each device to initialize the schema **will not work**, because you now have two different documents with no shared ancestry (even if the initial change performs the same operations, each device has a different actorId and so the changes will be different).

If you really must initialize each device's copy of a document independently, one option is to do the initial `Automerge.change()` once to set up your schema, then call `Automerge.save()` on the document (which returns a byte array), and _hard-code that byte array into your application_. Now, on each device that needs to initialize a document, you do this:

```js
// hard-code the initial change here
const initChange = new Uint8Array([133, 111, 74, 131, ...])
let [doc] = Automerge.load(initChange)
```

This will set you up with a document whose initial change is the one you hard-coded. Any documents you set up with the same initial change will be able to merge.

## Versioning

Often, there comes a time in the production lifecycle where you will need to change the schema of a document. Because Automerge uses a JSON document model, it's similar to a NoSQL database, where properties can be arbitrarily removed and added at will.

You can implement your own versioning scheme, for example by embedding a schema version number into the document, and writing a function that can upgrade a document from one schema version to the next. However, doing this in a CRDT like Automerge is more difficult than migrations in a centralized relational database, because it could happen that two users independently perform the same migration. In this case, you need to ensure that the two migrations don't clash with each other, which is difficult.

One way of making migrations safe is by using the tricks from the previous section: in addition to hard-coding the initial change that sets up the document, you can also hard-code migrations that upgrade from one schema version to the next, using the same technique (either hard-coding the change as a byte array, or making a change on the fly with hard-coded actorId and timestamp). Do not modify the initial change; instead, every migration should be a separate hard-coded change that depends only on the preceding change. This way, you can have multiple devices independently applying the same migration, and they will all be compatible because the migration is performed identically on every device.

```js
type DocV1 = {
  version: 1,
  cards: Card[]
}

type DocV2 = {
  version: 2,
  title: Automerge.Text,
  cards: Card[]
}

// This change creates the `title` property required in V2,
// and updates the `version` property from 1 to 2
const migrateV1toV2 = new Uint8Array([133, 111, 74, 131, ...])

let doc = getDocumentFromNetwork()
if (doc.version === 1) {
  [doc] = Automerge.applyChange(doc, [migrateV1toV2])
}
```

Also keep in mind that in your app there might be some users using an old version of the app while other users are using a newer version; you will need to take care with migrations to ensure that they do not break compatibility with older app versions, or force all users to update to the latest version.

Some further ideas on safe schema migrations in CRDT apps are discussed in the [Cambria](https://www.inkandswitch.com/cambria) paper, but these are not yet implemented in Automerge. If you want to work on improving schema migrations in Automerge, please get in touch — contributions are welcome!

## Performance

Automerge documents hold their entire change histories. It is fairly performant, and can handle a significant amount of data in a single document's history. Performance depends very much on your workload, so we strongly suggest you do your own measurements with the type and quantity of data that you will have in your app.

Some developers have proposed “garbage collecting” large documents. If a document gets to a certain size, a central authority could emit a message to each peer that it would like to reduce it in size and only save the history from a specific change (hash). Martin Kleppmann did some experiments with a benchmark document to see how much space would be saved by discarding history, with and without preserving tombstones. See [this video at 55 minutes in](https://youtu.be/x7drE24geUw?t=3289). The savings are not all that great, which is why we haven't prioritised history truncation so far.

Typically, performance improvements can come at the networking level. You can set up a single connection (between peers or client-server) and sync many docs over a single connection. The basic idea is to tag each message with the ID of the document it belongs to. There are possible ways of optimising this if necessary. In general, having fewer documents that a client must load over the network or into memory at any given time will reduce the synchronization and startup time for your application.
