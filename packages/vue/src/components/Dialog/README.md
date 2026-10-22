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

| Prop           | Type                         | Default      | Notes                                                                                                              |
| -------------- | ---------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------ |
| `open`         | `boolean`                    | `false`      | `v-model:open`: whether it is open. Without a binding it keeps its own state.                                      |
| `title`        | `string`                     | **Required** | The question or task, as the dialog's heading and accessible name; make it a real question.                        |
| `description`  | `string`                     | —            | A sentence under the title that says what the dialog is for. It is shown, and read out as the description.         |
| `role`         | `"dialog" \| "alertdialog"`  | `"dialog"`   | `alertdialog` for a confirmation that needs an answer, such as a delete. Leave it as `dialog` for everything else. |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2`          | The level of the title's heading element, 1 to 6.                                                                  |
| `dismissible`  | `boolean`                    | `false`      | Also closes when the backdrop is pressed. Leave it off for a form, where a stray press would throw the work away.  |
| `inline`       | `boolean`                    | `false`      | Shows the dialog in the page, without the backdrop or the focus trap. Only for a preview.                          |

<!-- props:end -->

`class`, `style` and attributes land on the dialog element.

## Slots

| Slot      | Use                                                                           |
| --------- | ----------------------------------------------------------------------------- |
| `default` | A sentence or two, or a short form.                                           |
| `actions` | Foot-bar buttons, main action first; name the danger button for what it does. |

## Events

| Event   | Payload | Notes                                                                                              |
| ------- | ------- | -------------------------------------------------------------------------------------------------- |
| `close` |         | The Close button, Escape or (when `dismissible`) the backdrop was used; `open` is already `false`. |

## Accessibility

- A `role="dialog"` named by its title; focus moves in, is trapped, and returns to the opener on close.
- Escape closes it. Always offer a Close or Cancel action too.
- `description` shows a sentence of muted text under the title and sets `aria-describedby` to it. Without one the attribute is left off. An `aria-describedby` you pass yourself is kept.
- Set `role="alertdialog"` for a confirmation that needs an answer, such as a delete. Focus, Escape and the backdrop behave the same.
- It renders into the portal target inside `e-root`, so scoped themes apply.
