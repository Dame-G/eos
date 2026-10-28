# EConfirmDialog

A question that needs a yes or a no before something happens, with a Cancel that holds focus first. Use [`EDialog`](../Dialog/README.md) for anything with its own content or a form.

```vue
<EConfirmDialog
  v-model:open="asking"
  title="Delete this game?"
  description="It cannot be restored."
  confirm-label="Delete game"
  tone="danger"
  @confirm="remove"
/>
```

## Props

<!-- props:start -->

| Prop             | Type                         | Default      | Notes                                                                                                                                                        |
| ---------------- | ---------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `open`           | `boolean`                    | `false`      | `v-model:open`: whether it is open. Without a binding it keeps its own state.                                                                                |
| `title`          | `string`                     | **Required** | The question, as the dialog's heading and accessible name, such as "Delete this game?".                                                                      |
| `description`    | `string`                     | None         | A sentence under the title that says what will happen and whether it can be undone.                                                                          |
| `confirmLabel`   | `string`                     | `"Confirm"`  | The Confirm button's label: a verb that says what happens, such as "Delete game".                                                                            |
| `cancelLabel`    | `string`                     | `"Cancel"`   | The Cancel button's label.                                                                                                                                   |
| `tone`           | `"neutral" \| "danger"`      | `"neutral"`  | `danger` makes the confirming button the danger one, for something that removes or cannot be undone.                                                         |
| `focus`          | `"cancel" \| "confirm"`      | `"cancel"`   | Which button takes focus when it opens. `cancel` is the safe answer; use `confirm` for a question whose usual answer is yes.                                 |
| `loading`        | `boolean`                    | `false`      | Shows a spinner on the Confirm button and ignores it while the action runs. Pair it with `closeOnConfirm` off.                                               |
| `closeOnConfirm` | `boolean`                    | `true`       | Closes the dialog when Confirm is pressed. Turn it off for an action that can fail or takes time: set `loading`, then close it yourself with `v-model:open`. |
| `size`           | `"sm" \| "md"`               | `"sm"`       | The width: `sm` for a confirmation, `md` for a longer explanation.                                                                                           |
| `headingLevel`   | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2`          | The level of the title's heading element, 1 to 6.                                                                                                            |
| `dismissible`    | `boolean`                    | `false`      | Closes it (as Cancel) when the backdrop is pressed as well.                                                                                                  |

<!-- props:end -->

`class`, `style` and attributes land on the dialog element.

## Slots

| Slot      | Use                                                                    |
| --------- | ---------------------------------------------------------------------- |
| `default` | More to read before deciding. Optional: `description` is often enough. |

## Events

| Event     | Payload | Notes                                                                                  |
| --------- | ------- | -------------------------------------------------------------------------------------- |
| `confirm` |         | Confirm was pressed. The dialog closes after it unless `closeOnConfirm` is off.        |
| `cancel`  |         | Cancel, Close, Escape or (with `dismissible`) the backdrop. `open` is already `false`. |

## Accessibility

- A `role="alertdialog"` named by its title and described by `description`. Focus moves in, is trapped, and returns to the opener on close.
- Focus starts on Cancel, so a stray Enter answers no. Set `focus="confirm"` for a question whose usual answer is yes.
- Name the Confirm button for what it does ("Delete game"), not "OK" or "Yes".
- `tone="danger"` makes Confirm the danger button. Colour is not the only cue: the label says what is lost.
- For an action that takes time, turn `closeOnConfirm` off, set `loading` while it runs and close the dialog yourself when it ends. `loading` marks Confirm busy and ignores further presses.

## Keyboard

| Key            | Action                                                        |
| -------------- | ------------------------------------------------------------- |
| Escape         | Cancels, closes the dialog and returns focus to the opener.   |
| Tab, Shift+Tab | Moves between the controls inside; focus stays in the dialog. |

## Related

[`EDialog`](../Dialog/README.md) for other content, and [`ENotice`](../Notice/README.md) for a message that needs no answer.
