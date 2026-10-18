# EAddressField

A postal address as one bordered group: the legend is the title and the fields drop the repeated word (Street, Apartment, suite or unit, City, State, ZIP code). Each has the right `autocomplete` token (`address-line1`, `address-line2`, `address-level2`, `postal-code`) so a browser fills the lot in one go. It is an EFieldset of ETextField, ESelect and ETextField.

```vue
<EAddressField v-model="address" :errors="{ postal: 'Enter a ZIP code' }" />
```

## Props

| Prop       | Type             | Notes                                                                                                                               |
| ---------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `v-model`  | `Address`        | `{ street?, unit?, city?, region?, postal? }`. Without it the group keeps its own state.                                            |
| `legend`   | `string`         | The group's title. Default "Address".                                                                                               |
| `errors`   | `Address`        | What to fix, per field. Marks the field invalid and is announced with it.                                                           |
| `regions`  | `EOptionInput[]` | Choices for the region field. Default the 50 US states and DC (the model holds the code).                                           |
| `name`     | `string`         | Prefix of the field names, default `address`: `address-street`, `address-unit`, `address-city`, `address-region`, `address-postal`. |
| `disabled` | `boolean`        | Disables every field.                                                                                                               |

`class` and `style` fall through to the `fieldset`.

## Words

The labels come from the messages `address`, `street`, `unit`, `city`, `region` ("State"), `postal` ("ZIP code") and `select`. Reword them, and pass `regions`, for another country.

## Accessibility

- A real `fieldset` and `legend`: the group is announced as "Address".
- Street, city, region and ZIP code are required (flagged "Required"); the unit is "Optional".
- The region is an ESelect (a Reka UI combobox button): arrows and Enter choose, and there is no native `select`.

## Rules

- Street and unit take the whole row; city, region and ZIP share rows when the group is wide and stack when it is narrow.
- It does not validate; check the address on the server and send the messages back through `errors`.
