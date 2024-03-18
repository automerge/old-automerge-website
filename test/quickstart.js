const Automerge = require("automerge");

let doc1 = Automerge.init();

doc1 = Automerge.change(doc1, "Add card", (doc) => {
  doc.cards = [];
  doc.cards.push({ title: "Rewrite everything in Clojure", done: false });
  doc.cards.push({ title: "Rewrite everything in Haskell", done: false });
});

console.log("initial doc");
console.log(doc1);

let doc2 = Automerge.init();
doc2 = Automerge.merge(doc2, doc1);

doc1 = Automerge.change(doc1, "Mark card as done", (doc) => {
  doc.cards[0].done = true;
});
doc2 = Automerge.change(doc2, "Delete card", (doc) => {
  delete doc.cards[1];
});

let finalDoc = Automerge.merge(doc1, doc2);
console.log("final doc");
console.log(finalDoc);

const history = Automerge.getHistory(finalDoc).map((state) => [
  state.change.message,
  state.snapshot.cards.length,
]);
console.log("history");
console.log(history);
