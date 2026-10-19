# EPasswordField

A password input with a Show and Hide toggle and an optional live checklist of rules.

```vue
<EPasswordField v-model="password" label="Choose a password" mode="new" :rules="rules" />
```

```ts
const rules = [{ label: "At least 10 characters", test: (v: string) => v.length >= 10 }];
```

## Props

| Prop         | Type                 | Default    | Notes                                                                                                 |
| ------------ | -------------------- | ---------- | ----------------------------------------------------------------------------------------------------- |
| `modelValue` | `string`             | `""`       | v-model: the password.                                                                                |
| `label`      | `string`             | `Password` | The field's label.                                                                                    |
| `hideLabel`  | `boolean`            |            | Keeps the label for screen readers only.                                                              |
| `mode`       | `"current" \| "new"` |            | Sets `autocomplete` (`current-password` or `new-password`) so a password manager can fill or suggest. |
| `rules`      | `PasswordRule[]`     |            | `{ label, test(value) }`. Checklist under the field.                                                  |
| `hint`       | `string`             |            | Help under the field.                                                                                 |
| `error`      | `string`             |            | Replaces the hint, marks the input invalid.                                                           |
| `required`   | `boolean`            |            | The `required` attribute and the word "Required".                                                     |
| `optional`   | `boolean`            |            | The word "Optional".                                                                                  |
| `disabled`   | `boolean`            |            | Disables the input and the toggle.                                                                    |
| `id`         | `string`             | generated  | Id of the input.                                                                                      |

`class` and `style` land on the wrapper `div`; other attributes land on the `input` element and override its defaults. Exposes `input` and `focus()`. Do not block paste.

## Accessibility

- Each rule is announced "met" or "not met yet", not by colour alone.
- The toggle is a button with `aria-pressed`.
