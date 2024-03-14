---
sidebar_position: 3
---

# Merge Rules

:::info

It isn't important to understand this section to use automerge. You can just let automerge handle merging for you. But it may be interesting to understand.

:::

How does automerge merge concurent changes? Well, let's think about what kinds of concurrent changes are possible. Automerge documents always carry their history with them, so the way to think about two concurrent versions of a document is as the set of changes since some common ancestor.

```mermaid
graph LR
    A --> B
    B --> C
    C --> D
    D --> E
    C --> F
    F --> G
```

Here the common ancestor is `C` and the concurrent changes are `(D,E)` and `(F,G)`.

Automerge documents are composed of nested maps and lists or simple values or text sequences. We can describe the merge rules by describing the rules for maps, lists, text, and counters independently. In each case we describe how to merge two sets of concurrent changes we refer to as `A` and `B`.

## Map merge rules

* If `A` sets key $x$ to a value and `B` sets key $y$ to a value and $x \neq y$ then add both $x$ and $y$ to the merged map
* If `A` deletes key $x$ and `B` makes no change to $x$ then remove $x$ from the merged map
* If `A` deletes key $x$ and `B` sets $x$ to a new value then set the value of $x$ to the new value `B` set in the merged map
* If both `A` and `B` delete key $x$ then delete $x$ from the merged map
* If both `A` and `B` set the key $x$ to some value then randomly choose one value

Note that "randomly choose" means "choose one arbitrarily, but in such a way that all nodes agree on the chosen value".

## List merge rules

To understand the way lists merge you need to know a little about how the operations on lists are expressed. Every element in a list has an ID and operations on the list reference these IDs. When you update an index in a list (using `list[<index>] = <value>` in a `change` function in the JS library) the operation which is created references the ID of the element currently at `index`. Likewise when you delete an element from a list the delete operation which is created references the deleted element at the given index. When you _insert_ elements into a list the insert operation references the ID of the element you are inserting after

In the following then  when we say "index $x$" that really means "the ID of the element at index $x$ at the time the operation was created".

* If `A` inserts an element after index $i$ and `B` inserts an element after index $i$ then arbitrarily choose one to insert first and then insert the other immediately afterwards
* If `A` deletes element at index $i$ and `B` updates the element at $i$ then set the value of $i$ to the updated value from `B`
* If `A` and `B` both delete element $i$ then remove it from the merged list

Note that inserting a run of elements will maintain the insertion order of the replica which generated it. Imagine we have some list `[a, b]` and say `A` inserts the sequence `[d, e]` after `a` whilst `B` inserts `[f, g]` after `a`. Initially the  set of operations are:

| Operation ID | Reference element | Value |
| -------------|-------------------|-------|
|      A       |       None        |  `a`  |
|      B       |       `A`         |  `b`  |

The operations after inserting on `A` are

| Operation ID | Reference element | Value |
| -------------|-------------------|-------|
|      A       |       None        |  `a`  |
|      B       |       `A`         |  `b`  |
|      D       |       `B`         |  `d`  |
|      E       |       `D`         |  `e`  |

And on `B`

| Operation ID | Reference element | Value |
| -------------|-------------------|-------|
|      A       |       None        |  `a`  |
|      B       |       `A`         |  `b`  |
|      F       |       `B`         |  `f`  |
|      G       |       `F`         |  `g`  |

Here you can see that while both `F` and `D` insert after the same reference element (`B`) the following operations reference the element that was just inserted on the local replica. That is, automerge must arbitrarily choose one of either `F` or `D` to be inserted after `B`, but after that the operations stay in the same order as they were inserted on each node. Let's say that `A` is chosen, then the final order of operations will be

| Operation ID | Reference element | Value |
| -------------|-------------------|-------|
|      A       |       None        |  `a`  |
|      B       |       `A`         |  `b`  |
|      D       |       `B`         |  `d`  |
|      E       |       `D`         |  `e`  |
|      F       |       `B`         |  `f`  |
|      G       |       `F`         |  `g`  |

There are cases where this algorithm does not preserve insertion order - primarily when inserting elements in reverse - but most of the time it does a good job.

## Text merge rules

The characters of a text object are merged using the same logic as lists. For a description of the merge rules for marks see [Peritext](https://www.inkandswitch.com/peritext/)

## Counter merge rules

Counters are very simple, we just sum all the individual operations from each node.
