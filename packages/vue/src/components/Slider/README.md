# ESlider

Picks a number, or a span of two, by dragging or with the arrow keys. Use [`ENumberField`](../NumberField/README.md) when people need to type an exact value.

```vue
<ESlider v-model="volume" label="Volume" :step="5" />
<ESlider v-model="price" label="Price" range :min="0" :max="500" :step="10" :format="(v) => `$${v}`" />
```

## Props

<!-- props:start -->

| Prop         | Type                         | Default      | Notes                                                                                                                           |
| ------------ | ---------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue` | `number \| [number, number]` | None         | `v-model`: the value, or `[from, to]` with `range`. Left unset, a single slider sits at `min` and a range spans `min` to `max`. |
| `hideLabel`  | `boolean`                    | `false`      | Hides the label from the page and keeps it for screen readers.                                                                  |
| `hint`       | `string`                     | None         | Help that stays under the control.                                                                                              |
| `error`      | `string`                     | None         | What to fix. Replaces the hint, marks the control invalid and is announced.                                                     |
| `required`   | `boolean`                    | `false`      | Sets the `required` attribute and shows "Required" beside the label.                                                            |
| `optional`   | `boolean`                    | `false`      | Shows "Optional" beside the label. Only the rarer of required and optional needs a flag.                                        |
| `disabled`   | `boolean`                    | `false`      | Disables the control. A disabled control posts nothing.                                                                         |
| `readonly`   | `boolean`                    | `false`      | Shows the value but blocks editing. The control stays focusable and selectable, and still posts its value.                      |
| `id`         | `string`                     | `generated`  | The id of the control. The label points at it.                                                                                  |
| `label`      | `string`                     | **Required** | What the slider sets. Names every thumb.                                                                                        |
| `min`        | `number`                     | `0`          | The lowest value.                                                                                                               |
| `max`        | `number`                     | `100`        | The highest value.                                                                                                              |
| `step`       | `number`                     | `1`          | The distance between values. Keys and dragging land on multiples of it from `min`.                                              |
| `range`      | `boolean`                    | `false`      | Two thumbs choose a span. `v-model` is then `[from, to]` in place of a number.                                                  |
| `marks`      | `boolean \| number[]`        | None         | Draws tick marks: `true` for every step, or the values to mark.                                                                 |
| `format`     | `(value: number) => string`  | None         | Turns a value into the words screen readers announce (`aria-valuetext`), such as "$40". Without it the number is read.          |
| `name`       | `string`                     | None         | The name submitted with a form. A range posts two entries, `from` first. Posts nothing while disabled.                          |

<!-- props:end -->

`class` and `style` land on the wrapper `div`. Other attributes and listeners land on every thumb. Without a `v-model` a single slider sits at `min` and a range spans `min` to `max`. A number slider has no empty value, so it never reports `null`.

## Accessibility

- Each thumb is `role="slider"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and the label. A range names its thumbs "Price minimum" and "Price maximum".
- Pass `format` so screen readers hear "$40" and not "40": it becomes `aria-valuetext`.
- `readonly` leaves the thumbs in the tab order and sets `aria-readonly`.
- In a right-to-left language the track runs right to left and Arrow Right lowers the value.
- Tick marks are decoration. Do not rely on them to convey a value.

## Keyboard

| Key                    | Does                                         |
| ---------------------- | -------------------------------------------- |
| Arrow Right, Arrow Up  | Adds one `step` (Arrow Left adds it in RTL). |
| Arrow Left, Arrow Down | Takes away one `step`.                       |
| Page Up, Page Down     | Steps by ten.                                |
| Home, End              | Goes to `min` or `max`.                      |
| Tab                    | Moves to the next thumb and out.             |

## Related

[`ENumberField`](../NumberField/README.md) to type an exact number, [`ESegmented`](../Segmented/README.md) to choose one of a few named values.
