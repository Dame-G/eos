# AePopover

A term that opens a floating panel. The panel is built from a header, a body and a footer like a dialog, with a Close button. Built on Reka UI's Popover. Use it for a definition or a short explanation; use a dialog when the reader must decide something, and `AeMenu` for a list of actions.

```vue
<AePopover label="About payment plans" title="Payment plan">
  <template #trigger>What is a payment plan?</template>
  Split your balance into equal monthly payments. There is no interest and no fee.
  <template #actions>
    <AeButton variant="outline">Set up a plan</AeButton>
  </template>
</AePopover>
```

## Props

| Prop           | Type               | Notes                                                                                               |
| -------------- | ------------------ | --------------------------------------------------------------------------------------------------- |
| `v-model`      | `boolean`          | Whether the panel is open. Leave it off for local state.                                            |
| `label`        | `string`           | Required. Names the panel for screen readers (when there is no `title`) and is read after the term. |
| `title`        | `string`           | Adds the header: a mono title and a Close button.                                                   |
| `headingLevel` | `1 \| 2 \| 3 \| 4` | The level of the title's heading, so it fits the page outline. Default 3.                           |

## Slots

| Slot      | Notes                                                                                                  |
| --------- | ------------------------------------------------------------------------------------------------------ |
| `trigger` | The term, shown with a dotted underline and an info glyph.                                             |
| default   | The body.                                                                                              |
| `actions` | Buttons in a tinted footer bar, left-aligned, the main action first. They stack full width on a phone. |

`class`, `style` and other attributes land on the term button (the panel is rendered elsewhere).

## Behaviour and accessibility

- The term is a `button` with `aria-haspopup="dialog"` and `aria-expanded`. Its accessible name is the visible term followed by the `label`, so it contains the text people see (WCAG 2.5.3).
- The panel is a non-modal `role="dialog"` named by its title, or by `label` when there is none. Enter or Space on the term opens it and focus moves into it; `Escape` and an outside press close it, and focus returns to the term. The Close button does the same.
- The panel sits 8px under the term, left-aligned, kept 16px from the edge of the screen. It renders in the portal target (`createAegis({ portalTarget })`, default `body`) with the `ae-root` class, so a scoped theme reaches it.
- Keep it short. The term is hidden when printed.
- The word "Close" goes through `useMessages()`.
- Deliberate differences from the reference: the reference's `className` (replacing the term's look) has no counterpart: `class` is added to `ae-linkbtn`. The reference named the term's button by `label` alone; here the visible term comes first so the name contains it.
