# EProgress

A progress bar for a known fraction. Use `ESpinner` or `ELoadingBar` when the length is unknown.

```vue
<EProgress label="Upload" :value="40" />
<EProgress label="Steps" :value="2" :max="4" value-text="2 of 4" />
```

## Props

| Prop        | Type     | Default | Notes                                               |
| ----------- | -------- | ------- | --------------------------------------------------- |
| `label`     | `string` |         | Required. What is progressing; the accessible name. |
| `value`     | `number` |         | Required. From 0 to `max`; the fill is clamped.     |
| `max`       | `number` | `100`   | The value that means finished.                      |
| `valueText` | `string` | percent | Text at the end of the row.                         |

`class`, `style` and attributes land on the `div` element.

## Accessibility

- `role="progressbar"` with `aria-label`, `aria-valuemin`, `aria-valuemax` and `aria-valuenow`.
