# EAccordion

A stack of sections that open and close, to hide secondary detail on a page of settings. Use `EDisclosure` for a single section.

```vue
<EAccordion
  :items="[
    { id: 'billing', title: 'Billing', meta: '3 items', defaultOpen: true },
    { id: 'privacy', title: 'Privacy' },
  ]"
>
  <template #billing>Your billing settings.</template>
  <template #privacy>Your privacy settings.</template>
</EAccordion>
```

## Props

| Prop       | Type              | Default | Notes                                                                                               |
| ---------- | ----------------- | ------- | --------------------------------------------------------------------------------------------------- |
| `items`    | `AccordionItem[]` |         | Required. `{ id, title, meta?, defaultOpen? }`. `meta` is a short note at the right of the summary. |
| `multiple` | `boolean`         |         | Several sections can stay open. Otherwise opening one closes the others.                            |

`class`, `style` and attributes land on the `div` element.

## Slots

| Slot              | Use                                                               |
| ----------------- | ----------------------------------------------------------------- |
| one per item `id` | A section's content, for example `#billing`. Receives `{ item }`. |

## Accessibility

- Each section is a native `details` with a `summary`: Tab reaches each summary, Enter and Space toggle it, and the open state is announced.
