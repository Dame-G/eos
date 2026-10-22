# ESpinner

A ring that shows a single action is in progress. Say what is being waited for.

```vue
<ESpinner label="Processing your payment" />
```

## Props

<!-- props:start -->

| Prop    | Type      | Default | Notes                                                                 |
| ------- | --------- | ------- | --------------------------------------------------------------------- |
| `label` | `string`  | None    | Shown beside the ring. Without it the ring is announced as "Loading". |
| `block` | `boolean` | `false` | Centre it in a panel.                                                 |

<!-- props:end -->

`class`, `style` and attributes land on the `span` element.

## Accessibility

- `role="status"`, so the text is announced politely when it appears.
