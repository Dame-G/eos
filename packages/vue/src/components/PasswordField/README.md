# AePasswordField

A password with a Show and Hide button and, if you give it `rules`, a checklist that updates as you type. Built on `AeField`.

```vue
<AePasswordField v-model="password" label="Choose a password" mode="new" :rules="rules" />
<AePasswordField v-model="password" mode="current" />
```

```ts
const rules = [{ label: "At least 10 characters", test: (v: string) => v.length >= 10 }];
```

## Props

| Prop        | Type                 | Notes                                                                                                            |
| ----------- | -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `v-model`   | `string`             | The password. Leave it off for local state.                                                                      |
| `label`     | `string`             | Default "Password".                                                                                              |
| `hideLabel` | `boolean`            | Keeps the label for screen readers and removes it from the page.                                                 |
| `mode`      | `"current" \| "new"` | `current` for signing in, `new` for choosing one. Sets `autocomplete` so a password manager can fill or suggest. |
| `rules`     | `PasswordRule[]`     | `PasswordRule` is `{ label, test(value) }`. A checklist under the field.                                         |
| `hint`      | `string`             | Help under the field.                                                                                            |
| `error`     | `string`             | Replaces the hint, marks the input invalid, announced.                                                           |
| `required`  | `boolean`            | The `required` attribute and the word "Required".                                                                |
| `optional`  | `boolean`            | The word "Optional".                                                                                             |
| `disabled`  | `boolean`            | Disables the input and the toggle.                                                                               |
| `id`        | `string`             | The input's id. Generated when left out.                                                                         |

## Attributes and listeners

`inheritAttrs` is off. `class` and `style` stay on the wrapper (`div.ae-field`); everything else lands on the `<input>` and wins over the defaults (so a consumer's `autocomplete` replaces the one `mode` sets). An `aria-describedby` of your own is joined to the hint and rules ids.

Exposed: `input` (the element) and `focus()`.

## Rules

- Each rule shows a tick or an empty circle and says "met" or "not met yet" to a screen reader, so it never relies on colour.
- The toggle is a real button with `aria-pressed`. The input is `type=password` until it is pressed.
- Never block paste into this field. Do not enforce composition rules you do not need; length matters most.
- The input turns off capitalisation and spellcheck.
- Export: `PasswordRule` type.
