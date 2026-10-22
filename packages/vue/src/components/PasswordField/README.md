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

| Prop         | Type                 | Default      | Notes                                                                                                                                                             |
| ------------ | -------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue` | `string`             | `""`         | `v-model`: the password.                                                                                                                                          |
| `label`      | `string`             | `"Password"` | The visible label above the field.                                                                                                                                |
| `hideLabel`  | `boolean`            | `false`      | Hides the label from the page and keeps it for screen readers.                                                                                                    |
| `mode`       | `"current" \| "new"` | None         | `current` for signing in, `new` for choosing one. Sets `autocomplete` (`current-password` or `new-password`) so a password manager can fill or suggest.           |
| `rules`      | `PasswordRule[]`     | None         | The rules, as `{ label, test(value) }`. They form a checklist under the field that updates as the person types. Each rule is announced as "met" or "not met yet". |
| `hint`       | `string`             | None         | Help that stays under the field.                                                                                                                                  |
| `error`      | `string`             | None         | What to fix. Replaces the hint, marks the input invalid and is announced.                                                                                         |
| `required`   | `boolean`            | `false`      | Sets the `required` attribute and shows "Required" beside the label.                                                                                              |
| `optional`   | `boolean`            | `false`      | Shows "Optional" beside the label. Only the rarer of required and optional needs a flag.                                                                          |
| `disabled`   | `boolean`            | `false`      | Disables the input and the toggle.                                                                                                                                |
| `readonly`   | `boolean`            | `false`      | Shows the value but blocks editing. The input stays focusable and selectable. The show toggle still works.                                                        |
| `id`         | `string`             | `generated`  | The id of the input. The label points at it.                                                                                                                      |

<!-- props:end -->

`class` and `style` land on the wrapper `div`. Other attributes land on the `input` element and override its defaults. Exposes `input` and `focus()`. Do not block paste.

## Accessibility

- Each rule is announced "met" or "not met yet", not by colour alone.
- The toggle is a button with `aria-pressed`.
