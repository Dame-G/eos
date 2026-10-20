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

| Prop         | Type                 | Default      | Notes                                                                                                                                                              |
| ------------ | -------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `modelValue` | `string`             | `""`         | `v-model`: the password.                                                                                                                                           |
| `label`      | `string`             | `"Password"` | The visible label, a mono kicker above the field.                                                                                                                  |
| `hideLabel`  | `boolean`            | `false`      | Keep the label for screen readers and remove it from the page.                                                                                                     |
| `mode`       | `"current" \| "new"` | —            | `current` for signing in, `new` for choosing one. Sets `autocomplete` (`current-password` or `new-password`) so a password manager can fill or suggest.            |
| `rules`      | `PasswordRule[]`     | —            | `{ label, test(value) }`. A checklist under the field that updates as the person types. Each rule shows a tick or an empty circle and says "met" or "not met yet". |
| `hint`       | `string`             | —            | Help that stays under the field.                                                                                                                                   |
| `error`      | `string`             | —            | What to fix. Replaces the hint, marks the input invalid and is announced.                                                                                          |
| `required`   | `boolean`            | `false`      | The `required` attribute and a word beside the label.                                                                                                              |
| `optional`   | `boolean`            | `false`      | A word beside the label. Flag whichever is rarer.                                                                                                                  |
| `disabled`   | `boolean`            | `false`      | Disables the input and the toggle.                                                                                                                                 |
| `id`         | `string`             | `generated`  | The id of the input; the label points at it.                                                                                                                       |

<!-- props:end -->

`class` and `style` land on the wrapper `div`; other attributes land on the `input` element and override its defaults. Exposes `input` and `focus()`. Do not block paste.

## Accessibility

- Each rule is announced "met" or "not met yet", not by colour alone.
- The toggle is a button with `aria-pressed`.
