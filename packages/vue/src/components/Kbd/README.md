# EKbd

A keyboard key drawn as a small keycap, for a shortcut hint such as "Press / to search".

```vue
<ESearchBar label="Search" />
<p>Press <EKbd>/</EKbd> to search, <EKbd small>Esc</EKbd> to close.</p>
```

## Props

<!-- props:start -->

| Prop    | Type      | Default | Notes                                                |
| ------- | --------- | ------- | ---------------------------------------------------- |
| `small` | `boolean` | `false` | Makes the key smaller, for a hint inside small text. |

<!-- props:end -->

`class`, `style` and attributes land on the `kbd` element.

## Slots

| Slot      | Use                                                          |
| --------- | ------------------------------------------------------------ |
| `default` | The key, written as it is on the keycap: "/", "Esc", "Ctrl". |

## Accessibility

- It only describes a shortcut: the shortcut must work and be named elsewhere, for example with `aria-keyshortcuts` on the control.
- Add `aria-hidden="true"` when a nearby control already announces the shortcut.
