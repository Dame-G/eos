# EBackLink

A link back to the previous page, with an arrow and words that name the destination. Place it above the page title; use `EBreadcrumb` for a deeper path.

```vue
<EBackLink href="/statements">Back to statements</EBackLink>
```

## Props

| Prop            | Type                  | Default | Notes                                                                                                          |
| --------------- | --------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| `href`          | `string`              | `#`     | Where it goes. For history, use `@click.prevent="router.back()"`.                                              |
| `linkComponent` | `string \| Component` | `a`     | What renders the link. Pass `RouterLink` with `to="/statements"`; other attributes and listeners pass through. |

`class`, `style` and attributes land on the link element. Hidden in print.

## Slots

| Slot      | Use                                                  |
| --------- | ---------------------------------------------------- |
| `default` | The words; name the destination. Defaults to "Back". |

## Accessibility

- A link: name the destination so it makes sense out of context.
- Use one per page.
