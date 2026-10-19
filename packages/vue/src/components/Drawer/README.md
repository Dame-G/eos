# EDrawer

A side panel that slides in from an edge, for reading something beside the list, such as a statement or receipt. Use `EDialog` for a short decision.

```vue
<EDrawer v-model:open="open" title="October statement">
  <StatementLines />
  <template #actions><EButton>Pay now</EButton></template>
</EDrawer>
```

## Props

| Prop           | Type                            | Default | Notes                                                                       |
| -------------- | ------------------------------- | ------- | --------------------------------------------------------------------------- |
| `open`         | `boolean`                       |         | v-model:open: whether it is open. Without a binding it keeps its own state. |
| `title`        | `string`                        |         | Required. The heading and accessible name.                                  |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6`    | `2`     | Heading level of the title.                                                 |
| `side`         | `"right" \| "left" \| "bottom"` | `right` | The edge it slides in from; `bottom` is a sheet for phones.                 |
| `inline`       | `boolean`                       |         | Renders in the page without backdrop or focus trap; previews only.          |

`class`, `style` and attributes land on the drawer element. It is full height and 28rem wide (full width on narrow screens).

## Slots

| Slot      | Use                                        |
| --------- | ------------------------------------------ |
| `default` | The content; it scrolls inside the drawer. |
| `actions` | Foot-bar buttons, main action first.       |

## Events

| Event   | Payload | Notes                                                           |
| ------- | ------- | --------------------------------------------------------------- |
| `close` |         | The Close button or Escape was used; `open` is already `false`. |

## Accessibility

- A `role="dialog"` named by its title; focus is trapped while open and returns to the opener.
- Escape closes it; a backdrop press does not.
- The scrolling body is a focusable region, so it scrolls with the arrow keys.
