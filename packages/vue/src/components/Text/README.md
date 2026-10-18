# EText

Running text in three sizes, capped at 62 characters wide.

```vue
<EText variant="deck">You paid in full on 3 September.</EText>
<EText variant="small" muted>Receipts are kept for seven years.</EText>
```

## Props

| Prop      | Type                          | Default  | Notes                                                                               |
| --------- | ----------------------------- | -------- | ----------------------------------------------------------------------------------- |
| `variant` | `"body" \| "deck" \| "small"` | `"body"` | `body` 16px, `deck` 18px for the one-sentence reading of a statement, `small` 14px. |
| `muted`   | `boolean`                     | unset    | Secondary copy, in the muted colour.                                                |
| `as`      | `string`                      | `"p"`    | The element to render.                                                              |

## Slots

| Slot      | What      |
| --------- | --------- |
| `default` | The text. |

Native attributes land on the rendered element.

## Rules

- The measure is a token (`--e-measure`), so a theme can change it.
- Muted text still meets contrast; do not use it for anything a person must act on.
