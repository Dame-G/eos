# EMenu

A button that opens a short list of actions. Use it when there are three or more actions and no room for buttons.

```vue
<EMenu
  label="More"
  :items="[
    { label: 'Edit', icon: 'edit', onClick: edit },
    { label: 'Duplicate', onClick: duplicate },
    { label: 'Archive', disabled: true },
    { divider: true },
    { label: 'Delete', danger: true, onClick: remove },
  ]"
/>
```

## Props

<!-- props:start -->

| Prop      | Type                                                           | Default      | Notes                                                                                                                                           |
| --------- | -------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`    | `boolean`                                                      | `false`      | `v-model:open`: the open state. Opening it from outside moves no focus.                                                                         |
| `label`   | `string`                                                       | **Required** | The button's text. With a `trigger` slot it is not shown, so name your own trigger.                                                             |
| `items`   | `readonly EMenuItem[]`                                         | **Required** | The actions, in order, as `{ label, icon?, onClick?, danger?, disabled? }`. `{ divider: true }` draws a rule. The destructive action goes last. |
| `variant` | `"primary" \| "secondary" \| "outline" \| "danger" \| "quiet"` | `"outline"`  | The button's variant.                                                                                                                           |
| `icon`    | `IconProp`                                                     | —            | An icon before the label.                                                                                                                       |
| `align`   | `"start" \| "end"`                                             | `"start"`    | Which edge of the trigger the menu lines up with. `end` suits a trigger at the end of a bar.                                                    |

<!-- props:end -->

`class`, `style` and attributes land on the `button` element. With a `trigger` slot they are not applied.

## Slots

| Slot      | Use                                                                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `trigger` | Your own trigger in place of the button, one element that takes a click such as a `button` around an avatar. It needs an accessible name, for example `aria-label`. |

## Events

| Event    | Payload             | Notes                                                                   |
| -------- | ------------------- | ----------------------------------------------------------------------- |
| `select` | `item: EMenuAction` | An action was chosen. It fires in addition to the item's own `onClick`. |

## Accessibility

- `role="menu"` with `role="menuitem"` rows. It is not modal.
- Enter, Space or ArrowDown on the button opens it with the first action focused. Arrows, Home, End and letters move between actions.
- Escape closes the menu and returns focus to the button.
