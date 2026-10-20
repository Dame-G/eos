# ETabs

Tabs for switching between views of the same record or list. It switches panels only; use `ENavList` for links to other pages, in a sidebar, outline or header row. Use `EDisclosure` (with a shared `group`) for sections that open and close.

```vue
<ETabs
  v-model="tab"
  :items="[
    { id: 'open', label: 'Open', count: 3 },
    { id: 'paid', label: 'Paid' },
  ]"
>
  <template #open>Open statements</template>
  <template #paid>Paid statements</template>
</ETabs>
```

## Props

<!-- props:start -->

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `modelValue` | `string` | `first tab` | `v-model`: the `id` of the selected tab. Keeps its own state when unbound. |
| `items` | `TabItem[]` | — | The tabs, in order: `{ id, label, count? }`. Two to five, with short labels. `id` names the slot and is the `v-model` value. |
| `fill` | `boolean` | `false` | Share the width equally between the tabs instead of letting each take its own. For a narrow container where the tabs must all fit; labels truncate. |

<!-- props:end -->

`class`, `style` and attributes land on the root `div` element. Tabs are ringed and sit flush edge to edge, rounded only at the ends of the row; the selected one is outlined in the primary colour. If the tabs are wider than the space, the row scrolls sideways with no scrollbar; keep the labels short.

## Slots

| Slot    | Use                                                                        |
| ------- | -------------------------------------------------------------------------- |
| `<id>`  | The panel of the tab with that `id` (`<template #open>`); gets `{ item }`. |
| `panel` | Fallback panel for tabs without their own slot; gets `{ item }`.           |

## Accessibility

- Arrow Left and Right select the previous or next tab, wrapping and following the reading direction; Home and End go to the first and last; Tab moves into the panel.
- `count` is part of the tab's accessible name ("Open 3").
