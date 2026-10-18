# EBackLink

A link back to the previous page: an arrow, then words that name the destination ("Back to statements", not "Back"). It sits above the page title. The arrow mirrors in right-to-left text.

```vue
<EBackLink href="/statements">Back to statements</EBackLink>
```

## Props and slots

| Prop            | Type                  | Default | Notes                                                    |
| --------------- | --------------------- | ------- | -------------------------------------------------------- |
| `href`          | `string`              | `#`     | Where it goes.                                           |
| `linkComponent` | `string \| Component` | `"a"`   | What renders the link. Pass `RouterLink` for vue-router. |

The default slot is the text; it defaults to "Back" (message `back`). Other attributes and listeners (`@click`, `class`, `to`) go to the rendered link.

## Router usage

```vue
<EBackLink :link-component="RouterLink" to="/statements">Back to statements</EBackLink>
```

`to` (and any other attribute) is passed to `RouterLink`; no `href` is set over the one it computes. For a "go back in history" link, use `href` and `@click.prevent="router.back()"`.

## Accessibility

- A real link, 48px tall, with the standard focus ring. The arrow is decorative.
- Name the destination so the link makes sense out of context in a list of links.
- It is hidden when printed.

## Rules

- One per page, above the title (inside the page, not in the header).
- Not a replacement for the breadcrumb; use it on pages you reach from a single place.
