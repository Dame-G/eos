# EProgress

A progress bar. Give it a `value` for a known fraction; leave `value` out while the length is unknown and the bar slides back and forth (this replaces the old `ELoadingBar`). Use `ESpinner` for a small inline wait.

```vue
<EProgress label="Upload" :value="40" />
<EProgress label="Steps" :value="2" :max="4" value-text="2 of 4" />
<EProgress label="Checking your account" />
```

## Props

<!-- props:start -->

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `string` | `"Loading"` | What is progressing. Also the bar's accessible name. |
| `value` | `number` | — | How far along, from 0 to `max`; the fill is clamped. Leave it out while the length is unknown: the bar slides back and forth instead (indeterminate). |
| `max` | `number` | `100` | The value that means finished. |
| `valueText` | `string` | `percent` | Text shown at the end of the row. |

<!-- props:end -->

`class`, `style` and attributes land on the `div` element.

## Accessibility

- `role="progressbar"` with `aria-label`, `aria-valuemin`, `aria-valuemax` and `aria-valuenow`.
- Indeterminate: `aria-valuenow` and `aria-valuemax` are left off and `aria-busy="true"` is set. With reduced motion the fill is a still striped bar.
