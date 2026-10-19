# ELoadingBar

A thin bar that slides across its track while something of unknown length loads. Use `ESkeleton` to hold a shape, `ESpinner` for a single action and `EProgress` for a measurable amount.

```vue
<ELoadingBar label="Loading statements" />
```

## Props

| Prop    | Type     | Default   | Notes            |
| ------- | -------- | --------- | ---------------- |
| `label` | `string` | `Loading` | What is loading. |

`class`, `style` and attributes land on the `div` element. The bar fills the width of its container. Under reduced motion it becomes a static striped bar.

## Accessibility

- `role="progressbar"` with `aria-label` and `aria-busy="true"` and no value (indeterminate).
- Pair it with text when the wait may be long.
