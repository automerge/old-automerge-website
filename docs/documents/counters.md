---
sidebar_position: 3
---

# Counters

If you have a numeric value that is only ever changed by adding or subtracting (e.g. counting how
many times the user has done a particular thing), you should use the `Automerge.Counter` datatype
instead of a plain number, because it deals with concurrent changes correctly.

> **Note:** Using the `Automerge.Counter` datatype is safer than changing a number value yourself
> using the `++` or `+= 1` operators. For example, suppose the value is currently **3**:
>
> - If two users increment it concurrently, they will both register **4** as the new value, whereas
>   the two increments should result in a value of **5**.
> - If one user increments twice and the other user increments three times before the documents are
>   merged, we will now have [conflicting changes](#conflicting-changes) (**5** vs. **6**), rather
>   than the desired value of **8** (3 + 2 + 3).

To set up a `Counter`:

```js
state = Automerge.change(state, (doc) => {
  // The counter is initialized to 0 by default. You can pass a number to the
  // Automerge.Counter constructor if you want a different initial value.
  doc.buttonClicks = new Automerge.Counter();
});
```

To get the current counter value, use `doc.buttonClicks.value`. Whenever you want to increase or
decrease the counter value, you can use the `.increment()` or `.decrement()` method:

```js
state = Automerge.change(state, (doc) => {
  doc.buttonClicks.increment(); // Add 1 to counter value
  doc.buttonClicks.increment(4); // Add 4 to counter value
  doc.buttonClicks.decrement(3); // Subtract 3 from counter value
});
```

> **Note:** In relational databases it is common to use an auto-incrementing counter to generate
> primary keys for rows in a table, but this is not safe in Automerge, since several users may end
> up generating the same counter value! Instead it is best to use UUIDs to identify entities.
