# ETree

A keyboard-navigable list of rows that fold into groups, with one selected row, such as a test whose games open under it. Use [`EList`](../List/README.md) when rows do not nest, and [`ENavList`](../NavList/README.md) for site navigation with groups.

```vue
<ETree
  v-model="openGame"
  v-model:expanded="openTests"
  label="Games"
  :items="[
    { id: 'g1', label: 'You – Dameless', description: '5+3 · live' },
    {
      id: 'lmr',
      label: 'deeper-lmr vs v14',
      description: '412 pairs',
      children: [{ id: 'lmr-1', label: 'Game 1', description: '1–0' }],
    },
  ]"
/>
```

## Props

<!-- props:start -->

| Prop         | Type             | Default      | Notes                                                                                      |
| ------------ | ---------------- | ------------ | ------------------------------------------------------------------------------------------ |
| `modelValue` | `string \| null` | None         | `v-model`: the `id` of the selected node. Without a binding it keeps its own state.        |
| `expanded`   | `string[]`       | `[]`         | `v-model:expanded`: the `id`s of the open nodes. Without a binding it keeps its own state. |
| `items`      | `TreeNode[]`     | **Required** | The nodes at the top level, each with its `children`.                                      |
| `label`      | `string`         | **Required** | The tree's accessible name, such as "Games".                                               |

<!-- props:end -->

A node is `{ id, label, description?, children?, disabled? }` (`TreeNode`). `class`, `style` and attributes land on the tree's `ul`. Its rows are drawn as [`EListRow`](../ListRow/README.md)s are.

## Slots

| Slot       | Use                                                                                                     |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| `item`     | The lines of a row, instead of `label` and `description`. Scope: `{ item, level, expanded, selected }`. |
| `leading`  | Before the lines. Scope: `{ item, level }`.                                                             |
| `trailing` | At the end of a row, such as a count. Scope: `{ item, level }`. Keep it to text.                        |

## Events

| Event    | Payload      | Notes                                                                  |
| -------- | ------------ | ---------------------------------------------------------------------- |
| `select` | `id: string` | A node was chosen with a press, Enter or Space. Fires after `v-model`. |

## Accessibility

- A `tree` named by `label`, with a `treeitem` per row showing: `aria-level`, `aria-expanded` on a node with children, `aria-selected`, and `aria-disabled` on an unavailable one.
- The tree is one tab stop. Pressing a node with children selects it and opens or closes it.
- The selected row is drawn as the current place: the primary tint and edge, so colour is not the only cue.
- A tree item cannot hold a control, so keep buttons and links out of the slots.

## Keyboard

| Key                  | Action                                                                                       |
| -------------------- | -------------------------------------------------------------------------------------------- |
| Arrow Down, Arrow Up | Moves to the next or previous row showing, past unavailable ones.                            |
| Arrow Right          | Opens a closed node; on an open one, moves to its first child. Left in a right-to-left page. |
| Arrow Left           | Closes an open node; on a child, moves to its parent. Right in a right-to-left page.         |
| Home, End            | Moves to the first or last row showing.                                                      |
| Enter, Space         | Selects the focused row.                                                                     |

## Related

[`EList`](../List/README.md), [`EListRow`](../ListRow/README.md).
