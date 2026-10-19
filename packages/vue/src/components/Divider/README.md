# EDivider

A hairline between sections of a form or list, optionally with a centred label.

```vue
<EDivider />
<EDivider label="Or" />
```

## Props

| Prop    | Type     | Default | Notes                                              |
| ------- | -------- | ------- | -------------------------------------------------- |
| `label` | `string` |         | Set between two rules. Without it, a plain `<hr>`. |

`class`, `style` and attributes land on the `hr` element, or on the `div` element when there is a `label`.

## Accessibility

- Without a label it is an `hr`; with one it is a `div` with `role="separator"` and visible text.
