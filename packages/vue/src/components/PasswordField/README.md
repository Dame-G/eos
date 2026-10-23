# EPasswordField

A password input with a Show and Hide toggle and an optional live checklist of rules.

```vue
<EPasswordField v-model="password" label="Choose a password" mode="new" :rules="rules" />
```

```ts
const rules = [{ label: "At least 10 characters", test: (v: string) => v.length >= 10 }];
```

## Props

<!-- props:start -->

| Prop          | Type                 | Default      | Notes                                                                                                                                                                                                   |
| ------------- | -------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`  | `string`             | `""`         | `v-model`: the password.                                                                                                                                                                                |
| `hideLabel`   | `boolean`            | `false`      | Hides the label from the page and keeps it for screen readers.                                                                                                                                          |
| `hint`        | `string`             | None         | Help that stays under the control.                                                                                                                                                                      |
| `error`       | `string`             | None         | What to fix. Replaces the hint, marks the control invalid and is announced.                                                                                                                             |
| `required`    | `boolean`            | `false`      | Sets the `required` attribute and shows "Required" beside the label.                                                                                                                                    |
| `optional`    | `boolean`            | `false`      | Shows "Optional" beside the label. Only the rarer of required and optional needs a flag.                                                                                                                |
| `disabled`    | `boolean`            | `false`      | Disables the control. A disabled control posts nothing.                                                                                                                                                 |
| `readonly`    | `boolean`            | `false`      | Shows the value but blocks editing. The control stays focusable and selectable, and still posts its value.                                                                                              |
| `id`          | `string`             | `generated`  | The id of the control. The label points at it.                                                                                                                                                          |
| `size`        | `EFieldSize`         | `"md"`       | The height of the box: `sm` and `lg` are a step under and over the control height.                                                                                                                      |
| `loading`     | `boolean`            | `false`      | Shows a spinner at the end of the box and sets `aria-busy`, while options or a check load. The field stays editable.                                                                                    |
| `label`       | `string`             | `"Password"` | The visible label above the field.                                                                                                                                                                      |
| `mode`        | `"current" \| "new"` | None         | `current` for signing in, `new` for choosing one. Sets `autocomplete` (`current-password` or `new-password`) so a password manager can fill or suggest.                                                 |
| `rules`       | `PasswordRule[]`     | None         | The rules, as `{ label, test(value) }`. They form a checklist under the field that updates as the person types. Each rule is announced as "met" or "not met yet", and a rule that changes is announced. |
| `placeholder` | `string`             | None         | An example, never the label.                                                                                                                                                                            |
| `name`        | `string`             | None         | The name submitted with a form.                                                                                                                                                                         |

<!-- props:end -->

`class` and `style` land on the wrapper `div`. Other attributes land on the `input` element and override its defaults. `size` and `loading` are as on [`ETextField`](../TextField/README.md). Exposes `input` and `focus()`. Do not block paste.

## Accessibility

- Each rule is announced "met" or "not met yet", not by colour alone.
- The toggle is a button named "Show password" with `aria-pressed`; its name does not change, so the state is announced once.
- When a rule starts or stops being met, the change is announced politely.

## Keyboard

| Key          | Action                                                  |
| ------------ | ------------------------------------------------------- |
| Tab          | Moves from the input to the show toggle.                |
| Enter, Space | Shows or hides the password when the toggle is focused. |

## Related

[`EOtpField`](../OtpField/README.md) for a one-time code, [`ETextField`](../TextField/README.md) for other text.
