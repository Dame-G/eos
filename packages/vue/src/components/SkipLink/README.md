# ESkipLink

A link, hidden until focused, that lets keyboard users jump past navigation to the main content. `EAppShell` renders one.

```vue
<ESkipLink />
<!-- header, navigation -->
<main id="main" tabindex="-1">...</main>
```

## Props

| Prop   | Type     | Default | Notes                                                   |
| ------ | -------- | ------- | ------------------------------------------------------- |
| `href` | `string` | `#main` | The in-page target; must match the main content's `id`. |

`class`, `style` and attributes land on the `a` element.

## Slots

| Slot      | Use                                           |
| --------- | --------------------------------------------- |
| `default` | The text; defaults to "Skip to main content". |

## Accessibility

- Make it the first tab stop on the page, one per page.
- Give the target `tabindex="-1"` so it can take focus; the link moves focus there on click.
- Do not hide it with `display: none` or `visibility: hidden`; that removes it from the tab order.
