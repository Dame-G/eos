# ESpinner

A ring that shows a single action is in progress. Say what is being waited for. Use [`ESkeleton`](../Skeleton/README.md) while a block loads and [`EProgress`](../Progress/README.md) for a known length.

```vue
<ESpinner label="Processing your payment" />
```

## Props

<!-- props:start -->

| Prop     | Type                   | Default | Notes                                                                                                                                    |
| -------- | ---------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `label`  | `string`               | None    | Shown beside the ring, and announced politely when the spinner appears or the label changes. Without one, screen readers hear "Loading". |
| `size`   | `"sm" \| "md" \| "lg"` | `"md"`  | The ring: `sm` 20px, `md` 28px, `lg` 40px.                                                                                               |
| `block`  | `boolean`              | `false` | Centre it in a panel.                                                                                                                    |
| `silent` | `boolean`              | `false` | Leaves the announcement to a parent that says what is loading itself. The words stay for anyone who reads the page.                      |

<!-- props:end -->

`class`, `style` and attributes land on the `span` element.

## Accessibility

- The label (or "Loading") is announced politely through the page's shared live region when the spinner appears and when the label changes. Mount it where the wait begins. Inside a part that announces its own state, set `silent`.
- The ring stops turning under reduced motion.

Not focusable.

## Related

[`EButton`](../Button/README.md) and [`EIconButton`](../IconButton/README.md) show the same ring with `loading`.
