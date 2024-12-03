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

### Unbundled (Vanilla) JS

If you'd rather use Automerge outside of any build processes, you can use something like the following example:

```javascript
// This approach requires the initializeWasm export not yet found in the stable 1.2.1 release.
import * as AutomergeRepo from "https://esm.sh/@automerge/automerge-repo@2.0.0-alpha.14/slim?bundle-deps"
import { IndexedDBStorageAdapter } from "https://esm.sh/@automerge/automerge-repo-storage-indexeddb@2.0.0-alpha.14?bundle-deps"
import { BrowserWebSocketClientAdapter } from "https://esm.sh/@automerge/automerge-repo-network-websocket@2.0.0-alpha.14?bundle-deps"
import { MessageChannelNetworkAdapter } from "https://esm.sh/@automerge/automerge-repo-network-messagechannel@2.0.0-alpha.14?bundle-deps"

await AutomergeRepo.initializeWasm(
  fetch("https://esm.sh/@automerge/automerge/dist/automerge.wasm")
)

// Then set up an automerge repo (loading with our annoying WASM hack)
const repo = new AutomergeRepo.Repo({
    storage: new IndexedDBStorageAdapter(),
    network: [new BrowserWebSocketClientAdapter("wss://sync.automerge.org")],
})
```

Note that in some environments you may not have support for top-level await, in which case, you can run the last two statements inside an async function.

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

Val.town is a cloud-based Deno execution platform. Here's the text of a simple "val" which returns the contents of the documentId passed via the path.

```typescript
import { BrowserWebSocketClientAdapter } from "npm:@automerge/automerge-repo-network-websocket";
import { isValidAutomergeUrl, Repo } from "npm:@automerge/automerge-repo/slim";

/* set up Automerge's internal wasm guts manually */
import { automergeWasmBase64 } from "npm:@automerge/automerge/automerge.wasm.base64.js";
import * as automerge from "npm:@automerge/automerge/slim";
await automerge.next.initializeBase64Wasm(automergeWasmBase64);

/* This example will return the contents of a documentID passed in as the path as JSON. */
export default async function(req: Request): Promise<Response> {
  const docId = new URL(req.url).pathname.substring(1);

  if (!isValidAutomergeUrl("automerge:" + docId)) {
    return Response.error();
  }

  const repo = new Repo({ network: [new BrowserWebSocketClientAdapter("wss://sync.automerge.org")] });
  const handle = repo.find(docId);
  const contents = await handle.doc();
  return Response.json(contents);
}
```

## The escape hatch

If you're in an environment which doesn't support importing WebAssembly modules as ES modules then you need to initialize the WebAssembly manually. There are two parts to this:

* Change all imports in your application of `@automerge/automerge` and `@automerge/automerge-repo` to the "slim" variants (`@automerge/automerge/slim` and `@automerge/automerge-repo/slim)`
* Obtain the WebAssembly module and initialize it manually, then wait for initialization to complete.

For this latter part we expose two exports from the `@automerge/automerge` package which can be used to obtain the raw WebAssembly. `@automerge/automerge/automerge.wasm` is a binary version of the WebAssembly file, whilst `@automerge/automerge/automerge.wasm.base64.js` is a JS modules with a single export called `automergeWasmBase64` which is a base64 encoded version of the WebAssembly file.

:::note
Automerge's npm module uses the [package exports](https://nodejs.org/api/packages.html#exports) feature, which means your environment will need to support that.

For example, React Native requires [configuring](https://reactnative.dev/blog/2023/06/21/package-exports-support) a `metro.config.js` to support package exports:

```js
const {getDefaultConfig} = require("expo/metro-config")
const config = getDefaultConfig(__dirname)
config.resolver && (config.resolver.unstable_enablePackageExports = true)
module.exports = config
```
:::

Once you've obtained the WebAssembly file you initialize it by passing it to either `initializeWasm` - which expects a WebAssembly module or a URL to fetch - or to `initializeBase64Wasm` which expects a base64 encoded string.

### Using the raw WebAssembly

Here's an example of using the raw WebAssembly in a Vite application. Here we can use the `?url` suffix on an import to obtain the URL to an asset.

```javascript
// Note the ?url suffix
import wasmUrl from "@automerge/automerge/automerge.wasm?url";
// Note the `/slim` suffixes
import { next as Automerge } from "@automerge/automerge/slim";
import { Repo } from "@automerge/automerge-repo/slim";

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

