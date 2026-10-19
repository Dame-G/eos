# EStamp

A flat outlined mark with a glyph and word that says where something stands, such as paid or overdue.

```vue
<EStamp status="overdue" detail="12 days" />
<EStamp tone="warning" label="Review" icon="pin" small />
```

## Props

| Prop      | Type                                                                                                                           | Default                      | Notes                                                                                                     |
| --------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| `status`  | `"paid" \| "due" \| "overdue" \| "action" \| "scheduled" \| "confirmed" \| "cancelled" \| "signed" \| "pending" \| "complete"` |                              | Preset tone, word (message `status.<name>`) and icon.                                                     |
| `tone`    | `"success" \| "info" \| "warning" \| "danger"`                                                                                 | preset's, else `info`        | Overrides the preset's tone.                                                                              |
| `label`   | `string`                                                                                                                       | preset's word, else `Status` | Overrides the word.                                                                                       |
| `icon`    | `IconProp`                                                                                                                     | preset's, else by tone       | Overrides the icon.                                                                                       |
| `detail`  | `string`                                                                                                                       |                              | A date or day count after the word.                                                                       |
| `small`   | `boolean`                                                                                                                      |                              | For rows.                                                                                                 |
| `variant` | `"solid" \| "subtle"`                                                                                                          | `solid`                      | `solid` is a filled badge with light text; `subtle` is a soft tint with a tone-coloured outline and text. |

Presets: `paid`, `confirmed`, `signed` and `complete` are success; `due`, `scheduled` and `pending` are info; `action` is warning; `overdue` and `cancelled` are danger. `class`, `style` and attributes land on the `div` element.

## Accessibility

- The root is `role="img"` labelled with the word, plus the detail when given.
