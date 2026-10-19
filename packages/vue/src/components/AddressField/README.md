# EAddressField

A postal address as one fieldset of street, unit, city, region and ZIP code fields with the right `autocomplete` tokens, for checkout and profile forms.

```vue
<EAddressField v-model="address" :errors="{ postal: 'Enter a ZIP code' }" />
```

## Props

| Prop              | Type                  | Default   | Notes                                                                                                      |
| ----------------- | --------------------- | --------- | ---------------------------------------------------------------------------------------------------------- |
| `modelValue`      | `Address`             | `{}`      | v-model: `{ street?, unit?, city?, region?, postal? }`. Without a binding the group keeps its own state.   |
| `legend`          | `string`              | `Address` | The group's title.                                                                                         |
| `errors`          | `Address`             |           | Message per field; marks the field invalid. It does not validate: check on the server and pass results in. |
| `regions`         | `EOptionInput[]`      | US states | Region choices; the model holds the code. Pass for any other country.                                      |
| `postalInputmode` | `"numeric" \| "text"` | `text`    | `numeric` for ZIP codes, `text` for postal codes with letters.                                             |
| `name`            | `string`              | `address` | Field name prefix: `address-street`, `address-unit`, `address-city`, `address-region`, `address-postal`.   |
| `disabled`        | `boolean`             |           | Disables every field.                                                                                      |

`class`, `style` and attributes land on the `fieldset` element. Labels come from the messages `address`, `street`, `unit`, `city`, `region`, `postal` and `select`; reword them, and pass `regions`, for another country.

## Accessibility

- A `fieldset` with a `legend`: the group is announced by its legend.
- Street, city, region and ZIP code are required; the unit is optional.
- The region is an `ESelect` (combobox button), not a native `select`: arrows and Enter choose.
