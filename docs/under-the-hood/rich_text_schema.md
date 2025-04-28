---
sidebar_position: 4
---

# Rich Text Schema

The [rich text](../../documents/rich_text) API provides a set of primitives for annotating a sequence of characters with formatting information. The two primitives in question are 

* Marks - formatting spans which apply to a range of characters and can overlap
* Block markers which divide the text into blocks

These primitives are flexible enough that there are a wide variety of ways to build an editor on top of them. This page documents the (extremely minimal) schema we use in the `automerge-prosemirror` bindings and which we hope is general and useful enough that other editor bindings could adopt it. This is a work in progress and we hope others will build on and contribute to it.

The requirements we have for this schema are:

1. The ability to represent inline text decoration such as bold spans, as well as semantic information like hyperlinks or code spans
2. A way of representing hierarchical structure which merges well - or, alternatively, which results in patches which are commensurate in size with the editing action the user took (inserting a paragraph is a single user action, we would like it to not result in a large patch which is hard to interpret)
3. A way for applications to extend the schema with their own specific mark and block types in such a way that there is still some degree of interoperability between applications

## Marks

We define the following marks

* `"strong"` - represents a span of bolded text, has value `true` if present
* `"em"` - represents a span of italicized text, has value `true` if present
* `"link"` - represents a span of text which links to a URL. The value is a string  representing the JSON serialization of the following object
    
    ```json
    {
        "href": "<the URL to link to>",
        "title": "<a description of what the link points to>"
    }
    ```

Any other mark names are application specific and should be prefixed by a probably unique string that begins `"__ext__"`. If an editor integration encounters a mark it does not recognise, the mark should be round tripped through the editor - I.e. if the users makes some change to the document via the editor integration, the mark should be left untouched.


## Block Markers

Blocks represent the hierarchical structure of the document. A block has the following type:

```typescript
{
    type: string,
    parents: string[],
    attrs: Record<string, any>,
    isEmbed: boolean,
}
```

All text following a block marker until the next block marker or the end of the document belongs to the block marker - except in the case of an `isEmbed: true` block, which will be described shortly.

The `type` of the block determines how the block is rendered. We define the following block types:

* `"paragraph"` - a block of text
* `"heading"` a heading. The `attrs` object should contain a `level` key which is a number from 1 to 6
* `"code-block"` - a block of code. The `attrs` object **MAY** have a `language: string` key which hints at what language the block contains
* `"blockquote"` - a block of quoted text
* `"ordered-list-item"` - An item in an ordered list (i.e. a numbered list)
* `"unordered-list-item"` - An item in an unordered list (i.e. a bulleted list)
* `"image"` - An image. The `attrs` object should contain the following keys:
     
    ```typescript
    {
        src: string // the URL of the image,
        alt: string | null // the alt text describing the content of the image,
        title: string | null// the title of the image,
    }
    ```
    An image block **SHOULD** have `isEmbed: true`

Any other block types are application specific and should be prefixed by a probably unique string that begins `"__ext__"`. If an editor integration encounters a block type it does not recognise the block should be rendered as a generic block element. Unrecognised attributes should be round tripped through the editor.

### `parents` - representing hierarchical structure

The `parents` array of a block represents the blocks which it appears inside. For example, a block like this:

```
{
    type: "paragraph",
    parents: ["blockquote"]
    attrs: {},
    isEmbed: false
}
```

Represents a paragraph which is inside a blockquote. We call the `path` of a block marker the array `[...parents, type]`. The children of some block `a` are all the blocks following that marker for which the path of `a` is a proper prefix of the child block's path. Note that because a blocks contents are always after it and before it's next sibling, paths don't need to be unique - they only need to provide enough information to clearly match where in the hierarchy a block sits.

:::info

Sometimes a block will reference a parent that doesn't exist in the list. When that happens - that parent is implicitly created with the defaults expected for it's block type. This ensures you can't accidentally remove a block's container by deleting the containing block or one of the block's siblings, since each block contains a minimal copy of the hierarchy needed to properly place it.
:::

For example, the following sequence of block marks:

```
{ parents: ["blockquote"], type: "paragraph" }
{ parents: ["blockquote", "ordered-list-item"], type: "paragraph" }
{ parents: [], type: "paragraph" }
```

Will result in the following hierarchy:

```
blockquote:
  - paragraph
  - ordered-list-item:
      - paragraph
paragraph
```

Note that the "blockquote" and "ordered-list-item" blocks are generated because they are parent's of the first two paragraphs, even though they aren't explicitly listed.

### Embeds

Blocks with `isEmbed: true` are blocks which are not part of the flow of text and represent some non-textual content such as an image. Embed block markers should _not_ break up the flow of text. I.e. the text following an `isEmbed: true` block marker belongs to the first non embed block preceding the embed block marker.

If an application encounters an unknown embed block it should render the block using some sort of generic UI and round trip the block through the editor. The editor **SHOULD** allow the user to delete the embedded block marker in some manner.
