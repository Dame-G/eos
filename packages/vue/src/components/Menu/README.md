# AeMenu

A button that opens a short list of actions. Built on `AeButton` and Reka UI's DropdownMenu. Use it when there are three or more actions and no room for buttons.

```vue
<AeMenu
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

| Prop      | Type                                                 | Notes                                                                                                      |
| --------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `label`   | `string`                                             | Required. The button's text; a chevron follows it.                                                         |
| `items`   | `(AeMenuAction \| AeMenuDivider)[]`                  | Required. An action is `{ label, icon?, onClick?, danger?, disabled? }`; `{ divider: true }` draws a rule. |
| `variant` | `primary \| secondary \| outline \| danger \| quiet` | The look of the button. Default `outline`.                                                                 |
| `icon`    | `string`                                             | An icon before the label.                                                                                  |

## Events

| Event    | Payload              | Notes                                                         |
| -------- | -------------------- | ------------------------------------------------------------- |
| `select` | `item: AeMenuAction` | An action was chosen. Also calls that action's own `onClick`. |

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
- The menu is `role="menu"` with `role="menuitem"` rows and renders in the portal target with the `ae-root` class, so a scoped theme reaches it. It sits 8px under the button.
- Not modal: the page behind stays usable by assistive technology, and focus leaving closes the menu.
- The reference used a `button` per row; Reka UI renders a `div` with `role="menuitem"` and marks a disabled row with `data-disabled`, so `AeMenu` carries both selectors in its CSS.
