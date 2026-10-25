# EDivider

A hairline between sections of a form or list, optionally with a centred label. Between blocks of a page, the gap of [`EStack`](../Stack/README.md) is enough.

```vue
<EDivider />
<EDivider label="Or" />
```

## Props

<!-- props:start -->

| Prop       | Type      | Default | Notes                                                                                                                                              |
| ---------- | --------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`    | `string`  | None    | Text shown between two rules. Without it the divider is a plain hairline. It also names the separator for screen readers. Ignored when `vertical`. |
| `vertical` | `boolean` | `false` | A vertical rule between items in a row. It stretches to the height of the row.                                                                     |

<!-- props:end -->

`class`, `style` and attributes land on the `hr` element, or on the `div` element when there is a `label`.

## Accessibility

- Without a label it is an `hr`. With one it is a `div` with `role="separator"` named by the label, and the visible text is hidden from screen readers so it is not read twice.
- `vertical` sets `aria-orientation="vertical"`.

Not focusable.

## Related

[`EInline`](../Inline/README.md) for a row with no rule.
