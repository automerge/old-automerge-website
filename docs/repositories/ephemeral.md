---
sidebar_position: 4
---

# Ephemeral Data

Automerge encourages you to persist most of your application state. Sometimes however there is state which it doesn't make any sense to persist. Good reasons to not persist state are if it changes extremely fast, or is only useful to the user in the context of a live "session" of some kind. One example of such data is cursor positions in collaboratively edited text. We refer to this kind of data as "ephemeral data".

Ephemeral data is associated with a particular document, which means you need to obtain a `DocHandle` for the document in question in order to send and receive ephemeral data. The rationale for this is that most of the time ephemeral data is related to a particular document. However, if you need to exchange ephemeral data which has no associated document you can always create a blank document and use that.

## Sending

```typescript
const handle = Repo.find("<some url>");
handle.broadcast({
  some: "message",
});
```

The object passed to `broadcast` will be CBOR encoded so you can send whatever you like.

## Receiving

To receive you listen to the `"ephemeral-message"` event on the `DocHandle`

```typescript
const handle = Repo.find("<some url>")
handle.on("ephemeral-message", (message: any) {
    console.log("got an ephemeral message: ", message)
})
```

The received message will be decoded from CBOR before handing it to the event handler.
