# EField

The label, hint and error that every field has, for a control the system does not wrap itself. It is also the shell `ETextField`, `ETextarea`, `ENumberField`, `EOtpField`, `EUpload` and the pickers are built on, so the label, the Required or Optional word, `hideLabel` and the id wiring are written once.

```vue
<EField label="Preferred pharmacy" hint="We send the prescription here." v-slot="{ id, ariaInvalid, ariaDescribedby }">
  <MyAutocomplete :id="id" :aria-invalid="ariaInvalid" :aria-describedby="ariaDescribedby" />
</EField>
```

## Props

| Prop        | Type      | Notes                                                                           |
| ----------- | --------- | ------------------------------------------------------------------------------- |
| `label`     | `string`  | Required. A mono kicker above the control. The `<label>` points at the control. |
| `hint`      | `string`  | Help under the control, linked with `aria-describedby`.                         |
| `error`     | `string`  | Replaces the hint, turns the control invalid, announced with `role="alert"`.    |
| `required`  | `boolean` | Shows the word "Required" beside the label.                                     |
| `optional`  | `boolean` | Shows the word "Optional". Flag whichever is rarer.                             |
| `hideLabel` | `boolean` | Keeps the label for screen readers and removes it from the page.                |
| `id`        | `string`  | The control's id. Generated (`useUid`) when left out.                           |

## Slots

| Slot      | Props                                  | Notes                                                                                                                                  |
| --------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `default` | `{ id, ariaInvalid, ariaDescribedby }` | The control. Put the three on it. `ariaInvalid` is `"true"` or `undefined`; `ariaDescribedby` is the hint or error id, or `undefined`. |

`class` and `style` land on the wrapper `div.e-field`.

## Rules

- The hint and the label sit 8px from the control (the `gap` of `.e-field`). Do not add margins.
- An error says what to fix, replaces the hint, and carries an alert glyph; color is never the only signal.
- Required and Optional are words in the configured messages (`required`, `optional`), not asterisks.
- The label element has the id `<id>-label`, for a group that is named by it.
- Internal parts, not exported from the package: `EFieldFlag.vue` (the Required or Optional word) and `EFieldMessage.vue` (the hint or error paragraph). `EFieldset`, `ESegmented` and `ECheckbox` use them directly.
- The `useFieldAttrs()` composable splits fall-through attributes for the controls built on this shell: `class` and `style` for the wrapper, everything else (joined `aria-describedby` included) for the input.
