# EProgress

A progress bar. Give it a `value` for a known fraction. Leave `value` out while the length is unknown and the bar slides back and forth. Use [`ESpinner`](../Spinner/README.md) for a small inline wait.

```vue
<EProgress label="Upload" :value="40" />
<EProgress label="Steps" :value="2" :max="4" value-text="2 of 4" />
<EProgress label="Checking your account" />
```

## Props

<!-- props:start -->

| Prop        | Type      | Default                                        | Notes                                                                                                                                                             |
| ----------- | --------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`     | `string`  | `"Progress" with a `value`, "Loading" without` | What is progressing. Also the bar's accessible name.                                                                                                              |
| `value`     | `number`  | None                                           | How far along, from 0 to `max`. Values outside that range are clamped. Without it the bar is indeterminate and slides back and forth while the length is unknown. |
| `max`       | `number`  | `100`                                          | The value that means finished.                                                                                                                                    |
| `valueText` | `string`  | `percent`                                      | Text shown at the end of the row.                                                                                                                                 |
| `hideLabel` | `boolean` | `false`                                        | Keeps the label for screen readers (it still names the bar) and shows only the value above it.                                                                    |
| `hideValue` | `boolean` | `false`                                        | Hides the value (the percentage or `valueText`) and shows only the label. `valueText` still goes to screen readers.                                               |

<!-- props:end -->

`class`, `style` and attributes land on the `div` element. Without a `label` the bar is named "Progress" with a `value` and "Loading" without one. The percentage is written in the configured locale ("40 %" in German), and the indeterminate bar slides from the start edge to the end, so it runs right to left in a right-to-left page.

`hideLabel` keeps the label as the bar's name and shows only the value; `hideValue` shows only the label. With both the bar stands alone and its name and `valueText` still reach screen readers.

## Accessibility

- `role="progressbar"` with `aria-label`, `aria-valuemin`, `aria-valuemax` and `aria-valuenow` (clamped to the range). `valueText` is also set as `aria-valuetext`.
- Indeterminate: `aria-valuenow` and `aria-valuemax` are left off, and the bar slides. The stripes on what is left to do move until the bar is full, known length or not. With reduced motion the stripes stand still and the indeterminate fill is a still striped bar.

Not focusable.

## Related

[`ESkeleton`](../Skeleton/README.md) for content that is loading.
