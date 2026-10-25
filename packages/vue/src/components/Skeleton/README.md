# ESkeleton

A placeholder shown while content loads. Size it like what is coming. Use [`ESpinner`](../Spinner/README.md) for a single wait and [`EProgress`](../Progress/README.md) for a known fraction.

```vue
<ESkeleton :height="220" />
<ESkeleton circle :height="56" />
<ESkeleton :lines="3" label="Loading the statement" />
```

## Props

<!-- props:start -->

| Prop     | Type               | Default      | Notes                                                                                                                                                           |
| -------- | ------------------ | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `height` | `number \| string` | `96`         | A number is in px and a string is any CSS length. Ignored with `lines` or `text`.                                                                               |
| `width`  | `number \| string` | `full width` | Same units as `height`.                                                                                                                                         |
| `circle` | `boolean`          | `false`      | A round block, for a photo. The width follows `height`.                                                                                                         |
| `lines`  | `number`           | None         | Draws this many lines of text, the last one shorter, instead of a block.                                                                                        |
| `text`   | `boolean`          | `false`      | One line of text. Same as `lines` of 1.                                                                                                                         |
| `label`  | `string`           | None         | Names what is loading. It is announced politely when the skeleton appears, and kept as text for screen readers, instead of the skeleton being hidden from them. |

<!-- props:end -->

`class`, `style` and attributes land on the `div` element. `style` is merged with the size.

## CSS contract

The styling lives in `skeleton.css`, so a component can show the placeholder without rendering `ESkeleton`:

| Class                 | Is                                                                                      |
| --------------------- | --------------------------------------------------------------------------------------- |
| `.e-skeleton`         | A block, sized by the element's `width` and `height`.                                   |
| `.e-skeleton--circle` | Makes the block round and square.                                                       |
| `.e-skel`             | One line of text, as tall as the body text and as wide as its parent. A cell holds one. |
| `.e-skeleton-lines`   | A grid of `.e-skel` lines with the snug gap. Its last line is shorter.                  |

An element that carries these classes is `aria-hidden="true"` and sits in a region that announces its own loading.

## Accessibility

- Without a `label` it is hidden from assistive technology (`aria-hidden="true"`), so a page of placeholders adds no live-region noise. Mark the region that is loading with `aria-busy="true"` or announce the result with `useAnnouncer()`.
- With a `label` the label is announced politely when the skeleton appears, and stays as text for screen readers, for a skeleton that is the only sign that something is loading.
- The pulse stops under reduced motion.

Not focusable.

## Related

[`EEmptyState`](../EmptyState/README.md) for when nothing came back.
