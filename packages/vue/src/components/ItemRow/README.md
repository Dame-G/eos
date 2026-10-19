# EItemRow

A single line for a form, receipt or document, with optional icon, status stamp and action. Use `EStatementRow` for a row that opens to a card.

```vue
<EItemList>
  <EItemRow icon="form" title="New client form" subtitle="Due Oct 22" status="action">
    <template #action><EButton variant="outline">Review and sign</EButton></template>
  </EItemRow>
</EItemList>
```

## Props

| Prop       | Type          | Default | Notes                                                    |
| ---------- | ------------- | ------- | -------------------------------------------------------- |
| `title`    | `string`      |         | Required.                                                |
| `subtitle` | `string`      |         | Under the title, such as when it is due.                 |
| `icon`     | `IconProp`    |         | Icon in a tile before the title.                         |
| `status`   | `StampStatus` |         | Stamp preset (tone, word and glyph).                     |
| `tone`     | `StampTone`   |         | Overrides the status's tone.                             |
| `label`    | `string`      |         | Overrides the stamp's word; on its own it shows a stamp. |

`class`, `style`, `id` and listeners land on the row `div`. Use several rows inside an `EItemList` so columns match; a lone row wraps itself in one.

## Slots

| Slot     | Use                            |
| -------- | ------------------------------ |
| `action` | An `EButton` or `EIconButton`. |

## Accessibility

- The row is `role="listitem"` inside the `role="list"` of `EItemList`, so a screen reader announces the position and number of rows.
- The title is a paragraph, not a heading. Put a heading above the list if the section needs one.
- The status stamp is a `role="img"` with the word as its name, so the status is read as text and never depends on colour or glyph alone.
- When several rows share one verb ("Sign"), make each button's name unique, for example with `aria-label="Sign New client form"`.
