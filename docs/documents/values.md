---
sidebar_position: 2
---

# Simple Values

All JSON primitive datatypes (`object`, `array`, `string`, `number`, `boolean`, `null`) are
supported in an Automerge document. In addition, JavaScript [Date
objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) are
supported.

_Remember, never modify `currentDoc` directly, only ever change `doc` inside the callback to `Automerge.change`!_

```js
newDoc = Automerge.change(currentDoc, (doc) => {
  doc.property = "value"; // assigns a string value to a property
  doc["property"] = "value"; // equivalent to the previous line
  delete doc["property"]; // removes a property

  doc.stringValue = "value";
  doc.numberValue = 1;
  doc.boolValue = true;
  doc.nullValue = null;
  doc.nestedObject = {}; // creates a nested object
  doc.nestedObject.property = "value";
  // you can also assign an object that already has some properties
  doc.otherObject = { key: "value", number: 42 };

  // By default, strings are collaborative sequences of characters. There are
  // cases where you want a string which is not collaborative - URLs for example
  // should generally be updated in one go. In this case you can use `RawString`,
  // which does not allow concurrent updates.
  doc.atomicStringValue = new Automerge.RawString("");
});
```

:::caution  
Note that `undefined` is not a valid JSON value, and it can't be used in an Automerge document.
:::

This will throw an error:

```js
newdoc = Automerge.change(currentDoc, (doc) => {
  doc.something = undefined; // ❌ Cannot assign undefined value at /something
});
```

Instead, you might consider setting a property's value to `null`, or using `delete` to remove it
altogether.
