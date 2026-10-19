# EDialog

A modal dialog for a short decision. Use `EDrawer` to read a statement or receipt beside a list.

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

| Prop           | Type                         | Default | Notes                                                                       |
| -------------- | ---------------------------- | ------- | --------------------------------------------------------------------------- |
| `open`         | `boolean`                    |         | v-model:open: whether it is open. Without a binding it keeps its own state. |
| `title`        | `string`                     |         | Required. The heading and accessible name; make it a real question.         |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2`     | Heading level of the title.                                                 |
| `inline`       | `boolean`                    |         | Renders in the page without backdrop or focus trap; previews only.          |

`class`, `style` and attributes land on the dialog element.

## Slots

| Slot      | Use                                                                           |
| --------- | ----------------------------------------------------------------------------- |
| `default` | A sentence or two, or a short form.                                           |
| `actions` | Foot-bar buttons, main action first; name the danger button for what it does. |

## Events

| Event   | Payload | Notes                                                           |
| ------- | ------- | --------------------------------------------------------------- |
| `close` |         | The Close button or Escape was used; `open` is already `false`. |

## Accessibility

- A `role="dialog"` named by its title; focus moves in, is trapped, and returns to the opener on close.
- Escape closes it; a backdrop press does not, so always offer a Close or Cancel action.
- It renders into the portal target inside `e-root`, so scoped themes apply.
