# AeFieldset

Related controls in a bordered box. Use it, not a bare label, whenever two or more controls answer one question. `AeRadioGroup` is a `bare` fieldset; `AddressField` is a boxed one.

```vue
<AeFieldset legend="Home address" required hint="Where we send statements.">
  <AeTextField label="Street" autocomplete="street-address" />
  <AeTextField label="City" autocomplete="address-level2" />
</AeFieldset>
```

## Props

| Prop              | Type      | Notes                                                                                                 |
| ----------------- | --------- | ----------------------------------------------------------------------------------------------------- |
| `legend`          | `string`  | The question the controls answer. Names the group for screen readers.                                 |
| `bare`            | `boolean` | No box: the legend becomes a small mono label above the controls.                                     |
| `hint`            | `string`  | Announced with the group (`aria-describedby` on the fieldset).                                        |
| `error`           | `string`  | Replaces the hint, announced with the group (`aria-invalid` on the fieldset, `role="alert"` message). |
| `required`        | `boolean` | "Required" at the end of the legend.                                                                  |
| `optional`        | `boolean` | "Optional" at the end of the legend.                                                                  |
| `disabled`        | `boolean` | Disables everything inside (the native `fieldset[disabled]`).                                         |
| `legendClassName` | `string`  | Extra classes for the legend.                                                                         |
| `id`              | `string`  | The hint and error ids are built from it. Generated when left out.                                    |

`class`, `style` and other attributes land on the `<fieldset>`.

## Slots

| Slot      | Notes         |
| --------- | ------------- |
| `default` | The controls. |

## Rules

- The title sits on the top edge at the start and Required or Optional at the end, with a line between them and room either side, so the border never runs into the text.
- `bare` drops the box: the legend floats above the controls like a Field's label.
- The legend names the group and the fields drop the repeated word: "Home address" holds Street, City and ZIP code, not Street address.
- The hint and error sit 8px under the last control, in the box and bare (the reference's "attach rule": negative margins that pull the message up under a choice or the body gap).
