# ETabs

Tabs for switching between views of the same record or list. It switches panels only. Use [`ENavList`](../NavList/README.md) for links to other pages, in a sidebar, outline or header row. Use [`EDisclosure`](../Disclosure/README.md) (with a shared `group`) for sections that open and close.

```vue
<ETabs
  v-model="tab"
  :items="[
    { id: 'open', label: 'Open', count: 3 },
    { id: 'paid', label: 'Paid' },
  ]"
>
  <template #panel-open>Open statements</template>
  <template #panel-paid>Paid statements</template>
</ETabs>
```

## Props

<!-- props:start -->

| Prop          | Type                         | Default        | Notes                                                                                                                                                                                                                                    |
| ------------- | ---------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`  | `string`                     | `first tab`    | `v-model`: the `id` of the selected tab. Keeps its own state when unbound.                                                                                                                                                               |
| `items`       | `TabItem[]`                  | **Required**   | The tabs, in order: `{ id, label, count?, disabled? }`. Two to five across, with short labels. A vertical list can be longer. `id` is the `v-model` value and names the `panel-<id>` slot.                                               |
| `fill`        | `boolean`                    | `false`        | Gives every tab an equal share of the width instead of its own. Use it in a narrow container where all tabs must fit. Labels truncate.                                                                                                   |
| `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | `vertical` stacks the tabs in a column beside their panel, for a long list of sections or more tabs than fit across. `fill` has no effect.                                                                                               |
| `side`        | `"start" \| "end"`           | `"start"`      | Which side of the panel a `vertical` list sits on: `start` is the left in a left-to-right page, `end` the right. It has no effect on a horizontal row.                                                                                   |
| `stretch`     | `boolean`                    | `false`        | Makes the tabs fill the height of their container, with the panel taking what is left and scrolling its own content: for tabs in a fixed-height panel or a side column.                                                                  |
| `flush`       | `boolean`                    | `false`        | Sets the row on its rule, for tabs that sit against a rule above them or against the edge of a pane: square corners, no inset around the row, a rule the full width of the row, and a selected tab that covers it. Horizontal tabs only. |
| `label`       | `string`                     | None           | Names the row of tabs for screen readers. Needed when a page has more than one set of tabs.                                                                                                                                              |

<!-- props:end -->

`flush` sets a horizontal row on its rule, for tabs that sit against a rule above them or the edge of a pane: square tabs, no inset around the row, a rule the full width of the row and a selected tab that covers it. Only the selected tab keeps an edge.

`class`, `style` and attributes land on the root `div` element. If the tabs are wider than the space, the row scrolls sideways with no scrollbar, so keep the labels short.

## Slots

| Slot         | Use                                                                                 |
| ------------ | ----------------------------------------------------------------------------------- |
| `panel-<id>` | The panel of the tab with that `id` (`<template #panel-open>`). It gets `{ item }`. |
| `panel`      | Fallback panel for tabs without their own slot. It gets `{ item }`.                 |

A slot named by the bare `id` (`#open`) still works for ids other than `panel` and `default`; use `panel-<id>` in new code. An item with `disabled: true` stays in the row, dimmed. A `v-model` value that is not among the items, or names a disabled one, selects the first tab that can be chosen.

## Accessibility

- `count` is part of the tab's accessible name ("Open 3").

## Keyboard

| Key                     | Action                                                                  |
| ----------------------- | ----------------------------------------------------------------------- |
| Tab                     | Moves from the selected tab into its panel.                             |
| Arrow Left, Arrow Right | Selects the previous or next tab, wrapping (reversed in right-to-left). |
| Arrow Up, Arrow Down    | The same when `vertical`.                                               |
| Home, End               | Selects the first or last tab.                                          |

## Related

[`ESegmented`](../Segmented/README.md) for a value that changes how a list is shown.
