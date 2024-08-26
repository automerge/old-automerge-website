# Automerge Anywhere

One of Automerge's key strengths is its portability. The core of the CRDT is written in Rust, which allows us to bind it into a wide variety of languages including JavaScript, Swift, Kotlin, C, Go, and Python. In the browser, we compile the Rust code to WebAssembly to load it there. 

Unfortunately, native browser support for WebAssembly modules has remained quite a subtle art: different runtimes, package managers, bundlers, and browsers have all settled on different approaches and have different constraints. It's a real mess out there.

In the last few weeks, we returned to the problem of WASM packaging with some determination and some new ideas courtesy of [Nick Babrock](https://nickb.dev/blog/recommendations-when-publishing-a-wasm-library/). The result is a set of new packaging options that should make loading Automerge possible anywhere, including quite a few places where it was difficult or impossible before.

## Anywhere?
If you're already using Automerge successfully in your environment, nothing will change. The new features are strictly additive. What we have done is introduce a few new ways to load Automerge by including the option for manual initialization of the WASM object and a base64 encoded string version as well.

This means you should be able to conveniently use Automerge in vanilla JS applications with no bundler, in React-Native applications on mobile devices, within cloud services like Cloudflare Workers or on Val.town, and probably anywhere else you can think of. 

If you find a place where none of our approaches work for you then please let us know by inquring [in our Discord](https://discord.gg/TrgN9FkYSa) or by filing a (GitHub issue)[https://github.com/automerge/automerge].

## How to use it
We've collected of examples showing how to initialize automerge in specific environments in [a new documentation page](https://automerge.org/docs/library_initialization/). If you had trouble with Automerge in your environment before, try again without changing anything first. This new release improved support for a few edge cases within the old API, so you might find everything just starts working on its own.

If you do need to use the new manual initialization code you'll need to to make a couple of small changes:
1. Import the `/slim` variant of automerge and separately, the WebAssembly blob.
2. Await the result of calling `Automerge.initializeWasm(wasm)`.

For example, here's how to perform initialization in a Vite app without importing WebAssembly modules:

```javascript
import { next as Automerge } from '@automerge/automerge/slim'
import wasm from "@automerge/automerge/automerge.wasm?url"
// note here the ?url suffix mean that the wasm is loaded as a URL

// initializeWasm accepts a URL, Request, UInt8Array, or a WebAssembly.Module.
await Automerge.initializeWasm(wasm)

// Now you can use Automerge
let doc = Automerge.init()
```

This also applies for applications using `automerge-repo`, in that case you would import `@automerge/automerge-repo/slim`. Like so:


```javascript
import { Repo } from '@automerge/automerge-repo/slim'
import { next as Automerge } from '@automerge/automerge/slim'
import wasm from "@automerge/automerge/wasm_blob.wasm?url"

await Automerge.initializeWasm(wasm)

// Now you can use the Repo
let repo = new Repo({..})
let handle = repo.create()
```

If you can't even load a binary file, we've even included a base64 encoded version of the WASM blob. This will be somewhat slower and large than a binary object but it's available as the ultimate fallback and you can use it like this:

```javascript
import { automergeWasmBase64 } from "@automerge/automerge/automerge.wasm.base64.js";
// Note the `/slim` suffixes
import { next as Automerge } from "@automerge/automerge/slim";
import { Repo } from `@automerge/automerge-repo/slim`;

await next.initializeBase64Wasm(automergeWasmBase64)

// Now we can get on with our lives
const repo = new Repo({..})
```

### For libraries which depend on automerge
If you are writing a library which depends on automerge that other applications might use, please be sure to only import the `@automerge/automerge/slim` package. Doing so will ensure other users retain the option of 
