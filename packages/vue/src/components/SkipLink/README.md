# ESkipLink

The first focusable thing on every page. It stays out of sight until a keyboard user focuses it, then lets them jump past the navigation to the content (WCAG 2.4.1). EAppShell renders one for you.

```vue
<ESkipLink />
<!-- header, navigation -->
<main id="main" tabindex="-1">...</main>
```

## Props and slots

| Prop   | Type     | Default | Notes                                                   |
| ------ | -------- | ------- | ------------------------------------------------------- |
| `href` | `string` | `#main` | The in-page target; it must match the `id` of the main. |

The default slot is the text; it defaults to "Skip to main content" (message `skipToMain`). `class`, `style` and attributes fall through to the link.

## Accessibility

- It must be the first tab stop on the page, and the target must be able to take focus: give it `tabindex="-1"`. On click it also moves focus to the target, which not every browser does for a target that is not a control.
- It is positioned above the viewport until focused, then drops in at the top with the focus ring. It is hidden when printed.
- It is a plain in-page anchor, so it needs no router integration.

## Rules

- One per page, before everything else.
- Do not hide it with `display: none` or `visibility: hidden`; that removes it from the tab order.
