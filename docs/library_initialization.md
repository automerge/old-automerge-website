---
sidebar_position: 2
---

# Library Initialization

Automerge is implemented in Rust and compiled to WebAssembly for use in javascript environments. Unfortunately the way that WebAssembly modules are loaded varies across environments. In some situations this can be handled by your build tool, but in others you may need to manually load the module. This page describes how to load automerge in various environments, and also an [escape hatch](#the-escape-hatch) which should work everywhere.

## Common Environments

### Node.js

In node you don't need to do anything special as WebAssembly is supported natively, you just `import { next as A } from "@automerge/automerge"` and you're good to go.

### WebPack

If you're building using webpack you need to enable the `asyncWebAssembly` feature. This is done by adding the following to your `webpack.config.js`:

```javascript
{
    experiments: {
        asyncWebAssembly: true
    }
}
```

### Vite

In vite you'll need to add two plugins, `vite-plugin-wasm` and `vite-plugin-top-level-await`.


```bash
yarn add vite-plugin-wasm vite-plugin-top-level-await
```

Then in your `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

export default defineConfig({
  ...
  plugins: [wasm(), topLevelAwait()],
  ...
})
```

### Cloudflare Workers

Here you should be good to go by just importing `@automerge/automerge` as normal.

:::warning

If you see obscure looking rust stack traces complaining about being unable to create random bytes while constructing a UUID then this is because you are trying to create a document (either a new one, or loading or forking one) outside of a handler. If you run the problematic code in a handler you should be fine.

:::


### Deno

If your Deno instance allows access to the filesystem (the default for local development) then you can import Automerge from an npm specifier like so:

```typescript
import { next as Am } from "npm:@automerge/automerge"
```

However, if your Deno process doesn't have filesystem permission then you'll need to manually initialize the WebAssembly module. One way of doing that is:

```typescript
import { automergeWasmBase64 } from "npm:@automerge/automerge";
import { next as Am } from "npm:@automerge/automerge";

await Am.initializeBase64Wasm(automergeWasmBase64);
```

### Val.town

Val.town runs on a locked down Deno environment, so you'll need to do this:

```typescript
import { automergeWasmBase64 } from "npm:@automerge/automerge";
import { next as Am } from "npm:@automerge/automerge";

await Am.initializeBase64Wasm(automergeWasmBase64);
```

## The escape hatch

If you're in an environment which doesn't support importing WebAssembly modules as ES modules then you need to initialize the WebAssembly manually. There are two parts to this:

* Change all imports in your application of `@automerge/automerge` and `@automerge/automerge-repo` to the "slim" variants (`@automerge/automerge/slim` and `@automerge/automerge-repo/slim)`
* Obtain the WebAssembly module and initialize it manually, then wait for initialization to complete.

For this latter part we expose two exports from the `@automerge/automerge` package which can be used to obtain the raw WebAssembly. `@automerge/automerge/automerge.wasm` is a binary version of the WebAssembly file, whilst `@automerge/automerge/automerge.wasm.base64.js` is a JS modules with a single export called `automergeWasmBase64` which is a base64 encoded version of the WebAssembly file.

Once you've obtained the WebAssembly file you initialize it by passing it to either `initializeWasm` - which expects a WebAssembly module or a URL to fetch - or to `initializeBase64Wasm` which expects a base64 encoded string.

### Using the raw WebAssembly

Here's an example of using the raw WebAssembly in a Vite application. Here we can use the `?url` suffix on an import to obtain the URL to an asset.

```javascript
// Note the ?url suffix
import wasmUrl from "@automerge/automerge/automerge.wasm?url";
// Note the `/slim` suffixes
import { next as Automerge } from "@automerge/automerge/slim";
import { Repo } from `@automerge/automerge-repo/slim`;

await next.initializeWasm(wasmUrl)

// Now we can get on with our lives

const repo = new Repo({..})
```

### Using the base64 encoded WebAssembly

Here's an example of using the raw WebAssembly in an application where we can load JavaScript files but nothing else.

```javascript
import { automergeWasmBase64 } from "@automerge/automerge/automerge.wasm.base64.js";
// Note the `/slim` suffixes
import { next as Automerge } from "@automerge/automerge/slim";
import { Repo } from `@automerge/automerge-repo/slim`;

await next.initializeBase64Wasm(automergeWasmBase64)

// Now we can get on with our lives
const repo = new Repo({..})
```

