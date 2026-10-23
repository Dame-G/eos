# EStamp

A small non-interactive mark with a word that says where something stands, such as paid or overdue. Like a notice, it is a soft tint of its tone with an edge in that tone and a thick side on its inline-start edge. It also serves as a plain label: pass the word in the slot and a `tone`. Use [`ETag`](../Tag/README.md) for a label that categorises or can be removed, and a button for anything pressable.

```vue
<EStamp status="overdue" detail="12 days" />
<EStamp tone="warning" label="Review" icon="pin" size="sm" />
<EStamp tone="success">Paid</EStamp>
```

## Props

<!-- props:start -->

| Prop     | Type                                                                                                                           | Default                      | Notes                                                                                                                                                            |
| -------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `status` | `"paid" \| "due" \| "overdue" \| "action" \| "scheduled" \| "confirmed" \| "cancelled" \| "signed" \| "pending" \| "complete"` | None                         | A preset: sets the tone and the word (message `status.<name>`).                                                                                                  |
| `tone`   | `"neutral" \| "info" \| "success" \| "warning" \| "danger" \| "ink"`                                                           | None                         | Overrides the preset's tone. Without a `status` the stamp is `neutral` (`ink` is a deprecated name for it). `success`, `info`, `warning` and `danger` colour it. |
| `label`  | `string`                                                                                                                       | `preset's word, else Status` | The word. It overrides the preset's, and the default slot overrides both.                                                                                        |
| `icon`   | `IconProp`                                                                                                                     | None                         | A glyph before the word.                                                                                                                                         |
| `detail` | `string`                                                                                                                       | None                         | A date or day count, set after the word.                                                                                                                         |
| `size`   | `"sm" \| "md"`                                                                                                                 | None                         | `sm` is shorter, for rows and tables.                                                                                                                            |
| `final`  | `boolean`                                                                                                                      | `false`                      | Rubber-stamp ink for the one mark on a page that says a thing is final, such as PAID or VOID. Outlined, in `stamp-ink`. Use it once per screen.                  |
| `small`  | `boolean`                                                                                                                      | `false`                      | **Deprecated.** Use `size="sm"`.                                                                                                                                 |

<!-- props:end -->

Presets: `paid`, `confirmed`, `signed` and `complete` are success. `due`, `scheduled` and `pending` are info. `action` is warning. `overdue` and `cancelled` are danger. `class`, `style` and attributes land on the `span` element. The stamp places nothing itself: it stretches in a grid, so give the parent `align="start"` (or `justify-items: start`) to keep it to its width. `size="sm"` is the shorter stamp (`small` is deprecated). `tone="ink"` is a deprecated name for `neutral`. Write the word in sentence case. The stamp sets it in capitals.

## Slots

| Slot      | Use                                         |
| --------- | ------------------------------------------- |
| `default` | The word, instead of `label` or the preset. |

## Accessibility

- A `span` of plain text, read in flow: the word (and detail) carry the meaning, colour only backs it up. It has no role, so the text is not flattened into an image label.
- `final` is for the one mark on a page that says a thing is final. It draws an outline in the stamp ink instead of a fill, so use it once per screen.

Not focusable.

## Related

[`ENotice`](../Notice/README.md) for a message that needs a sentence, [`EButton`](../Button/README.md) for anything pressable.
