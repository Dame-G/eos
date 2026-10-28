# ECellRow

A row of a number and several cells that are chosen on their own, such as a move number with a white and a black move, inside an [`EList`](../List/README.md). Use [`EListRow`](../ListRow/README.md) when a row is one choice.

```vue
<EList v-model="ply" label="Moves" follow-focus>
  <EVirtualList :items="moves" :row-height="48" item-key="n">
    <template #default="{ item }">
      <ECellRow
        :label="item.n"
        :columns="2"
        :cells="[
          { value: item.n + 'w', label: item.white },
          { value: item.n + 'b', label: item.black, disabled: !item.black },
        ]"
      />
    </template>
  </EVirtualList>
</EList>
```

## Props

<!-- props:start -->

| Prop      | Type                     | Default               | Notes                                                                                                                |
| --------- | ------------------------ | --------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `label`   | `string`                 | None                  | The number or name that starts the row, such as "12." in a list of moves. It is part of each cell's accessible name. |
| `cells`   | `readonly CellRowCell[]` | **Required**          | The cells, in order. Each is chosen on its own.                                                                      |
| `columns` | `number`                 | `the number of cells` | How many columns the row keeps, so a row with fewer cells (a game's last move) lines up with the rest.               |

<!-- props:end -->

A cell is `{ value, label, name?, disabled? }` (`CellRowCell`). The list's `v-model` is the `value` of the current or selected cell, so values are unique across the whole list. `class`, `style` and attributes land on the row's wrapper `div`; the cells are `button`s or, in a `select` list, options.

## Slots

| Slot   | Use                                                                         |
| ------ | --------------------------------------------------------------------------- |
| `cell` | A cell's content, instead of its `label`. Scope: `{ cell, index, chosen }`. |

## Accessibility

- Each cell is named by the row's `label` and its own text ("12. Nf3"), or by its `name`. The number itself is hidden from screen readers, so it is not read twice.
- In a `current` list the chosen cell has `aria-current="true"`; in a `select` list the cells are options and the chosen one has `aria-selected="true"`.
- The whole list is one tab stop. Tab lands on the cell last focused, else the chosen one, else the first.
- `columns` keeps a short row (a game's last move) in the same columns as the rest.
- It works in an `EVirtualList`: the arrow keys, Home and End reach rows that are not rendered yet.

## Keyboard

| Key                     | Action                                                                                        |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| Arrow Left, Arrow Right | Moves to the previous or next available cell in the row (flipped in a right-to-left page).    |
| Arrow Down, Arrow Up    | Moves to the same column in the next or previous row, settling on the nearest available cell. |
| Home, End               | Moves to the first or last row.                                                               |
| Enter, Space            | Makes the focused cell the chosen one. With `follow-focus` on the list, moving focus does so. |

## Related

[`EList`](../List/README.md), [`EListRow`](../ListRow/README.md), [`EVirtualList`](../VirtualList/README.md).
