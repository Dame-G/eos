# EDrawer

A side panel for reading something next to the list the person is looking through, such as a statement or a receipt. It is a Dialog that slides in from an edge: focus is trapped, Escape closes it, the page behind cannot be scrolled or reached, and focus returns to what opened it.

```vue
<EDrawer v-model:open="open" title="October statement">
  <StatementLines />
  <template #actions><EButton>Pay now</EButton></template>
</EDrawer>
```

## Props

| Prop           | Type                         | Default | Notes                                                                             |
| -------------- | ---------------------------- | ------- | --------------------------------------------------------------------------------- |
| `v-model:open` | `boolean`                    |         | Whether it is open. Without a binding it keeps its own state.                     |
| `title`        | `string`                     |         | The heading and the drawer's accessible name.                                     |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2`     | The title's heading element.                                                      |
| `side`         | `"right" \| "left"`          | `right` | The edge it slides in from.                                                       |
| `inline`       | `boolean`                    |         | Shows it in the page, without the backdrop or the focus trap. Only for a preview. |

`class`, `style`, `id` and `data-*` attributes fall through to the drawer element.

## Events and slots

| Name      | Use                                                                               |
| --------- | --------------------------------------------------------------------------------- |
| `close`   | The person closed it with the Close button or Escape. `open` is already false.    |
| `default` | The content. It scrolls inside the drawer.                                        |
| `actions` | Buttons in a tinted foot bar, left-aligned, the main action first (see EActions). |

## Size and motion

It is full height and 28rem wide, or the full screen width on a narrow screen. It slides in over 220ms. With `prefers-reduced-motion: reduce` it appears without sliding.

## Accessibility

- A `role="dialog"` named by its title, with a Close button named by the `close` message.
- The scrolling body is a focusable `region` named by the title, so a keyboard user can scroll it with the arrow keys.
- Focus is trapped while open, Escape closes, focus returns to the opener, the body does not scroll and the page behind is hidden from assistive technology. A press on the backdrop does not close it.
- It renders into the configured portal target inside an `e-root` element, so a scoped theme reaches it.

## Rules

- Use it to show a statement or receipt beside the list. Use EDialog for a short decision.
