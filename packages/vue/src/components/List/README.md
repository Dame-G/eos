# EList

A keyboard-navigable column of [`EListRow`](../ListRow/README.md)s with one current or selected row, such as a list of games beside a board. Use [`ETree`](../Tree/README.md) when rows fold into groups, [`ENavList`](../NavList/README.md) for site navigation, and [`ESelect`](../Select/README.md) to choose a value in a form.

```vue
<EList v-model="openGame" label="Games">
  <EListRow v-for="g in games" :key="g.id" :value="g.id" :title="g.players" :subtitle="g.when" :live="g.live" />
</EList>
```

Thousands of rows go in an [`EVirtualList`](../VirtualList/README.md) inside the list, which renders only the rows in view; the keys still reach every row:

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

| Prop          | Type                       | Default      | Notes                                                                                                                                                      |
| ------------- | -------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `modelValue`  | `string \| number \| null` | None         | `v-model`: the `value` of the current or selected row. Without a binding it keeps its own state.                                                           |
| `label`       | `string`                   | **Required** | The list's accessible name, such as "Games".                                                                                                               |
| `mode`        | `"current" \| "select"`    | `"current"`  | `current`: each row is a button (or a link) that opens something, and the open one is marked current. `select`: a listbox, and the chosen row is selected. |
| `followFocus` | `boolean`                  | `false`      | Makes the row that focus moves to the current or selected one, so the arrow keys step through what is shown, as in a list of moves.                        |

<!-- props:end -->

`class`, `style` and attributes land on the list's root `div`. The rows are `div`s with roles rather than `ul` and `li`, so they can sit inside an `EVirtualList`.

Rows are `EListRow`s. For a row of several choices, such as a move number with a white and a black move, use [`ECellRow`](../CellRow/README.md): each cell is chosen on its own, the arrow keys step through cells, and the list is still one tab stop.

## Slots

| Slot      | Use                                                                    |
| --------- | ---------------------------------------------------------------------- |
| `default` | The `EListRow`s and `ECellRow`s, directly or inside an `EVirtualList`. |

## Events

| Event    | Payload          | Notes                                                                                                |
| -------- | ---------------- | ---------------------------------------------------------------------------------------------------- |
| `select` | `value: ListKey` | A row was chosen: pressed, or reached with the arrow keys when `followFocus`. Fires after `v-model`. |

## Accessibility

- `mode="current"` is a `list` of buttons (or links). The current row has `aria-current="true"`, drawn as the current place.
- `mode="select"` is a `listbox` of options. The chosen row has `aria-selected="true"`. An option cannot hold a control, so keep buttons out of its rows.
- The list is one tab stop: Tab lands on the row last focused, else the current row, else the first row, and the next Tab leaves the list.
- Moving focus chooses nothing unless `followFocus` is set. Use it where stepping through rows is the point, such as a list of moves, and leave it off where choosing a row loads something heavy.
- Unavailable rows are passed over by the arrow keys.

## Keyboard

| Key                     | Action                                                                                                         |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| Tab                     | Moves into the list, to its one tab stop, and out again.                                                       |
| Arrow Down, Arrow Up    | Moves to the next or previous available row; stops at either end. In a row of cells, stays in the same column. |
| Arrow Left, Arrow Right | In a row of cells, moves to the previous or next available cell.                                               |
| Home, End               | Moves to the first or last available row, rendered or not.                                                     |
| Enter, Space            | Makes the focused row the current or selected one.                                                             |

## Related

[`EListRow`](../ListRow/README.md), [`EVirtualList`](../VirtualList/README.md).
