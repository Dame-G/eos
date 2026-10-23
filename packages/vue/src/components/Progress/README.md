# EProgress

A progress bar. Give it a `value` for a known fraction. Leave `value` out while the length is unknown and the bar slides back and forth. Use [`ESpinner`](../Spinner/README.md) for a small inline wait.

```vue
<EProgress label="Upload" :value="40" />
<EProgress label="Steps" :value="2" :max="4" value-text="2 of 4" />
<EProgress label="Checking your account" />
```

## Props

<!-- props:start -->

| Prop        | Type     | Default     | Notes                                                                                                                                                             |
| ----------- | -------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`     | `string` | `"Loading"` | What is progressing. Also the bar's accessible name.                                                                                                              |
| `value`     | `number` | None        | How far along, from 0 to `max`. Values outside that range are clamped. Without it the bar is indeterminate and slides back and forth while the length is unknown. |
| `max`       | `number` | `100`       | The value that means finished.                                                                                                                                    |
| `valueText` | `string` | `percent`   | Text shown at the end of the row.                                                                                                                                 |

<!-- props:end -->

`class`, `style` and attributes land on the `div` element.

## Accessibility

- `role="progressbar"` with `aria-label`, `aria-valuemin`, `aria-valuemax` and `aria-valuenow` (clamped to the range). `valueText` is also set as `aria-valuetext`.
- Indeterminate: `aria-valuenow` and `aria-valuemax` are left off and `aria-busy="true"` is set. With reduced motion the fill is a still striped bar, and the stripes stop moving once the bar is complete.

## Keyboard

Not focusable and takes no keys.

## Related

[`ESpinner`](../Spinner/README.md) for a small inline wait, [`ESkeleton`](../Skeleton/README.md) for content that is loading.
