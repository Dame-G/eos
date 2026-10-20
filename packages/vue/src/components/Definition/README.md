# EDefinition

A term that opens a small floating panel with a definition or short explanation. Use a dialog when the reader must decide something and `EMenu` for actions.

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

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | `boolean` | `false` | `v-model`: the open state. |
| `label` | `string` | **Required** | Names the panel for screen readers (when there is no `title`) and is read after the term. |
| `title` | `string` | — | Adds a title row with this title and a Close button. |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `3` | The level of the title's heading, so it fits the page outline. |

<!-- props:end -->

`class`, `style` and attributes land on the term `button` element.

## Slots

| Slot      | Use                                                                    |
| --------- | ---------------------------------------------------------------------- |
| `trigger` | The term, with a dotted underline and info icon.                       |
| `default` | The explanation; keep it short.                                        |
| `actions` | Buttons in a footer, main action first; stacked full width on a phone. |

## Accessibility

- The term is a button with `aria-haspopup="dialog"`; its name is the visible term followed by `label`.
- The panel is a non-modal `role="dialog"` named by its title, or by `label` without one.
- Enter or Space opens it and moves focus in; Escape, an outside press or Close closes it and returns focus to the term.
