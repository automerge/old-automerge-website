---
sidebar_position: 2
---  

# Networking

There are many ways to talk to other peers. In `automerge-repo` this is captured by the [`NetworkAdapter`](https://automerge.org/automerge-repo/classes/_automerge_automerge_repo.NetworkAdapter.html) interface. Unlike `StorageAdapter`s a repository can have many (or zero) `NetworkAdapter`s. 

"network" is quite a broad term in `automerge-repo`. It really means "any other instance of `Repo` which I am communicating with by message passing". This means that as well as network adapters for obvious things like websockets, we also implement network adapters for less traditional channels such as [`MessageChannel`](https://developer.mozilla.org/en-US/docs/Web/API/MessageChannel) or [`BroadcastChannel`](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel).

## Websockets

The websocket `NetworkAdapter` has two parts. This is because the websocket protocol requires a server and a client. The parts are named `NodeWSServerAdapter` and `BrowserWebsocketClientAdapter`, but don't take these names too seriously, they will both work in a browser or in Node.

### Server

The server side of the adapter is [`NodeWSServerAdapter`](https://automerge.org/automerge-repo/classes/_automerge_automerge_repo_network_websocket.NodeWSServerAdapter.html), which should be used in combination with the [`ws`](https://www.npmjs.com/package/ws) library. 

```typescript
import { WebSocketServer } from "ws"
import { NodeWSServerAdapter } from "@automerge/automerge-repo-network-websocket"

const wss = new WebSocketServer({ port: 8080 })
const adapter = new NodeWSServerAdapter(wss)
```

#### Usage with `express`

Often you aren't running the websocket server as a standalone thing but instead as part of an existing HTTP server. Here's an example of such a situation in an `express` app.

```typescript

import { WebSocketServer } from "ws"
import { NodeWSServerAdapter } from "@automerge/automerge-repo-network-websocket"
import express from "express"

const wss = new WebSocketServer({ noServer: true })
const server = express()
server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (socket) => {
    wss.emit("connection", socket, request)
  })
})
const adapter = new NodeWSServerAdapter(wss)
server.listen(8080)
```

### Client

The client side of the connection is [`BrowserWebsocketClientAdapter`](https://automerge.org/automerge-repo/classes/_automerge_automerge_repo_network_websocket.BrowserWebSocketClientAdapter.html). 

```typescript
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket"

const network =  new BrowserWebSocketClientAdapter("ws://localhost:3030")
```

## MessageChannel

[`@automerge/automerge-repo-network-messagechannel`]( https://automerge.org/automerge-repo/modules/_automerge_automerge_repo_network_messagechannel.html) is a `NetworkAdapter` for communicating between processes within the same browser using a [`MessageChannel`](https://developer.mozilla.org/en-US/docs/Web/API/MessageChannel).

```typescript
import { MessageChannelNetworkAdapter } from "@automerge/automerge-repo-network-messagechannel"
import { Repo } from "@automerge/automerge-repo"

const { port1: leftToRight, port2: rightToLeft } = new MessageChannel()
const rightToLeft = new MessageChannelNetworkAdapter(rightToLeft)
const leftToRight = new MessageChannelNetworkAdapter(leftToRight)

const left = new Repo({
  network: [leftToRight],
})
const right = new Repo({
  network: [rightToLeft],
})
```

## BroadcastChannel

[`@automerge/automerge-repo-network-broadcastchannel`](https://automerge.org/automerge-repo/modules/_automerge_automerge_repo_network_broadcastchannel.html) is a `NetworkAdapter` for commuicating between processes in the same browser using a [`BroadcastChannel`](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel). This will in general be quite inefficient because the sync protocol is point-to-point so even though `BroadcastChannel` is a _broadcast_ channel, we still have to duplicate each message for every peer in the channel. It's better to use `MessageChannel` if you can, but `BroadcastChannel` is good in a pinch.

```typescript
import { BroadcastChannelNetworkAdapter } from "@automerge/automerge-repo-network-broadcastchannel"

const network = new BroadcastChannelNetworkAdapter()
```
