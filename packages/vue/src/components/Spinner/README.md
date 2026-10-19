# ESpinner

A ring that shows a single action is loading. Say what is being waited for.

```vue
<ESpinner label="Processing your payment" />
```

## Props

| Prop    | Type      | Default | Notes                                                             |
| ------- | --------- | ------- | ----------------------------------------------------------------- |
| `label` | `string`  |         | Shown beside the ring. Without it, screen readers hear "Loading". |
| `block` | `boolean` |         | Centres the spinner in a panel.                                   |

`class`, `style` and attributes land on the `span` element.

## Accessibility

- `role="status"`, so the text is announced politely when it appears.
