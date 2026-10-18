# EAppHeader

The bar across the top of the page, the `banner` landmark. The navigation sits on its own row and scrolls sideways on a narrow screen rather than collapsing into a hidden menu, so every destination stays one tap away.

```vue
<EAppHeader sticky>
  <template #logo><RouterLink to="/">Acme</RouterLink></template>
  <template #actions><EButton variant="outline" icon="user">Maria</EButton></template>
  <ENavList label="Main" :link-component="RouterLink" :items="items" />
</EAppHeader>
```

## Props and slots

| Prop     | Type      | Notes                                       |
| -------- | --------- | ------------------------------------------- |
| `sticky` | `boolean` | Pins the header to the top while scrolling. |

| Slot      | Holds                                                                        |
| --------- | ---------------------------------------------------------------------------- |
| `logo`    | The logo or name, usually a link home.                                       |
| `actions` | The person's menu or a sign-in button, at the end of the bar.                |
| default   | The navigation, usually an `ENavList`. Omit it for a bar with no second row. |

`class`, `style` and attributes fall through to the `header`.

## Router usage

The header has no links of its own. The logo is yours (render a `RouterLink` in the `logo` slot) and the navigation is an `ENavList`, which takes `linkComponent` (see ENavList).

## Accessibility

- A `header` that is not inside a section is the `banner` landmark. Use one per page.
- Name the navigation inside it (`label` on ENavList) so it differs from other navigations.
- The nav row is a horizontal scroll area; its links are focusable, so it can be scrolled with the keyboard.
- The nav row is hidden when printed.

## Rules

- The bar is at least 64px tall. Content is held to the page's 72rem column.
- Keep the actions to one or two things.
