# EExpandableRow

A one-line row that opens to more: a leading item, a title with a subtitle, and a value at the end. Use it for lists where each entry has a short summary and a longer body. For a section inside a page use [`EDisclosure`](../Disclosure/README.md).

```vue
<EExpandableRow title="Lab work" subtitle="Oct 3, 2026">
  <template #leading><EStamp status="paid" small /></template>
  <template #trailing>$42.40</template>
  Blood panel and urinalysis.
  <template #actions><EButton>Download</EButton></template>
</EExpandableRow>
```

## Props

<!-- props:start -->

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `title` | `string` | **Required** | The row's name, always visible in the summary. |
| `subtitle` | `string` | None | A muted line under the title. |

<!-- props:end -->

`class`, `style` and attributes land on the `details` element. `open` starts it open, and rows that share a `name` open one at a time.

Rows in a list line their leading items up when the lead column has a fixed width: set `--e-xrow-lead` (for example `8.75rem`) on the rows or their parent.

## Slots

| Slot       | Use                                                           |
| ---------- | ------------------------------------------------------------- |
| `leading`  | Before the title, such as an `EStamp`.                        |
| `trailing` | The value at the end, such as an amount.                      |
| `default`  | What the row opens to.                                        |
| `actions`  | Buttons for the foot of the opened row, in an `EActions` bar. |

## Accessibility

- A native `details` with a `summary`. Tab focuses the summary, and Enter or Space toggles it.
- The summary holds only the title, subtitle, leading and trailing content. Put interactive controls in the body.
