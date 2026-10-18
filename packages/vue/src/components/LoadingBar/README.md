# AeLoadingBar

A thin bar that slides across its track while something of unknown length loads. It fills the width of its container, so put it at the top of a Panel, above the list it is loading, or under a heading.

```vue
<AeLoadingBar label="Loading statements" />
```

## Props

| Prop    | Type     | Default   | Notes                                                                          |
| ------- | -------- | --------- | ------------------------------------------------------------------------------ |
| `label` | `string` | "Loading" | What is loading (message `loading`). Screen readers hear it as a progress bar. |

No slots. Native attributes land on the root `<div>`.

## Rules

- Use it for a page, list or statement that takes more than a moment. Use Skeleton to hold the shape of what is coming, and Spinner for a single action. For an amount you can measure (a form's steps, an upload) use Progress.
- It is 8px tall with a visible edge, and the moving part is the `primary` fill (7.9:1 on the track).
- Under reduced motion it stops and the fill is a static diagonal stripe, so it still reads as busy. In forced colours it uses the system highlight.
- Pair it with text when the wait may be long; do not stack it with a Spinner.

## Accessibility

- `role="progressbar"` with `aria-label` and `aria-busy="true"`, and no value, which marks it as indeterminate.
