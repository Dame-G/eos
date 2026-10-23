# EKicker

A small label above a value or a section. It is a label, not a heading: use [`EHeading`](../Heading/README.md) for the title that follows.

```vue
<EKicker>Balance</EKicker>
```

## Props

<!-- props:start -->

| Prop | Type         | Default | Notes                                                   |
| ---- | ------------ | ------- | ------------------------------------------------------- |
| `as` | `ElementTag` | `"p"`   | The element to render, if it should not be a paragraph. |

<!-- props:end -->

`class`, `style` and attributes land on the rendered element. Write sentence case, since the style sets capitals.

## Slots

| Slot      | Use             |
| --------- | --------------- |
| `default` | The label text. |

## Accessibility

- A `p` by default, so it is absent from heading navigation.
- To name a region with it, give it an `id` and point `aria-labelledby` at that id from the region.
- The capitals come from CSS, so assistive technology reads the sentence-case text you wrote.
- Keep it for short labels rather than body copy.

## Keyboard

| Key | Action                     |
| --- | -------------------------- |
| Tab | A kicker is not focusable. |

## Related

[`EHeading`](../Heading/README.md) for the title that follows, [`EField`](../Field/README.md) for a field label.
