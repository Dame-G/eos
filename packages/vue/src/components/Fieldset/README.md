# EFieldset

Related controls in a bordered box. Use it, not a bare label, whenever two or more controls answer one question.

```vue
<EFieldset legend="Home address" required hint="Where we send statements.">
  <ETextField label="Street" autocomplete="street-address" />
  <ETextField label="City" autocomplete="address-level2" />
</EFieldset>
```

## Props

<!-- props:start -->

| Prop          | Type      | Default     | Notes                                                                                                                                    |
| ------------- | --------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `legend`      | `string`  | —           | The question the controls answer. Names the group for screen readers.                                                                    |
| `bare`        | `boolean` | `false`     | No box: the legend becomes a small mono label above the controls (RadioGroup).                                                           |
| `hint`        | `string`  | —           | Help that is announced with the group.                                                                                                   |
| `error`       | `string`  | —           | What to fix. Replaces the hint and is announced with the group.                                                                          |
| `required`    | `boolean` | `false`     | "Required" at the end of the legend.                                                                                                     |
| `optional`    | `boolean` | `false`     | A word at the end of the legend. Flag whichever is rarer.                                                                                |
| `section`     | `boolean` | `false`     | A titled form section: no box, a larger legend ruled off from what comes before, and the hint under the legend. Replaces `EFormSection`. |
| `disabled`    | `boolean` | `false`     | Disables every control inside.                                                                                                           |
| `legendClass` | `string`  | —           | Extra classes for the legend.                                                                                                            |
| `hideLegend`  | `boolean` | `false`     | Keep the legend for screen readers and remove it from the page.                                                                          |
| `id`          | `string`  | `generated` | The id the hint and error ids are built from.                                                                                            |

<!-- props:end -->

`class`, `style` and attributes land on the `fieldset` element.

## Slots

| Slot      | Use           |
| --------- | ------------- |
| `default` | The controls. |

## Accessibility

- The legend names the group, so the fields drop the repeated word ("Street", not "Street address", under "Home address").
- `hint` is linked with `aria-describedby`; `error` sets `aria-invalid` and is announced with `role="alert"`.
