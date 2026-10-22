# EDrawer

A side panel that slides in from an edge, for reading something beside the list, such as a statement or receipt. Use [`EDialog`](../Dialog/README.md) for a short decision.

```vue
<EDrawer v-model:open="open" title="October statement">
  <StatementLines />
  <template #actions><EButton>Pay now</EButton></template>
</EDrawer>
```

## Props

<!-- props:start -->

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `open` | `boolean` | `false` | `v-model:open`: whether it is open. Without a binding it keeps its own state. |
| `title` | `string` | **Required** | The panel's heading and accessible name, such as the statement being read. |
| `description` | `string` | None | A sentence under the title that says what the drawer is for. It is shown, and read out as the description. |
| `role` | `"dialog" \| "alertdialog"` | `"dialog"` | `alertdialog` for a confirmation that needs an answer, such as a delete. Every other drawer uses `dialog`. |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2` | The level of the title's heading element, 1 to 6. |
| `side` | `"right" \| "left" \| "bottom"` | `"right"` | The edge it slides in from. `bottom` gives a sheet that suits phones. |
| `dismissible` | `boolean` | `false` | Closes the drawer when the backdrop is pressed as well. A form should leave it off, since a stray press would discard the work. |
| `inline` | `boolean` | `false` | Shows the drawer in the page, without the backdrop or the focus trap, for a preview. |

<!-- props:end -->

`class`, `style` and attributes land on the drawer element. On the left and right it is full height and up to 28rem wide, and never wider than the screen. On the bottom it is full width and up to 32rem tall.

## Slots

| Slot      | Use                                                                        |
| --------- | -------------------------------------------------------------------------- |
| `default` | The content, such as a statement or receipt. It scrolls inside the drawer. |
| `actions` | Buttons for the foot bar, with the main action first.                      |

## Events

| Event   | Payload | Notes                                                                                                               |
| ------- | ------- | ------------------------------------------------------------------------------------------------------------------- |
| `close` |         | The person closed it with the Close button, Escape or (when `dismissible`) the backdrop. `open` is already `false`. |

## Accessibility

- A `role="dialog"` named by its title. Focus is trapped while open and returns to the opener.
- Escape closes it.
- `description` shows a sentence under the title and sets `aria-describedby` to it. Without one the attribute is left off. An `aria-describedby` you pass yourself is kept.
- `role="alertdialog"` is available as on [`EDialog`](../Dialog/README.md).
- The slide takes its length from the `--e-duration-move` token, so the `motion` presets apply, and it stops moving under `prefers-reduced-motion`.
- The scrolling body is a focusable region, so it scrolls with the arrow keys.
