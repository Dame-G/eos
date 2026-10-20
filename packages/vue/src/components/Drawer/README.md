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

| Prop           | Type                            | Default      | Notes                                                                                                             |
| -------------- | ------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------- |
| `open`         | `boolean`                       | `false`      | `v-model:open`: whether it is open. Without a binding it keeps its own state.                                     |
| `title`        | `string`                        | **Required** | The panel's heading and accessible name, such as the statement being read.                                        |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6`    | `2`          | The level of the title's heading element, 1 to 6.                                                                 |
| `side`         | `"right" \| "left" \| "bottom"` | `"right"`    | The edge it slides in from; `bottom` is a sheet for phones.                                                       |
| `dismissible`  | `boolean`                       | `false`      | Also closes when the backdrop is pressed. Leave it off for a form, where a stray press would throw the work away. |
| `inline`       | `boolean`                       | `false`      | Shows the drawer in the page, without the backdrop or the focus trap. Only for a preview.                         |

<!-- props:end -->

`class`, `style` and attributes land on the drawer element. It is full height and 28rem wide (full width on narrow screens).

## Slots

| Slot      | Use                                        |
| --------- | ------------------------------------------ |
| `default` | The content; it scrolls inside the drawer. |
| `actions` | Foot-bar buttons, main action first.       |

## Events

| Event   | Payload | Notes                                                                                              |
| ------- | ------- | -------------------------------------------------------------------------------------------------- |
| `close` |         | The Close button, Escape or (when `dismissible`) the backdrop was used; `open` is already `false`. |

## Accessibility

- A `role="dialog"` named by its title; focus is trapped while open and returns to the opener.
- Escape closes it.
- The scrolling body is a focusable region, so it scrolls with the arrow keys.
