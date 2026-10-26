# EPopover

A non-modal panel anchored to a control you provide, which opens on a press, for a small set of details and actions such as a queue or a filter. Use [`EToggletip`](../Toggletip/README.md) to explain a term, [`EMenu`](../Menu/README.md) for a list of actions, and [`EDialog`](../Dialog/README.md) when the reader must decide something.

```vue
<EPopover label="Background work" title="Background work">
  <template #trigger>
    <EButton variant="quiet" size="sm">2 tests running</EButton>
  </template>
  <QueueRows />
  <template #actions><EButton variant="outline">Pause all</EButton></template>
</EPopover>
```

## Props

<!-- props:start -->

| Prop           | Type                                    | Default      | Notes                                                                                                                                  |
| -------------- | --------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`   | `boolean`                               | `false`      | `v-model`: the open state.                                                                                                             |
| `label`        | `string`                                | **Required** | Names the panel for screen readers when there is no `title`.                                                                           |
| `title`        | `string`                                | None         | Adds a title row with this title and a Close button.                                                                                   |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6`            | `3`          | The level of the title's heading, so it fits the page outline.                                                                         |
| `side`         | `"top" \| "bottom" \| "start" \| "end"` | `"bottom"`   | The side of the trigger it opens on. `start` and `end` follow the reading direction. It flips to the other side when there is no room. |
| `align`        | `"start" \| "center" \| "end"`          | `"start"`    | How it lines up with the trigger along that side.                                                                                      |

<!-- props:end -->

`class`, `style` and attributes land on the panel, so a class can set its width. It is `28rem` wide at most, and never wider than the screen.

## Slots

| Slot      | Use                                                                                                                                                      |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `trigger` | The control that opens it: one element, usually an `EButton`. Its scope is `{ open }`. It receives `aria-haspopup`, `aria-expanded` and `aria-controls`. |
| `default` | The content.                                                                                                                                             |
| `actions` | Buttons in a footer, main action first. They stack full width on a narrow screen.                                                                        |

## Accessibility

- The panel is a non-modal `role="dialog"` named by its title, or by `label` without one. The page behind it stays usable.
- Opening moves focus to the first control inside. Escape, an outside press or Close closes it and returns focus to the trigger.
- Give the trigger a visible name that says what opens, such as the state it summarises.

## Keyboard

| Key                  | Action                                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| Enter, Space         | On the trigger, opens or closes the panel.                                                                 |
| Arrow Down, Arrow Up | Moves to the next or previous control in the panel, wrapping. A field or a list inside keeps its own keys. |
| Home, End            | Moves to the first or last control in the panel.                                                           |
| Escape               | Closes the panel and returns focus to the trigger.                                                         |
| Tab                  | Moves through the panel and out of it; the panel is not modal.                                             |

## Related

[`ESheet`](../Sheet/README.md) for a larger panel docked to one side.
