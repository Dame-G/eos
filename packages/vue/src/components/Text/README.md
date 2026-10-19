# EText

Running text in three sizes, capped at a readable line length.

```vue
<EText variant="deck">You paid in full on 3 September.</EText>
<EText variant="small" muted>Receipts are kept for seven years.</EText>
```

## Props

| Prop      | Type                          | Default | Notes                                   |
| --------- | ----------------------------- | ------- | --------------------------------------- |
| `variant` | `"body" \| "deck" \| "small"` | `body`  | `body` 16px, `deck` 18px, `small` 14px. |
| `muted`   | `boolean`                     |         | Secondary copy in the muted colour.     |
| `as`      | `string`                      | `p`     | The element to render.                  |

`class`, `style` and attributes land on the rendered element. The line length is the `--e-measure` token.

## Slots

| Slot      | Use       |
| --------- | --------- |
| `default` | The text. |

## Accessibility

- Muted text meets contrast but should not carry anything a person must act on.
