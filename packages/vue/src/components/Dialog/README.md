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

| Prop           | Type                         | Default      | Notes                                                                                                                           |
| -------------- | ---------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `open`         | `boolean`                    | `false`      | `v-model:open`: whether it is open. Without a binding it keeps its own state.                                                   |
| `title`        | `string`                     | **Required** | The question or task, shown as the heading and used as the accessible name. It reads best as a question.                        |
| `description`  | `string`                     | —            | A sentence under the title that says what the dialog is for. It is shown, and read out as the description.                      |
| `role`         | `"dialog" \| "alertdialog"`  | `"dialog"`   | `alertdialog` for a confirmation that needs an answer, such as a delete. Every other dialog uses `dialog`.                      |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2`          | The level of the title's heading element, 1 to 6.                                                                               |
| `dismissible`  | `boolean`                    | `false`      | Closes the dialog when the backdrop is pressed as well. A form should leave it off, since a stray press would discard the work. |
| `inline`       | `boolean`                    | `false`      | Shows the dialog in the page, without the backdrop or the focus trap, for a preview.                                            |

<!-- props:end -->

`class`, `style` and attributes land on the dialog element.

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

- A `role="dialog"` named by its title. Focus moves in, is trapped, and returns to the opener on close.
- Escape closes it. Always offer a Close or Cancel action too.
- `description` shows a sentence under the title and sets `aria-describedby` to it. Without one the attribute is left off. An `aria-describedby` you pass yourself is kept.
- Set `role="alertdialog"` for a confirmation that needs an answer, such as a delete. Focus, Escape and the backdrop behave the same.
- It renders into the portal target inside `e-root`, so scoped themes apply.
