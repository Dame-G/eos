# EVirtualList

A scrolling list that renders only the rows in view, for thousands of rows such as every game played. Use [`EList`](../List/README.md) with plain rows for a few hundred or fewer, and [`EDataGrid`](../DataGrid/README.md) (its `virtual` option) for a table.

```vue
<EVirtualList :items="games" :row-height="56" item-key="id" label="Games" style="height: 30rem">
  <template #default="{ item }">
    <GameSummary :game="item" />
  </template>
</EVirtualList>
```

Inside an [`EList`](../List/README.md), with an [`EListRow`](../ListRow/README.md) per item, the list's arrow keys, Home and End reach rows that are not rendered yet:

```vue
<EList v-model="openGame" label="Games">
  <EVirtualList :items="games" :row-height="56" item-key="id" style="height: 30rem">
    <template #default="{ item }">
      <EListRow :value="item.id" :title="item.players" :subtitle="item.when" />
    </template>
  </EVirtualList>
</EList>
```

## Props

<!-- props:start -->

| Prop        | Type                                                        | Default      | Notes                                                                                                                                 |
| ----------- | ----------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `items`     | `T[]`                                                       | **Required** | Everything in the list, in order. Only the rows in view (and a few around them) are rendered.                                         |
| `rowHeight` | `number`                                                    | **Required** | The height of a row in pixels: every row's, or the first guess when `measure` is on.                                                  |
| `measure`   | `boolean`                                                   | `false`      | Measures each row as it renders, for rows whose height differs or follows the text size. Off, every row is exactly `rowHeight`.       |
| `itemKey`   | `keyof T \| ((item: T, index: number) => string \| number)` | None         | What keeps a row's identity as the list changes: a field of the item, or a function of the item and its index. Without it, the index. |
| `overscan`  | `number`                                                    | `4`          | How many rows to render beyond each end of the view, so a fast scroll or the arrow keys meet rows already there.                      |
| `label`     | `string`                                                    | None         | Names the scrolling region, which is then a landmark while it scrolls. Inside an `EList` the list has the name.                       |

`T` is a type parameter, inferred from the props you pass.

<!-- props:end -->

`class`, `style` and attributes land on the scrolling `div`. It is as tall as its parent lets it be: give it, or its parent, a height.

## Slots

| Slot      | Use                                                                  |
| --------- | -------------------------------------------------------------------- |
| `default` | One row. Its scope is `{ item, index }`, the index being in `items`. |

## Methods

| Method                 | Use                                                   |
| ---------------------- | ----------------------------------------------------- |
| `scrollToIndex(index)` | Scrolls row `index` into view, as little as it takes. |

## Accessibility

- On its own, the scroller is a tab stop while it scrolls, so the arrow keys, Page Up and Page Down scroll it; with `label` it is also a named region. Inside an `EList` the list handles the keys and has the name.
- Rows that are not rendered are not in the page, so a screen reader's own list commands and the browser's find see only the rows in view. Give people another way to reach a row by name, such as a search.
- Without `measure`, each row is exactly `rowHeight` pixels; with it, rows that the text size or the content makes taller still scroll exactly.

## Keyboard

| Key                  | Action                                                                     |
| -------------------- | -------------------------------------------------------------------------- |
| Tab                  | Moves to the scroller while it scrolls, when it is not inside an `EList`.  |
| Arrow Down, Arrow Up | Scroll the focused scroller. Inside an `EList`, move between rows instead. |
| Page Down, Page Up   | Scroll the focused scroller by a page.                                     |

## Related

[`EList`](../List/README.md), [`EListRow`](../ListRow/README.md).
