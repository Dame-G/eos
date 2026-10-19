# EKbd

A keyboard key drawn as a small keycap, for a shortcut hint such as "Press / to search".

```vue
<ESearchBar label="Search" />
<p>Press <EKbd>/</EKbd> to search, <EKbd small>Esc</EKbd> to close.</p>
```

## Props

| Prop    | Type      | Default | Notes                                                   |
| ------- | --------- | ------- | ------------------------------------------------------- |
| `small` | `boolean` |         | The smaller size, for a hint inside running small text. |

`class`, `style` and attributes land on the `kbd` element.

## Slots

| Slot      | Use                                                          |
| --------- | ------------------------------------------------------------ |
| `default` | The key, written as it is on the keycap: "/", "Esc", "Ctrl". |

## Accessibility

- A `kbd` element, which assistive technology reads as the key text.
- It describes a shortcut only; the shortcut itself must work and be named elsewhere, for example with `aria-keyshortcuts` on the control it triggers.
- When a nearby control already announces the shortcut, add `aria-hidden="true"` so it is not read twice.
- The muted text colour and a visible border give the keycap its shape without relying on colour; in forced-colors mode the border is drawn in the system text colour.
