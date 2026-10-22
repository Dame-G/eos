# EStamp

A small non-interactive mark with a word that says where something stands, such as paid or overdue. It also serves as a plain label: pass the word in the slot and a `tone`. Use a button for anything pressable.

```vue
<EStamp status="overdue" detail="12 days" />
<EStamp tone="warning" label="Review" icon="pin" small />
<EStamp tone="success">Paid</EStamp>
```

## Props

<!-- props:start -->

| Prop     | Type          | Default                      | Notes                                                                                                                                           |
| -------- | ------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `status` | `StampStatus` | None                         | A preset: sets the tone and the word (message `status.<name>`).                                                                                 |
| `tone`   | `StampTone`   | None                         | Overrides the preset's tone. Without a `status` the stamp is `neutral`, the same as `ink`. `success`, `info`, `warning` and `danger` colour it. |
| `label`  | `string`      | `preset's word, else Status` | The word. It overrides the preset's, and the default slot overrides both.                                                                       |
| `icon`   | `IconProp`    | None                         | A glyph before the word.                                                                                                                        |
| `detail` | `string`      | None                         | A date or day count, set after the word.                                                                                                        |
| `small`  | `boolean`     | `false`                      | Shorter, for rows and tables.                                                                                                                   |

<!-- props:end -->

Presets: `paid`, `confirmed`, `signed` and `complete` are success. `due`, `scheduled` and `pending` are info. `action` is warning. `overdue` and `cancelled` are danger. `class`, `style` and attributes land on the `span` element. Write the word in sentence case. The stamp sets it in capitals.

## Slots

| Slot      | Use                                         |
| --------- | ------------------------------------------- |
| `default` | The word, instead of `label` or the preset. |

## Accessibility

- A `span` of plain text, read in flow: the word (and detail) carry the meaning, colour only backs it up. It has no role, so the text is not flattened into an image label.
