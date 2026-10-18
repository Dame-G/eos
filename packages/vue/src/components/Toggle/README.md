# AeToggle

A button with two states, pressed and not: a filter, a view option. For settings that save, use `AeSwitch`.

```vue
<AeToggle v-model="unpaid" icon="filter">Unpaid only</AeToggle>
```

## Props

| Prop       | Type      | Notes                                                |
| ---------- | --------- | ---------------------------------------------------- |
| `v-model`  | `boolean` | Whether it is pressed. Leave it off for local state. |
| `icon`     | `string`  | An icon before the label.                            |
| `disabled` | `boolean` |                                                      |

Slot: the label (default).

All attributes and listeners (`@click`, `aria-*`, `class`) land on the `<button>`.

## Rules

- The state is exposed with `aria-pressed` and shown with a filled tint and a heavier edge, not colour alone. Forced colours use `Highlight`.
- Keep the label the same in both states: it names the option, not the state.
- It is an `outline` `AeButton` (`ae-btn ae-btn--outline ae-toggle`), 48px tall. Group several in an `AeButtonGroup`.
