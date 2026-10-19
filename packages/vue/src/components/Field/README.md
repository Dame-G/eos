# EField

The label, hint and error wrapper for a control the system does not wrap itself. `ETextField`, `ETextarea` and the other fields use it.

```vue
<EField label="Preferred pharmacy" hint="We send the prescription here." v-slot="{ id, ariaInvalid, ariaDescribedby }">
  <MyAutocomplete :id="id" :aria-invalid="ariaInvalid" :aria-describedby="ariaDescribedby" />
</EField>
```

## Props

| Prop        | Type      | Default   | Notes                                                       |
| ----------- | --------- | --------- | ----------------------------------------------------------- |
| `label`     | `string`  |           | Required. The visible label above the control.              |
| `hideLabel` | `boolean` |           | Keeps the label for screen readers only.                    |
| `hint`      | `string`  |           | Help under the control.                                     |
| `error`     | `string`  |           | Replaces the hint, marks the control invalid, is announced. |
| `required`  | `boolean` |           | Shows the word "Required".                                  |
| `optional`  | `boolean` |           | Shows the word "Optional". Flag whichever is rarer.         |
| `id`        | `string`  | generated | The control's id; the label points at it.                   |

`class`, `style` and attributes land on the `div` element.

## Slots

| Slot      | Use                                                                                                                                                                                  |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `default` | The control. Scope `{ id, ariaInvalid, ariaDescribedby }`: put all three on it. `ariaInvalid` is `"true"` or `undefined`; `ariaDescribedby` is the hint or error id, or `undefined`. |

## Accessibility

- The control must carry `id`, `aria-invalid` and `aria-describedby` from the slot scope.
- The error is announced with `role="alert"` and has an icon, so colour is not the only signal.
- The label element has the id `<id>-label`, for a group named by it.
