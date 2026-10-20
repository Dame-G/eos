# EText

Running text in three sizes (body, `small`, `large`), capped at a readable line length.

```vue
<EText large>You paid in full on 3 September.</EText>
<EText small muted>Receipts are kept for seven years.</EText>
```

## Props

<!-- props:start -->

| Prop    | Type      | Default | Notes                                              |
| ------- | --------- | ------- | -------------------------------------------------- |
| `small` | `boolean` | `false` | 14px, for captions and fine print.                 |
| `large` | `boolean` | `false` | 18px, for the one-sentence reading of a statement. |
| `muted` | `boolean` | `false` | Secondary copy, in the muted colour.               |
| `as`    | `string`  | `"p"`   | The element to render.                             |

<!-- props:end -->

`class`, `style` and attributes land on the rendered element. The line length is the `--e-measure` token.

## Slots

| Slot      | Use       |
| --------- | --------- |
| `default` | The text. |

## Accessibility

- Muted text meets contrast but should not carry anything a person must act on.
