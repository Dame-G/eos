# AeKicker

The small uppercase mono label above a value or a section, in the muted colour.

```vue
<AeKicker>Balance</AeKicker>
```

## Props

| Prop | Type     | Default | Notes                                         |
| ---- | -------- | ------- | --------------------------------------------- |
| `as` | `string` | `"p"`   | The element, if it should not be a paragraph. |

## Slots

| Slot      | What            |
| --------- | --------------- |
| `default` | The label text. |

Native attributes land on the rendered element. The styles are the shared `.ae-kicker` class in `styles/base.css`, so the component has no CSS of its own.

## Rules

- It is a label, not a heading: use Heading for the title that follows.
- Write sentence case; the class sets it in capitals.
