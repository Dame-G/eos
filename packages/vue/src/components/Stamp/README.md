# EStamp

A flat, outlined mark with a glyph that says where something stands.

```vue
<EStamp status="overdue" detail="12 days" />
<EStamp tone="warning" label="Review" icon="pin" small />
```

## Props

| Prop     | Type                                                                                                                           | Default                      | Notes                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- | --------------------------------------------------------------------------------------- |
| `status` | `"paid" \| "due" \| "overdue" \| "action" \| "scheduled" \| "confirmed" \| "cancelled" \| "signed" \| "pending" \| "complete"` | none                         | A preset: sets the tone, the word (message `status.<name>`) and the glyph.              |
| `tone`   | `"success" \| "info" \| "warning" \| "danger"`                                                                                 | preset's, else `info`        | Overrides the preset's tone.                                                            |
| `label`  | `string`                                                                                                                       | preset's word, else "Status" | Overrides the word.                                                                     |
| `icon`   | `IconName`                                                                                                                     | preset's, else by tone       | Overrides the glyph. By tone: info `info`, success `check`, warning and danger `alert`. |
| `detail` | `string`                                                                                                                       | none                         | A date or day count after the word.                                                     |
| `small`  | `boolean`                                                                                                                      | unset                        | For rows.                                                                               |

| Preset      | Tone    | Glyph      |
| ----------- | ------- | ---------- |
| `paid`      | success | `check`    |
| `due`       | info    | `clock`    |
| `overdue`   | danger  | `alert`    |
| `action`    | warning | `alert`    |
| `scheduled` | info    | `calendar` |
| `confirmed` | success | `check`    |
| `cancelled` | danger  | `x`        |
| `signed`    | success | `check`    |
| `pending`   | info    | `clock`    |
| `complete`  | success | `check`    |

No slots. Native attributes land on the root `<div>`. The words are the messages `status.paid`, `status.due` and so on; override them with `createEos({ messages })`.

## Rules

- Success is green, information blue, needs-action amber, a problem red. The word and the glyph carry the meaning; colour backs them up.
- Stamps are not clickable, so they have no depth. A Button never has a glyph; a stamp always does.

## Accessibility

- The root is `role="img"` with `aria-label` of the word, plus `, detail` when there is one. The visible parts are not read separately.
