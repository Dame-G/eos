# EField

The label, hint and error wrapper for a control the system does not wrap itself. `ETextField`, `ETextarea` and the other fields use it.

```vue
<EField label="Preferred pharmacy" hint="We send the prescription here." v-slot="{ id, ariaInvalid, ariaDescribedby }">
  <MyAutocomplete :id="id" :aria-invalid="ariaInvalid" :aria-describedby="ariaDescribedby" />
</EField>
```

## Props

<!-- props:start -->

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `string` | **Required** | The visible label, a small mono kicker above the control. |
| `hideLabel` | `boolean` | `false` | Keep the label for screen readers and remove it from the page. |
| `hint` | `string` | — | Help that stays under the control. |
| `error` | `string` | — | What to fix. Replaces the hint, turns the control invalid and is announced. |
| `required` | `boolean` | `false` | A word beside the label. |
| `optional` | `boolean` | `false` | A word beside the label. Flag whichever is rarer. |
| `id` | `string` | `generated` | The id of the control; the label points at it. |

<!-- props:end -->

`class`, `style` and attributes land on the `div` element.

## Slots

| Slot      | Use                                                                                                                                                                                  |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `default` | The control. Scope `{ id, ariaInvalid, ariaDescribedby }`: put all three on it. `ariaInvalid` is `"true"` or `undefined`; `ariaDescribedby` is the hint or error id, or `undefined`. |

## Accessibility

- The control must carry `id`, `aria-invalid` and `aria-describedby` from the slot scope.
- The error is announced with `role="alert"` and has an icon, so colour is not the only signal.
- The label element has the id `<id>-label`, for a group named by it.
