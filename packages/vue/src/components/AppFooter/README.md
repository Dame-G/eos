# EAppFooter

The bottom of the page: small print, privacy and terms links, contact. Put it in the `footer` slot of [`EAppShell`](../AppShell/README.md).

```vue
<EAppFooter>
  <p>© 2026 Acme</p>
  <a href="/privacy">Privacy</a>
</EAppFooter>
```

`class`, `style` and attributes land on the `footer` element.

## Slots

| Slot      | Use                                                                                                                                                                                |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default` | The content, held to the page's 72rem column. The first item stays at the start. Everything after it is grouped at the end of the row. Put links in a `nav` to keep them together. |

## Accessibility

- Renders the `contentinfo` landmark: use one per page, last, in the `footer` slot of `EAppShell`.
- No primary actions here.

Not focusable.

## Related

[`EAppHeader`](../AppHeader/README.md) is the bar at the top.
