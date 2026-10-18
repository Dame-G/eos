# EProgress

A progress bar for a known fraction. The track is outlined and the fill is `primary`, so the filled share reads without colour.

```vue
<EProgress label="Upload" :value="40" />
<EProgress label="Steps" :value="2" :max="4" value-text="2 of 4" />
```

## Props

| Prop        | Type     | Default | Notes                                                          |
| ----------- | -------- | ------- | -------------------------------------------------------------- |
| `label`     | `string` | none    | Required. What is progressing; also the bar's accessible name. |
| `value`     | `number` | none    | Required. From 0 to `max`; the fill is clamped to the track.   |
| `max`       | `number` | `100`   | The value that means finished.                                 |
| `valueText` | `string` | percent | Text at the end of the row. Default is a rounded percentage.   |

No slots. Native attributes land on the root `<div>`.

## Rules

- Use it for a known fraction; use Spinner or LoadingBar when the length is unknown.
- The fill animates its width; the animation stops under reduced motion. In forced colours the fill is the system highlight.

## Accessibility

- The track is `role="progressbar"` with `aria-label`, `aria-valuemin`, `aria-valuemax` and `aria-valuenow`.
