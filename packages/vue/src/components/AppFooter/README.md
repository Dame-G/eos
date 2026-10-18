# EAppFooter

The bottom of the page: small print, privacy and terms links, contact. It is the `contentinfo` landmark, so keep it to links people expect there.

```vue
<EAppFooter>
  <p>© 2026 OpenPractice</p>
  <a href="/privacy">Privacy</a>
</EAppFooter>
```

## Slots

| Slot    | Holds                                         |
| ------- | --------------------------------------------- |
| default | The content, held to the page's 72rem column. |

`class`, `style` and attributes fall through to the `footer`.

## Accessibility

- A `footer` that is not inside a section is the `contentinfo` landmark. Use one per page.
- Text is the muted colour at the small size; links inside it follow the normal link rules.

## Rules

- No primary actions here. Put it last, in an EAppShell's `footer` slot.
