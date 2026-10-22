# EField

The label, hint and error wrapper for a control the system does not wrap itself. [`ETextField`](../TextField/README.md), [`ETextarea`](../Textarea/README.md) and the other fields use it.

```vue
<EField label="Preferred pharmacy" hint="We send the prescription here." v-slot="{ id, ariaInvalid, ariaDescribedby }">
  <MyAutocomplete :id="id" :aria-invalid="ariaInvalid" :aria-describedby="ariaDescribedby" />
</EField>
```

## Props

<!-- props:start -->

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `string` | **Required** | The visible label above the control. |
| `hideLabel` | `boolean` | `false` | Hides the label from the page and keeps it for screen readers. |
| `hint` | `string` | None | Help that stays under the control. |
| `error` | `string` | None | What to fix. Replaces the hint, turns the control invalid and is announced. |
| `required` | `boolean` | `false` | Shows "Required" beside the label. |
| `optional` | `boolean` | `false` | Shows "Optional" beside the label. Only the rarer of required and optional needs a flag. |
| `id` | `string` | `generated` | The id of the control. The label points at it. |

<!-- props:end -->

`class`, `style` and attributes land on the `div` element.

## Slots

| Slot      | Use                                                                                                                                                                                                         |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default` | The control. The scope is `{ id, ariaInvalid, ariaDescribedby }` and the control must carry all three. `ariaInvalid` is `"true"` or `undefined`. `ariaDescribedby` is the hint or error id, or `undefined`. |

## Accessibility

- The control must carry `id`, `aria-invalid` and `aria-describedby` from the slot scope.
- The error is announced with `role="alert"` and has an icon, so colour is not the only signal.
- The label element has the id `<id>-label`, for a group named by it.
