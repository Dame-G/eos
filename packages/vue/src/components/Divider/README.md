# EDivider

A hairline between sections of a form or list, optionally with a centred label.

```vue
<EDivider />
<EDivider label="Or" />
```

## Props

<!-- props:start -->

| Prop    | Type     | Default | Notes                                                                                    |
| ------- | -------- | ------- | ---------------------------------------------------------------------------------------- |
| `label` | `string` | —       | Text set in a mono kicker between two rules. Without it the divider is a plain hairline. |

<!-- props:end -->

`class`, `style` and attributes land on the `hr` element, or on the `div` element when there is a `label`.

## Accessibility

- Without a label it is an `hr`; with one it is a `div` with `role="separator"` and visible text.
