# EKbd

A keyboard key drawn as a small keycap, for a shortcut hint such as "Press / to search". Use [`EHighlight`](../Highlight/README.md) for other words set off in a sentence.

```vue
<ESearchBar label="Search" />
<p>Press <EKbd>/</EKbd> to search, <EKbd size="sm">Esc</EKbd> to close.</p>
```

## Props

<!-- props:start -->

| Prop    | Type           | Default | Notes                                 |
| ------- | -------------- | ------- | ------------------------------------- |
| `size`  | `"sm" \| "md"` | None    | `sm` is for a hint inside small text. |
| `small` | `boolean`      | `false` | **Deprecated.** Use `size="sm"`.      |

<!-- props:end -->

`class`, `style` and attributes land on the `kbd` element. `small` is deprecated: use `size="sm"`.

## Slots

| Slot      | Use                                                          |
| --------- | ------------------------------------------------------------ |
| `default` | The key, written as it is on the keycap: "/", "Esc", "Ctrl". |

## Accessibility

- It only describes a shortcut: the shortcut must work and be named elsewhere, for example with `aria-keyshortcuts` on the control.
- Add `aria-hidden="true"` when a nearby control already announces the shortcut.

Not focusable.

## Related

`formatShortcut` in the composables gives the keycaps for a shortcut; [`EHighlight`](../Highlight/README.md) marks code in a sentence.
