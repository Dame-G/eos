# AeTabs

Tabs for switching between views of the same record or list. Built on Reka UI's Tabs.

```vue
<AeTabs
  v-model="tab"
  :items="[
    { id: 'open', label: 'Open', count: 3 },
    { id: 'paid', label: 'Paid' },
  ]"
>
  <template #open>Open statements</template>
  <template #paid>Paid statements</template>
</AeTabs>
```

## Props

| Prop      | Type        | Default   | Notes                                                                   |
| --------- | ----------- | --------- | ----------------------------------------------------------------------- |
| `items`   | `TabItem[]` |           | `{ id, label, count? }`. Two to five tabs.                              |
| `v-model` | `string`    | first tab | The `id` of the selected tab. Without a binding it keeps its own state. |

`class`, `style` and attributes fall through to the root.

## Slots

One slot per tab, named by its `id` (`<template #open>`), holds that tab's panel. The `panel` slot is the fallback for tabs without a slot of their own; it receives `{ item }`.

## Keyboard

Arrow Left and Arrow Right move to the previous and next tab and select it, wrapping at the ends (they follow the reading direction in right-to-left pages). Home and End go to the first and last. Tab leaves the strip for the panel.

## Accessibility

- `role="tablist"` with `role="tab"` buttons and a `role="tabpanel"` for each, linked with `aria-controls` and `aria-labelledby`. The selected tab has `aria-selected="true"`; only its panel is shown.
- The count is part of the tab's accessible name ("Open 3").
- The selected tab has a `primary` underline and heavier text. In forced colours it is highlighted.

## Rules

- Two to five tabs, with short labels. The strip scrolls sideways when they do not fit on a phone.
- Tabs switch views of the same thing. For a stack of sections that open and close, use AeAccordion.
