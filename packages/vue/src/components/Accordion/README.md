# EAccordion

A stack of sections that open and close, to hide secondary detail on a page of settings. It is a column of EDisclosure in its card variant on native `details`, so it works without script.

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

| Prop       | Type              | Default | Notes                                                                      |
| ---------- | ----------------- | ------- | -------------------------------------------------------------------------- |
| `items`    | `AccordionItem[]` |         | `{ id, title, meta?, defaultOpen? }`. `meta` is a short note at the right. |
| `multiple` | `boolean`         |         | Lets several sections stay open. Otherwise opening one closes the others.  |

`class`, `style` and attributes fall through to the root. Each section's content is the slot named by its `id`.

## Accessibility

- Native `details` and `summary`: Tab reaches each summary, Enter and Space open and close it, and the browser announces the expanded state.
- One-at-a-time behaviour uses the native `name` attribute that groups `details`.

## Rules

- Hide secondary detail only. A single hidden section is an EDisclosure, not an accordion.
- Why not Reka's Accordion: it renders buttons and regions, which changes the DOM and needs script. The native element gives the reference look and works without it.
