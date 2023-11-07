---
sidebar_position: 1000
---

# Glossary

## CRDTs

Automerge is a type of CRDT (Conflict-Free Replicated Datatype). A CRDT is a data structure that simplifies multi-user applications. We can use them to synchronize data between two devices in a way that both devices see the same application state.  In many systems, copies of some data need to be stored on multiple computers. Examples include:
  * Mobile apps that store data on the local device, and that need to sync that data to other devices belonging to the same user (such as calendars, notes, contacts, or reminders);
  * Distributed databases, which maintain multiple replicas of the data (in the same datacenter or in different locations) so that the system continues working correctly if some of the replicas are offline;
  * Collaboration software, such as Google Docs, Trello, Figma, or many others, in which several users can concurrently make changes to the same file or data;
  * Large-scale data storage and processing systems, which replicate data in order to achieve global scalability.

*[Read more about CRDTs](https://crdt.tech/)*


## Eventual Consistency

Applications built with Automerge are *eventually consistent.* This means if several users are working together, they will *eventually* all see the same application state, but at any given moment it's possible for the users to be temporarily out of sync.

Eventual consistency allows applications to work offline: even if a user is disconnected from the internet, Automerge allows that user to view and modify their data. If the data is shared between several users, they may all update their data independently. Later, when a network is available again, Automerge ensures that those edits are cleanly merged. See the page on [conflicts](/docs/documents/conflicts/) for more detail on these merges.

## Documents

A document is a collection of data that holds the current state of the application. A document in Automerge is represented as an object. Each document has a set of keys which can be used to hold variables that are one of the Automerge datatypes.

## Types

All collaborative data structures conform to certain rules. Each variable in the document must be of one of the implemented types. Each type must conform to the rules of CRDTs. Automerge comes with a set of [pre-defined types](/docs/documents/values) such as `Map`, `Array`, `Counter`, `number`, `Text`, and so on.

## Changes

A change describes some update to a document; think of it like a commit in Git. A change could perform several operations, for example setting several properties or updating several objects within the document, and these will all be executed atomically. Changes are commutative, which means that the order in which they are applied does not matter. When the same set of changes has been applied to two documents, Automerge guarantees that they will be in the same state.

To do this, typically each change depends upon a previous change. Automerge creates a directed acyclic graph (DAG) of changes. To learn more about how automerge works internally, see the [Internals](/docs/how-it-works/backend/) section.

## History

Each change that is made to a data structure builds upon other changes to create a shared, materialized view of a document. Each change is dependent on a previous change, which means that all replicas are able to construct a history of the data structure. This is a powerful property in multi-user applications, and can be implemented in a way that is storage and space efficient.

## Compaction

Compaction is a way to serialize the current state of the document without the history. You might want to do this when:

* You don't want to replicate the entire history because of bandwidth or resource concerns on the target device. This might be useful in embedded systems or mobile phones.
* A deleted element contains some sensitive information that you would like to be purged from the history.

The downsides of compacting the history of a document include not being able to synchronize that compacted document with another document that doesn't have a common ancestor. 

## Synchronization

When two or more  devices make changes to a document, and then decide to exchange those changes to come to a consistent state, we call that *synchronization*. Synchronization can, in the most simple implementation, consist of sending the full list of changes in the history to all connected devices. To improve performance, devices may negotiate which changes are missing on either end and exchange only those changes which are missing, rather than the entire change history.

