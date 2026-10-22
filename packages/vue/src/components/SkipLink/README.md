# ESkipLink

A link, hidden until focused, that lets keyboard users jump past navigation to the main content. [`EAppShell`](../AppShell/README.md) renders one.

```vue
<ESkipLink />
<!-- header, navigation -->
<main id="main" tabindex="-1">...</main>
```

## Props

<!-- props:start -->

| Prop   | Type     | Default   | Notes                                                           |
| ------ | -------- | --------- | --------------------------------------------------------------- |
| `href` | `string` | `"#main"` | The in-page target. It must match the `id` of the main content. |

<!-- props:end -->

`class`, `style` and attributes land on the `a` element.

## Slots

| Slot      | Use            |
| --------- | -------------- |
| `default` | The link text. |

## Accessibility

- Make it the first tab stop on the page. Use one per page.
- Give the target `tabindex="-1"` so it can take focus. The link moves focus there on click.
- Do not hide it with `display: none` or `visibility: hidden`, which remove it from the tab order.
