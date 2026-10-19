# EMenu

A button that opens a short list of actions. Use it when there are three or more actions and no room for buttons.

```vue
<EMenu
  label="More"
  :items="[
    { label: 'Edit', icon: 'pencil', onClick: edit },
    { label: 'Duplicate', onClick: duplicate },
    { label: 'Archive', disabled: true },
    { divider: true },
    { label: 'Delete', danger: true, onClick: remove },
  ]"
/>
```

## Props

| Prop      | Type                                                           | Default   | Notes                                                                                                                       |
| --------- | -------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------- |
| `label`   | `string`                                                       |           | Required. Button text.                                                                                                      |
| `items`   | `(EMenuAction \| EMenuDivider)[]`                              |           | Required. Action: `{ label, icon?, onClick?, danger?, disabled? }`; `{ divider: true }` draws a rule. Put destructive last. |
| `variant` | `"primary" \| "secondary" \| "outline" \| "danger" \| "quiet"` | `outline` | Button look.                                                                                                                |
| `icon`    | `IconProp`                                                     |           | Icon before the label.                                                                                                      |
| `align`   | `"start" \| "end"`                                             | `start`   | Which edge of the trigger the menu lines up with; `end` for a trigger at the end of a bar.                                  |
| `open`    | `boolean`                                                      | `false`   | v-model:open: open state. Opening it from outside moves no focus.                                                           |

`class`, `style` and attributes land on the `button` element; with a `trigger` slot they are not applied.

## Slots

| Slot      | Use                                                                                                                                                            |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `trigger` | Your own trigger in place of the button: one element that takes a click, such as a `button` around an avatar. Name it yourself, for example with `aria-label`. |

## Events

| Event    | Payload             | Notes                                                         |
| -------- | ------------------- | ------------------------------------------------------------- |
| `select` | `item: EMenuAction` | An action was chosen. Fires in addition to its own `onClick`. |

## Accessibility

- `role="menu"` with `role="menuitem"` rows; not modal.
- Enter, Space or ArrowDown on the button opens it with the first action focused; arrows, Home, End and letters move between actions.
- Escape closes the menu and returns focus to the button.
