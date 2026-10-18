# EDivider

A hairline in `border`.

```vue
<EDivider />
<EDivider label="Or" />
```

## Props

| Prop    | Type     | Default | Notes                                                               |
| ------- | -------- | ------- | ------------------------------------------------------------------- |
| `label` | `string` | none    | Set in a mono kicker between two rules. Without it, a plain `<hr>`. |

No slots. Native attributes land on the root (`<hr>` or the labelled `<div>`).

## Rules

- Use it between sections of a form or list; do not stack it against a Panel's own edge.

## Accessibility

- Without a label it is an `<hr>`, which has the `separator` role. With a label it is a `<div role="separator">` and the label is visible text.
