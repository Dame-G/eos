# EItemRow

A single line for a form, receipt or document.

```vue
<EItemList>
  <EItemRow icon="form" title="New client form" subtitle="Due Oct 22" status="action">
    <template #action><EButton variant="outline">Review and sign</EButton></template>
  </EItemRow>
</EItemList>
```

## Props

| Prop            | Type                  | Notes                                                               |
| --------------- | --------------------- | ------------------------------------------------------------------- |
| `title`         | `string`              | Required.                                                           |
| `subtitle`      | `string`              | Under the title, such as when it is due.                            |
| `icon`          | `IconProp`            | An icon name or component, in a tile before the title.              |
| `status`        | `StampStatus`         | A preset for the stamp. Or give `tone` and `label`.                 |
| `tone`, `label` | `StampTone`, `string` | Override the status's tone and word. A `label` alone shows a stamp. |

## Slots

| Slot     | Use                        |
| -------- | -------------------------- |
| `action` | An EButton or EIconButton. |

`class`, `style`, `id` and listeners fall through to the row, not to the list that wraps a lone row.

## Layout

Where the status goes depends on the width of the list, not the screen. At 36rem or more the status sits in its own column before the action, so the title keeps a clean line. Below that it moves under the subtitle, and a text Button drops to its own line under it; an IconButton stays at the end of the row.

## Rules

- Show several rows inside an EItemList so the columns match between rows. A lone EItemRow wraps itself in a list (it asks, through provide and inject, whether it already has one).
- Use EStatementRow when a row should open to a card.
- In print each row is a ruled line that does not break across pages.
