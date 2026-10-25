# EExpandableRow

A one-line row that opens to more: a leading item, a title with a subtitle, and a value at the end. Use it for lists where each entry has a short summary and a longer body. For a section inside a page use [`EDisclosure`](../Disclosure/README.md).

```vue
<EExpandableRow title="Lab work" subtitle="Oct 3, 2026">
  <template #leading><EStamp status="paid" size="sm" /></template>
  <template #trailing>$42.40</template>
  Blood panel and urinalysis.
  <template #actions><EButton>Download</EButton></template>
</EExpandableRow>
```

## Props

<!-- props:start -->

| Prop       | Type      | Default      | Notes                                                                          |
| ---------- | --------- | ------------ | ------------------------------------------------------------------------------ |
| `open`     | `boolean` | `false`      | `v-model:open`: whether it is open. Without a binding it keeps its own state.  |
| `title`    | `string`  | **Required** | The row's name, always visible in the summary.                                 |
| `subtitle` | `string`  | None         | A muted line under the title.                                                  |
| `group`    | `string`  | None         | Rows that share a `group` open one at a time (the native `name` of `details`). |
| `disabled` | `boolean` | `false`      | Keeps it as it is: the row shows it is unavailable and no longer toggles.      |

<!-- props:end -->

`class`, `style` and attributes land on the `details` element. A chevron after the value shows whether the row is open. Opening and closing slide where the browser can animate the height, and switch at once under reduced motion.

Rows in a list line their leading items up when the lead column has a fixed width: set `--e-xrow-lead` (for example `8.75rem`) on the rows or their parent.

## Slots

| Slot       | Use                                                           |
| ---------- | ------------------------------------------------------------- |
| `leading`  | Before the title, such as an `EStamp`.                        |
| `trailing` | The value at the end, such as an amount.                      |
| `default`  | What the row opens to.                                        |
| `actions`  | Buttons for the foot of the opened row, in an `EActions` bar. |

## Accessibility

- A native `details` with a `summary`, so the open state is announced.
- `disabled` sets `aria-disabled="true"` on the summary: it stays focusable, is dimmed and does not toggle.
- The summary holds only the title, subtitle, leading and trailing content, all as text (`span`s), because a summary may not contain a button or link. Put interactive controls in the body or the `actions` slot.
- In print a closed row prints open, without its chevron, and is not split across pages.

## Keyboard

| Key          | Action                                           |
| ------------ | ------------------------------------------------ |
| Tab          | Moves to the summary, then into the opened body. |
| Enter, Space | Opens or closes the focused row.                 |

## Related

[`ETable`](../Table/README.md) for rows with columns.
