# EVisuallyHidden

Text that is read out but not shown, for context sighted people get from layout, such as the receipt number after a Download button.

```vue
<EButton icon="download">Download <EVisuallyHidden>receipt 8842</EVisuallyHidden></EButton>
```

## Props

<!-- props:start -->

| Prop | Type     | Default  | Notes                  |
| ---- | -------- | -------- | ---------------------- |
| `as` | `string` | `"span"` | The element to render. |

<!-- props:end -->

`class`, `style` and attributes land on the rendered element.

## Slots

| Slot      | Use                                   |
| --------- | ------------------------------------- |
| `default` | The text that is read out, not shown. |

For text outside a Vue template, or on an element you already have, use the `e-sr` class: this component renders exactly that.

## Accessibility

- Never hide text a sighted person also needs, or repeat visible text.
- Leave a space where it joins visible words (" (done)").

Not focusable.

## Related

[`EText`](../Text/README.md) for text everyone sees.

<!-- lede: no sibling -->
