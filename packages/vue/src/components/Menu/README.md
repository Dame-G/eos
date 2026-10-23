# EMenu

A button that opens a short list of actions. Use it when there are three or more actions and no room for buttons, and [`EActions`](../Actions/README.md) when there is.

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

| Prop               | Type                                                           | Default      | Notes                                                                                                                                                                                                                                                                                         |
| ------------------ | -------------------------------------------------------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`             | `boolean`                                                      | `false`      | `v-model:open`: the open state. Opening it from outside moves no focus.                                                                                                                                                                                                                       |
| `label`            | `string`                                                       | **Required** | The button's text. With a `trigger` slot it is not shown, so name your own trigger.                                                                                                                                                                                                           |
| `items`            | `readonly EMenuItem[]`                                         | **Required** | The rows, in order. A plain action is `{ label, icon?, onClick?, danger?, disabled? }`, a link adds `href`. `{ divider: true }` draws a rule, and `type` makes a `label`, `checkbox`, `radio-group` or `submenu`. The destructive action goes last.                                           |
| `variant`          | `"primary" \| "secondary" \| "outline" \| "danger" \| "quiet"` | `"outline"`  | The button's variant.                                                                                                                                                                                                                                                                         |
| `icon`             | `IconProp`                                                     | None         | An icon before the label.                                                                                                                                                                                                                                                                     |
| `side`             | `"bottom" \| "top" \| "start" \| "end" \| "left" \| "right"`   | `"bottom"`   | Which side of the trigger the menu opens on. It flips to the other side when there is no room. `start` and `end` follow the reading direction. `left` and `right` are deprecated: they still work, on that physical side in either direction, and warn in development. Use `start` and `end`. |
| `align`            | `"start" \| "center" \| "end"`                                 | `"start"`    | Which edge of the trigger the menu's edge lines up with: `start` with the trigger's start, `end` with its end (it suits a trigger at the end of a bar), `center` with its middle.                                                                                                             |
| `collisionPadding` | `number`                                                       | `16`         | The space in pixels to keep between the menu and the edge of the screen.                                                                                                                                                                                                                      |

<!-- props:end -->

`class`, `style` and attributes land on the trigger: the `button`, or the element in the `trigger` slot.

## Slots

| Slot      | Use                                                                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `trigger` | Your own trigger in place of the button, one element that takes a click such as a `button` around an avatar. It needs an accessible name, for example `aria-label`. |

## Rows

`items` takes these, in any order:

| Row         | Shape                                                        | Notes                                                          |
| ----------- | ------------------------------------------------------------ | -------------------------------------------------------------- |
| Action      | `{ label, icon?, onClick?, danger?, disabled? }`             | Chooses and closes.                                            |
| Link        | an action with `href`                                        | An anchor. Choosing it follows the link.                       |
| Divider     | `{ divider: true }`                                          | A rule.                                                        |
| Label       | `{ type: "label", label }`                                   | A caption over the rows after it.                              |
| Checkbox    | `{ type: "checkbox", label, checked, onChange? }`            | On or off. You keep the state: update `checked` in `onChange`. |
| Radio group | `{ type: "radio-group", label?, value, options, onChange? }` | One option chosen. You keep `value`.                           |
| Submenu     | `{ type: "submenu", label, icon?, items }`                   | Opens beside the row.                                          |

## Events

| Event    | Payload             | Notes                                                                                 |
| -------- | ------------------- | ------------------------------------------------------------------------------------- |
| `select` | `item: EMenuAction` | An action or link was chosen. It fires in addition to the item's own `onClick`.       |
| `change` | `item`, `value`     | A checkbox or radio option changed. It fires in addition to the row's own `onChange`. |
| `close`  |                     | It closed, by a choice, Escape or a press outside. `open` is already `false`.         |

## Accessibility

- `role="menu"` with `menuitem`, `menuitemcheckbox` and `menuitemradio` rows. It is not modal.
- Enter, Space, Arrow Down or Arrow Up on the button opens it with the first action focused. A click does too. Tab only passes through the button. Arrows, Home, End and letters move between actions.
- Escape closes the menu and returns focus to the button.
- Choosing an action runs its `onClick`, then emits `select`. Use `onClick` for a handler per action and `select` for one handler for all.

## Keyboard

| Key                                        | Action                                            |
| ------------------------------------------ | ------------------------------------------------- |
| Enter, Space, Arrow Down                   | Opens the menu with the first action focused.     |
| Arrow Up, Arrow Down                       | Moves between actions, wrapping.                  |
| Home, End                                  | Moves to the first or last action.                |
| Letters                                    | Moves to the next action that starts with them.   |
| Enter, Space                               | Chooses the focused action and closes the menu.   |
| Arrow Right (Left in a right-to-left page) | Opens a submenu. Arrow Left closes it.            |
| Escape                                     | Closes the menu and returns focus to the trigger. |

## Related

[`EButton`](../Button/README.md) for a single action, [`ESelect`](../Select/README.md) to choose a value.
