# EListRow

A dense row of one or two lines, with room before and after, that is one choice in an [`EList`](../List/README.md). Use [`EExpandableRow`](../ExpandableRow/README.md) for a row that opens in place, and [`ETree`](../Tree/README.md) for rows that nest.

```vue
<EList v-model="openGame" label="Games">
  <EListRow value="g1" subtitle="5+3 · rated · 2 min ago" live>
    <template #title>You – Dameless</template>
    <template #trailing>1–0</template>
  </EListRow>
</EList>
```

## Props

<!-- props:start -->

| Prop            | Type                                           | Default      | Notes                                                                                                                                                                                                                                                                                 |
| --------------- | ---------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`         | `string \| number`                             | **Required** | What names the row in its `EList`: the list's `v-model` is the `value` of the current or selected row. Unique in the list.                                                                                                                                                            |
| `title`         | `string`                                       | None         | The first line, in the row's own weight. The `title` slot replaces it.                                                                                                                                                                                                                |
| `subtitle`      | `string`                                       | None         | A muted second line, such as when and how long. The `subtitle` slot replaces it.                                                                                                                                                                                                      |
| `href`          | `string`                                       | None         | Where the row goes, in a `current` list. Give `href` or, with a `linkComponent`, `to`; the row is then a link instead of a button.                                                                                                                                                    |
| `to`            | `unknown`                                      | None         | A router location, passed to `linkComponent` as `to` (for `RouterLink`). Use it instead of `href`.                                                                                                                                                                                    |
| `linkComponent` | `string \| Component`                          | `"a"`        | What renders a row that links: `RouterLink` or any component that takes `href` or `to` and a default slot.                                                                                                                                                                            |
| `live`          | `boolean`                                      | None         | Marks the row as happening now, with a pulsing dot before the title and "Live" for screen readers. The `live` slot replaces the dot. Passing it at all, even as `false`, reserves the dot's place before the title and the subtitle, so the titles of live and finished rows line up. |
| `liveTone`      | `"success" \| "danger" \| "warning" \| "info"` | `"success"`  | The colour of the live dot: `success` (green), `danger` (red), `warning` or `info`.                                                                                                                                                                                                   |
| `expanded`      | `boolean`                                      | None         | Whether what the row opens is open, for a row that expands something. Sets `aria-expanded` on the row's own button or link, not on its wrapper.                                                                                                                                       |
| `trailingStack` | `boolean`                                      | `false`      | Stacks what the `trailing` slot holds, end-aligned, one child under another: a score over a time. The second line is set smaller and muted.                                                                                                                                           |
| `disabled`      | `boolean`                                      | `false`      | Keeps it in the list but unavailable: it dims and no longer answers.                                                                                                                                                                                                                  |

<!-- props:end -->

`class`, `style` and attributes land on the row's wrapper `div`. The row itself is a `button`, an `a` (with `href` or `to`) or, in a `select` list, an option.

## Slots

| Slot       | Use                                                                                 |
| ---------- | ----------------------------------------------------------------------------------- |
| `title`    | The first line, instead of `title`, for richer text such as two names and a result. |
| `subtitle` | The second line, instead of `subtitle`.                                             |
| `leading`  | Before the lines, such as an avatar, an icon or a stamp.                            |
| `trailing` | At the end, set in mono: a score, an amount. In a `select` list keep it to text.    |
| `live`     | A mark of your own for `live`, in place of the pulsing dot.                         |
| `actions`  | Buttons at the end of the row: Delete, a menu. They sit beside the row's button.    |

Pass `live` on every row of a list (`:live="game.live"`) and the dot's place is kept on the rows that are not live, so their titles and subtitles line up with the live ones. `liveTone` sets the dot's colour to a tone, such as `danger` for red. `trailingStack` stacks two children of the `trailing` slot, a score over a time. `expanded` sets `aria-expanded` on the row's button for a row that opens a panel.

The `actions` slot is drawn over the end of the row and is a sibling of its button, so the row stays valid HTML. The row's text stops short of it. Keep it to a few icon buttons; a `select` list does not show it, because an option cannot sit beside controls.

```vue
<EListRow value="g1" title="You – Dameless" subtitle="5+3 · rated" live live-tone="danger" trailing-stack>
  <template #trailing><span>1–0</span><span>2 min ago</span></template>
  <template #actions><EIconButton icon="trash" label="Delete game" size="xs" /></template>
</EListRow>
```

## Accessibility

- Its name is its text: the title, then the second line and what trails. Keep the title first and short.
- `live` adds "Live" before the title for screen readers. The dot stops pulsing under `prefers-reduced-motion`.
- Each line keeps to one line and ends in an ellipsis, so every row is the same height and a long name never widens the list.
- `disabled` sets `aria-disabled`, dims the text and stops the row answering; a disabled row that links is not a link.
- The row's content is inside a `button` or an option, so a control in another slot is invalid HTML. Put controls in `actions`.
- Arrow keys pressed on a control in `actions` stay with the control.

## Keyboard

| Key          | Action                                                                      |
| ------------ | --------------------------------------------------------------------------- |
| Enter, Space | Makes the row the current or selected one (Enter follows a row that links). |
| Arrows       | Move between rows: see [`EList`](../List/README.md).                        |

## Related

[`EList`](../List/README.md), [`EVirtualList`](../VirtualList/README.md).
