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

| Prop           | Type                           | Default      | Notes                                                                                                                                                                                                                                               |
| -------------- | ------------------------------ | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`         | `boolean`                      | `false`      | `v-model:open`: whether it is open. Without a binding it keeps its own state.                                                                                                                                                                       |
| `title`        | `string`                       | **Required** | The heading and the accessible name: the question or task of a dialog, the thing a drawer shows. A dialog's reads best as a question.                                                                                                               |
| `description`  | `string`                       | None         | A sentence under the title that says what it is for. It is shown, and read out as the description.                                                                                                                                                  |
| `role`         | `"dialog" \| "alertdialog"`    | `"dialog"`   | `alertdialog` for a confirmation that needs an answer, such as a delete. Everything else uses `dialog`.                                                                                                                                             |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6`   | `2`          | The level of the title's heading element, 1 to 6.                                                                                                                                                                                                   |
| `initialFocus` | `string`                       | None         | A CSS selector for the element that takes focus when it opens, such as `#name`. Without it, an element marked `data-autofocus` does; an `alertdialog` falls back to its least destructive action and anything else to its first control.            |
| `dismissible`  | `boolean`                      | `false`      | Closes it when the backdrop is pressed as well. A form should leave it off, since a stray press would discard the work. A press on a toast does not count.                                                                                          |
| `inline`       | `boolean`                      | `false`      | Shows it in the page, without the backdrop or the focus trap, for a preview. Escape and presses outside leave it open.                                                                                                                              |
| `footer`       | `"stack" \| "row"`             | None         | How the foot's buttons sit: `stack` puts them one under another, full width, when the panel is under 32rem wide (the default, for a phone), `row` keeps them side by side at the end edge at every width, for a short pair such as Cancel and Save. |
| `side`         | `"end" \| "start" \| "bottom"` | `"end"`      | The edge it slides in from. `end` is the right in a left-to-right page, `start` the left, and both flip in a right-to-left page. `bottom` gives a sheet that suits phones.                                                                          |
| `size`         | `"sm" \| "md" \| "lg"`         | `"sm"`       | The width of a side drawer: `sm` (28rem), `md` (32rem) or `lg` (36rem), never wider than the screen. A `bottom` sheet is always full width.                                                                                                         |

<!-- props:end -->

`class`, `style` and attributes land on the drawer element. On a side it is full height and as wide as `size`. On the bottom it is full width and up to 32rem tall.

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
- `description` shows a sentence under the title and sets `aria-describedby` to it. Without one the attribute is left off. An `aria-describedby` you pass yourself is kept.
- `role="alertdialog"` is available as on [`EDialog`](../Dialog/README.md).
- The slide takes its length from the `--e-duration-move` token, so the `motion` presets apply, and it stops moving under `prefers-reduced-motion`.
- The body takes a tab stop only while its content scrolls, so it can be scrolled with the arrow keys. A body that fits is not a tab stop.
- `side` is logical: `start` and `end` flip in a right-to-left page, and so does the slide.

## Keyboard

| Key                  | Action                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------- |
| Escape               | Closes the drawer and returns focus to the opener.                                             |
| Tab, Shift+Tab       | Moves between the controls inside, and to the body when it scrolls; focus stays in the drawer. |
| Arrow Up, Arrow Down | Scrolls the focused body.                                                                      |

## Related

[`EToggletip`](../Toggletip/README.md) for a small floating note.
