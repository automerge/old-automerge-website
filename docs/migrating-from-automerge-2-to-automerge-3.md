---
sidebar_position: 2
---

# Migrating from Automerge 2 to Automerge 3

Automerge 3 is a major update to the Automerge library which enormously reduces memory usage and in many cases improves performance. It is however, almost entirely backwards compatible with Automerge 2. The main difference is that we have deprecated the old `Text` based API for collaborative string.

In Automerge 2 we had two APIs for collaborative text. In one API, we represented collaborative text using a class called `Text`, which had methods on it for mutating the string. We eventually deprecated this API and introduced a new API in which collaborative text was represented using a plain `string` and you use methods like `Automerge.splice` and `Automerge.updateText` to modify those strings. Accessing the new API was done by importing the `next` API of Automerge, like so:

```typescript
import { next as Automerge } from "@automerge/automerge"
```

In Automerge 3 the old `Text` API is no longer available. All collaborative strings are represented as `string`s. The `next` module is still available (to avoid breaking codebases which use it) but it just re-exports the `Automerge` module.

## Steps to upgrade

If you are not using the old `Text` API (you import Automerge using `import { next as Automerge } from "@automerge/automerge"`), then you can just change your imports to `import * as Automerge from "@automerge/automerge"` and you are done.

If you _are_ using the old `Text` API then you will need to make the following changes:

* Anywhere your code expects to work with a `Text` class, update it to use a `string`.
* Anywhere your code expects to work with a `string`, update it to use an `ImmutableString`

### Updating `Text` to `string`

Here's an example. If your old code looks like this:

```typescript
import * as Automerge from "@automerge/automerge"

let doc = Automerge.from({
    content: new Automerge.Text()
})

doc = Automerge.change(doc, d => {
    d.content.insertAt(0, "Hello ")
})
```

You would change it to this:

```typescript
import * as Automerge from "@automerge/automerge"

let doc = Automerge.from({
    content: ""
})

doc = Automerge.change(doc, d => {
    Automerge.splice(d, ["content"], 0, 0, "Hello")
})
```

### Updating `string` to `ImmutableString`

If your old code looks like this:

```typescript
import * as Automerge from "@automerge/automerge"
let doc = Automerge.from({
    content: "Hello world"
})
doc = Automerge.change(doc, d => {
    d.content = "Goodbye world"
})
```

You would change it to this:

```typescript
import * as Automerge from "@automerge/automerge"
let doc = Automerge.from({
    content: new Automerge.ImmutableString("Hello world")
})
doc = Automerge.change(doc, d => {
    d.content = new Automerge.ImmutableString("Goodbye world")
})
```


