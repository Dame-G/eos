# EDefinition

A term that opens a small floating panel with a definition or short explanation. Use a dialog when the reader must decide something and [`EMenu`](../Menu/README.md) for actions.

```vue
<EDefinition label="About payment plans" title="Payment plan">
  <template #trigger>What is a payment plan?</template>
  Split your balance into equal monthly payments. There is no interest and no fee.
  <template #actions>
    <EButton variant="outline">Set up a plan</EButton>
  </template>
</EDefinition>
```

## Props

<!-- props:start -->

| Prop           | Type                         | Default      | Notes                                                                                                                                                              |
| -------------- | ---------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `modelValue`   | `boolean`                    | `false`      | `v-model`: the open state.                                                                                                                                         |
| `label`        | `string`                     | **Required** | Names the panel for screen readers (when there is no `title`) and is read after the term.                                                                          |
| `title`        | `string`                     | None         | Adds a title row with this title and a Close button.                                                                                                               |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `3`          | The level of the title's heading, so it fits the page outline.                                                                                                     |
| `inline`       | `boolean`                    | `false`      | Sets the term in the sentence around it, at the sentence's size and on its baseline, without the info icon. For a term inside running text, such as a footer line. |

<!-- props:end -->

`class`, `style` and attributes land on the term `button` element. `inline` sets the term inside running text (`Licensed under <EDefinition inline ...>MIT</EDefinition>`): the sentence's font and baseline, and no info icon.

## Slots

| Slot      | Use                                                                               |
| --------- | --------------------------------------------------------------------------------- |
| `trigger` | The term that opens the panel.                                                    |
| `default` | The explanation. Keep it short.                                                   |
| `actions` | Buttons in a footer, main action first. They stack full width on a narrow screen. |

## Accessibility

- The term is a button with `aria-haspopup="dialog"`, and its name is the visible term followed by `label`.
- The panel is a non-modal `role="dialog"` named by its title, or by `label` without one.
- Enter or Space opens it and moves focus in. Escape, an outside press or Close closes it and returns focus to the term.

## Keyboard

| Key          | Action                                                                   |
| ------------ | ------------------------------------------------------------------------ |
| Enter, Space | Opens the panel and moves focus into it.                                 |
| Escape       | Closes the panel and returns focus to the term.                          |
| Tab          | Moves through the panel's buttons and out of it; the panel is not modal. |

## Related

[`EDialog`](../Dialog/README.md) when the reader must decide something, [`ETooltip`](../Tooltip/README.md) for a one-line hint.
