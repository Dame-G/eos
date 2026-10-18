# EMenu

A button that opens a short list of actions. Built on `EButton` and Reka UI's DropdownMenu. Use it when there are three or more actions and no room for buttons.

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

| Prop           | Type                                                 | Notes                                                                                                                                                                                                    |
| -------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`        | `string`                                             | Required. The button's text; a chevron follows it.                                                                                                                                                       |
| `items`        | `(EMenuAction \| EMenuDivider)[]`                    | Required. An action is `{ label, icon?, onClick?, danger?, disabled? }`; `{ divider: true }` draws a rule.                                                                                               |
| `variant`      | `primary \| secondary \| outline \| danger \| quiet` | The look of the button. Default `outline`.                                                                                                                                                               |
| `icon`         | `string`                                             | An icon before the label.                                                                                                                                                                                |
| `v-model:open` | `boolean`                                            | Whether the menu is open. Set it to open it from outside, or to start open; it follows the person's own opening and closing. Leave it off for local state. Opened from outside, the menu moves no focus. |

## Events

| Event    | Payload             | Notes                                                         |
| -------- | ------------------- | ------------------------------------------------------------- |
| `select` | `item: EMenuAction` | An action was chosen. Also calls that action's own `onClick`. |

`class`, `style` and other attributes land on the button (the menu is rendered elsewhere).

## Keyboard

| Key                              | Does                                                      |
| -------------------------------- | --------------------------------------------------------- |
| Enter, Space, ArrowDown (button) | Opens the menu with the first action focused.             |
| ArrowDown, ArrowUp               | Move between actions, skipping disabled ones, and wrap.   |
| Home, End                        | First and last action.                                    |
| Letters                          | Jump to the action starting with them.                    |
| Enter, Space (action)            | Runs it, closes the menu and returns focus to the button. |
| Escape                           | Closes the menu; focus returns to the button.             |

## Rules

- Rows are 48px. The first action takes focus when the menu opens, however it was opened. A click on an action runs it and closes the menu. An outside press closes it.
- Put the destructive action last, after a divider.
- The menu is `role="menu"` with `role="menuitem"` rows and renders in the portal target with the `e-root` class, so a scoped theme reaches it. It sits 8px under the button.
- Not modal: the page behind stays usable by assistive technology, and focus leaving closes the menu.
- The reference used a `button` per row; Reka UI renders a `div` with `role="menuitem"` and marks a disabled row with `data-disabled`, so `EMenu` carries both selectors in its CSS.
