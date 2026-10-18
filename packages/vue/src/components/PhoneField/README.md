# AePhoneField

A phone number. Built on `AeTextField`; it takes every one of its props except `type`, `prefix` and `suffix`.

```vue
<AePhoneField v-model="mobile" label="Mobile" hint="We text appointment reminders." />
<AePhoneField v-model="mobile" format="none" />
```

## Props

| Prop          | Type             | Notes                                                                                                                                               |
| ------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `v-model`     | `string`         | The number, formatted. A value you set is formatted for display.                                                                                    |
| `label`       | `string`         | Default "Phone number".                                                                                                                             |
| `hideLabel`   | `boolean`        | Keeps the label for screen readers.                                                                                                                 |
| `format`      | `"us" \| "none"` | `us` groups the digits as you type, (555) 123-4567; `none` leaves them alone. Default `us` when the configured locale is `en-US`, otherwise `none`. |
| `hint`        | `string`         | Help under the input.                                                                                                                               |
| `error`       | `string`         | Replaces the hint, marks the input invalid, announced.                                                                                              |
| `placeholder` | `string`         | An example.                                                                                                                                         |
| `required`    | `boolean`        | The `required` attribute and the word "Required".                                                                                                   |
| `optional`    | `boolean`        | The word "Optional".                                                                                                                                |
| `disabled`    | `boolean`        | Dashed and tinted.                                                                                                                                  |
| `id`          | `string`         | The input's id. Generated when left out.                                                                                                            |

## Attributes and listeners

As `AeTextField`: `class` and `style` on the wrapper, everything else on the `<input>`. The defaults `autocomplete="tel"` and `inputmode="tel"` can be replaced (for example `autocomplete="tel-national"`). Add `name` for forms.

Exposed: `input` and `focus()`.

## Rules

- It sets `type=tel`, `inputmode=tel` and `autocomplete=tel`, so a phone shows the number pad and a browser can fill it.
- The `us` format drops a leading 1 and keeps ten digits. It does not validate; check the number on the server.
