# ESpinner

A ring that shows a single action is in progress. Say what is being waited for.

```vue
<ESpinner label="Processing your payment" />
```

## Props

<!-- props:start -->

| Prop    | Type      | Default | Notes                                                                                                                          |
| ------- | --------- | ------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `label` | `string`  | None    | Shown beside the ring and announced politely when it appears. Without it the ring is not a live region and reads as "Loading". |
| `small` | `boolean` | `false` | A smaller ring.                                                                                                                |
| `large` | `boolean` | `false` | A larger ring.                                                                                                                 |
| `block` | `boolean` | `false` | Centre it in a panel.                                                                                                          |

<!-- props:end -->

`class`, `style` and attributes land on the `span` element.

## Accessibility

- With a `label` it is `role="status"`, so the text is announced politely when it appears. Without one it is plain text that reads "Loading" and adds no live region, which keeps a page of spinners quiet.
- The ring stops turning under reduced motion.

## Keyboard

Not focusable and takes no keys.

## Related

[`EProgress`](../Progress/README.md) for a known fraction, [`ESkeleton`](../Skeleton/README.md) for content that is loading.
