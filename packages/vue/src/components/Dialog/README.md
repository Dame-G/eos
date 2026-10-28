# EDialog

A modal dialog for a short decision. Use [`EDrawer`](../Drawer/README.md) to read a statement or receipt beside a list.

```vue
<EButton @click="open = true">Cancel appointment</EButton>
<EDialog v-model:open="open" title="Cancel this appointment?">
  You can book again at any time.
  <template #actions>
    <EButton variant="danger" @click="cancel">Cancel appointment</EButton>
    <EButton variant="outline" @click="open = false">Keep it</EButton>
  </template>
</EDialog>
```

## Props

<!-- props:start -->

| Prop           | Type                         | Default      | Notes                                                                                                                                                                                                                                                          |
| -------------- | ---------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`         | `boolean`                    | `false`      | `v-model:open`: whether it is open. Without a binding it keeps its own state.                                                                                                                                                                                  |
| `title`        | `string`                     | **Required** | The heading and the accessible name: the question or task of a dialog, the thing a drawer shows. A dialog's reads best as a question.                                                                                                                          |
| `description`  | `string`                     | None         | A sentence under the title that says what it is for. It is shown, and read out as the description.                                                                                                                                                             |
| `role`         | `"dialog" \| "alertdialog"`  | `"dialog"`   | `alertdialog` for a confirmation that needs an answer, such as a delete. Everything else uses `dialog`.                                                                                                                                                        |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2`          | The level of the title's heading element, 1 to 6.                                                                                                                                                                                                              |
| `initialFocus` | `string`                     | None         | A CSS selector for the element that takes focus when it opens, such as `#name`. Without it, an element marked `data-autofocus` does; an `alertdialog` falls back to its least destructive action and anything else to its first control.                       |
| `dismissible`  | `boolean`                    | `false`      | Closes it when the backdrop is pressed as well. A form should leave it off, since a stray press would discard the work. A press on a toast does not count.                                                                                                     |
| `inline`       | `boolean`                    | `false`      | Shows it in the page, without the backdrop or the focus trap, for a preview. Escape and presses outside leave it open.                                                                                                                                         |
| `footer`       | `"stack" \| "row"`           | None         | How the foot's buttons sit: `stack` puts them one under another, full width, when the panel is under 24rem wide (the default, so only a phone stacks), `row` keeps them side by side at the end edge at every width, for a short pair such as Cancel and Save. |
| `size`         | `"sm" \| "md" \| "lg"`       | `"md"`       | The width: `sm` for a confirmation, `md` for most dialogs, `lg` for a form.                                                                                                                                                                                    |

<!-- props:end -->

`class`, `style` and attributes land on the dialog element.

In a panel under 24rem wide, a phone, the foot's buttons stack full width; wider ones keep them side by side. The body keeps room under its last control. `footer="row"` keeps them side by side at the end edge at every width. For a yes or no question use [`EConfirmDialog`](../ConfirmDialog/README.md).

## Slots

| Slot      | Use                                                                                                |
| --------- | -------------------------------------------------------------------------------------------------- |
| `default` | A sentence or two, or a short form.                                                                |
| `actions` | Buttons for the foot bar, with the main action first. The danger button is named for what it does. |

## Events

| Event   | Payload | Notes                                                                                                               |
| ------- | ------- | ------------------------------------------------------------------------------------------------------------------- |
| `close` |         | The person closed it with the Close button, Escape or (when `dismissible`) the backdrop. `open` is already `false`. |

## Accessibility

- A `role="dialog"` named by its title, with `aria-modal="true"` unless `inline`. Focus moves in, is trapped, and returns to the opener on close.
- Focus lands on the first control, or on the element marked `data-autofocus` or matched by `initialFocus`. An `alertdialog` lands on its least destructive action (the first foot button that is not `danger`), never on Close.
- Always offer a Close or Cancel action as well as Escape.
- The header and the foot stay in view and only the body scrolls.
- `description` shows a sentence under the title and sets `aria-describedby` to it. Without one the attribute is left off. An `aria-describedby` you pass yourself is kept.
- Set `role="alertdialog"` for a confirmation that needs an answer, such as a delete. Focus, Escape and the backdrop behave the same.
- It renders into the portal target inside `e-root`, so scoped themes apply.
- It fades and scales in over `--e-duration-move`, which the theme sets to near zero under `prefers-reduced-motion`.

## Keyboard

| Key            | Action                                                        |
| -------------- | ------------------------------------------------------------- |
| Escape         | Closes the dialog and returns focus to the opener.            |
| Tab, Shift+Tab | Moves between the controls inside; focus stays in the dialog. |

## Related

[`EToggletip`](../Toggletip/README.md) for a short explanation.
