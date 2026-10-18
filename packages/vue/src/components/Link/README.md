# AeLink

An inline anchor. `primary` with an underline, `ink` on hover.

```vue
<AeLink href="/statements">All statements</AeLink>
<AeLink href="https://example.com/help" external>Help centre</AeLink>
```

## Props

| Prop       | Type      | Default | Notes                                                       |
| ---------- | --------- | ------- | ----------------------------------------------------------- |
| `href`     | `string`  | none    | Where the link goes. Required.                              |
| `external` | `boolean` | unset   | Opens in a new tab (`target="_blank"`, `rel="noreferrer"`). |

## Slots

| Slot      | What                              |
| --------- | --------------------------------- |
| `default` | The link text: say where it goes. |

Native attributes and listeners (`@click`, `aria-*`, `download`, `hreflang`) land on the `<a>`.

## Rules

- Links go somewhere; things that change something are Buttons.
- A dotted underline belongs to a Popover term, not to a link.
- When printed, the address is written after the link text.

## Accessibility

- A real `<a href>`: Tab focuses it, Enter follows it, and it has the focus ring.
- An external link opens a new tab; say so in the text where it would surprise people.
