---
sidebar_position: 1
title: "Tutorial: An Automerge todo list"
---

import { jsx } from "react/jsx-runtime";
import Admonition from "@theme/Admonition";
import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";
import Figure from "../components/Figure";

import taskListSync from "../../static/img/tutorial/task-list-sync.webm";
import taskListPreAmg from "../../static/img/tutorial/task-list-pre-automerge.webm";

Automerge is a suite of tools for building [local-first](https://www.inkandswitch.com/local-first) web applications with real-time synchronization that works on and offline.

In this tutorial, you'll build a local-first multiplayer app with TypeScript, React, [Vite](https://vite.dev), and Automerge. You'll discover how to:

- Represent data as Automerge [Documents](/docs/reference/concepts/#documents)
- [Change](/docs/reference/documents/conflicts/) documents' data and [merge](/docs/reference/under-the-hood/merge_rules/) changes from different peers
- Store & synchronize a set of documents in an Automerge [Repository](/docs/reference/concepts/#repositories)
- Build a multiplayer realtime web app with the Automerge [React client](https://github.com/automerge/automerge-repo/tree/main/packages/automerge-repo-react-hooks)

<Figure
  src={taskListSync}
  type="video"
  alt='Screen capture of two browser windows side-by-side showing the same app titled "Automerge Task List". As the user clicks buttons, enters text or checks boxes in one window, their changes show up immediately in the other window.'
  caption="The app in action. Data is stored locally, and Automerge syncs changes between users automatically."
/>
