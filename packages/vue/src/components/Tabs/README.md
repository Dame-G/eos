# ETabs

Tabs for switching between views of the same record or list. Items with `href` or `to` make a row or column of navigation links instead of panels. Use `EAccordion` for sections that open and close.

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

| Prop            | Type                         | Default      | Notes                                                                                                                        |
| --------------- | ---------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`    | `string`                     | first tab    | v-model: the `id` of the selected tab. Keeps its own state when unbound. Panels only.                                        |
| `items`         | `TabItem[]`                  |              | `{ id?, label, count?, href?, to?, current? }`. Two to five tabs with short labels. `id` names the slot; links need no `id`. |
| `sections`      | `TabSection[]`               |              | Links in labelled groups instead of `items`: `{ label?, items }`.                                                            |
| `orientation`   | `"horizontal" \| "vertical"` | `horizontal` | `vertical` stacks links with a rule down the start edge, for a sidebar or outline. Links only.                               |
| `dense`         | `boolean`                    |              | Shorter rows and smaller text, for a long list of links.                                                                     |
| `label`         | `string`                     | `Main`       | The landmark name when the tabs are links.                                                                                   |
| `linkComponent` | `string \| Component`        | `a`          | Renders each link. Pass `RouterLink` and give items `to`.                                                                    |

`class`, `style` and attributes land on the root element (`div` for panels, `nav` for links). A faint divider sits between tabs. If the tabs are wider than the space, the row scrolls sideways with no scrollbar; keep the labels short.

## Slots

| Slot    | Use                                                                        |
| ------- | -------------------------------------------------------------------------- |
| `<id>`  | The panel of the tab with that `id` (`<template #open>`); gets `{ item }`. |
| `panel` | Fallback panel for tabs without their own slot; gets `{ item }`.           |

## Accessibility

- Arrow Left and Right select the previous or next tab, wrapping and following the reading direction; Home and End go to the first and last; Tab moves into the panel.
- `count` is part of the tab's accessible name ("Open 3").
- Links form a `nav` landmark named by `label`; the item with `current` has `aria-current="page"`.
