# ESpinner

A ring that shows a single action is in progress. Say what is being waited for.

```vue
<ESpinner label="Processing your payment" />
```

## Props

<!-- props:start -->

| Prop    | Type      | Default | Notes                                                                                                                                                      |
| ------- | --------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label` | `string`  | None    | Shown beside the ring. The spinner is a `status` region, so a label that appears with it is announced politely. Without one, screen readers get "Loading". |
| `size`  | `Size`    | None    | The ring: `sm` 20px, `md` 28px, `lg` 40px.                                                                                                                 |
| `small` | `boolean` | `false` | A smaller ring. Same as `size="sm"`.                                                                                                                       |
| `large` | `boolean` | `false` | A larger ring. Same as `size="lg"`.                                                                                                                        |
| `block` | `boolean` | `false` | Centre it in a panel.                                                                                                                                      |

<!-- props:end -->

`class`, `style` and attributes land on the `span` element. `size` is `sm` (20px), `md` (28px) or `lg` (40px); `small` and `large` are shorthand for it.

## Accessibility

- Always `role="status"`: the label (or "Loading") is announced politely when the spinner appears. Mount it where the wait begins, not at page load, or the first announcement is missed.
- The ring stops turning under reduced motion.

## Keyboard

Not focusable and takes no keys.

## Related

[`EProgress`](../Progress/README.md) for a known fraction, [`ESkeleton`](../Skeleton/README.md) for content that is loading.
