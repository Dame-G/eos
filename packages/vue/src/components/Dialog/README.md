# EDialog

A modal dialog for a short decision. Built on Reka UI's Dialog: focus moves in and is trapped, Escape closes it, the page behind cannot be scrolled or reached, and focus returns to what opened it.

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

| Prop           | Type                         | Default | Notes                                                                             |
| -------------- | ---------------------------- | ------- | --------------------------------------------------------------------------------- |
| `v-model:open` | `boolean`                    |         | Whether it is open. Without a binding it keeps its own state.                     |
| `title`        | `string`                     |         | The heading and the dialog's accessible name.                                     |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2`     | The title's heading element.                                                      |
| `inline`       | `boolean`                    |         | Shows it in the page, without the backdrop or the focus trap. Only for a preview. |

`class`, `style`, `id` and `data-*` attributes fall through to the dialog element.

## Events and slots

| Name      | Use                                                                                                                 |
| --------- | ------------------------------------------------------------------------------------------------------------------- |
| `close`   | The person closed it with the Close button or Escape. `open` is already false.                                      |
| `default` | The content: a sentence or two, or a short form.                                                                    |
| `actions` | Buttons in a tinted foot bar (see EActions), left-aligned, the main action first. They stack full width on a phone. |

## Accessibility

- It is a `role="dialog"` named by its title (`aria-labelledby`). The Close button is named "Close" (the `close` message).
- Focus moves to the first control inside, Tab and Shift+Tab stay inside, Escape closes, and focus goes back to the control that was focused when it opened.
- While open the body cannot scroll and everything outside is hidden from assistive technology.
- A press on the backdrop does not close it, as with a native dialog. Offer a Close or Cancel action.
- The dialog renders into the configured portal target (`createEos({ portalTarget })`, the body by default) inside an `e-root` element, so a theme applied to part of the page reaches it.

## Rules

- Use it for a short decision. For a statement or receipt next to a list, use EDrawer.
- Name the danger button for what it does ("Cancel appointment"), not "Yes".
- Put the main action first. Give the dialog a real question or task as its title.
