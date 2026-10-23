# EAppHeader

The bar across the top of the page, with logo, actions and a navigation row that wraps its links when they do not fit.

```vue
<EAppHeader sticky>
  <template #logo><RouterLink to="/">Acme</RouterLink></template>
  <template #actions><EButton variant="outline" icon="user">Maria</EButton></template>
  <ENavList label="Main" orientation="horizontal" :link-component="RouterLink" :items="items" />
</EAppHeader>
```

## Props

<!-- props:start -->

| Prop        | Type      | Default | Notes                                                                                                                                                                        |
| ----------- | --------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `navOpen`   | `boolean` | `false` | `v-model:navOpen`: whether the navigation the menu button opens is open. It is the `aria-expanded` of the button. Inside an `EAppShell` the shell keeps it.                  |
| `sticky`    | `boolean` | `false` | Pins the header to the top while the page scrolls.                                                                                                                           |
| `navToggle` | `boolean` | `false` | Shows a menu button before the logo, for a navigation that opens on demand. Inside an `EAppShell` it shows by itself while the sidebar is in a drawer, so you do not set it. |

<!-- props:end -->

`class`, `style` and attributes land on the `header` element. `navToggle` adds a menu button before the logo and `v-model:navOpen` holds its `aria-expanded` state. Inside an [`EAppShell`](../AppShell/README.md) the button appears by itself while the sidebar is in a drawer.

## Slots

| Slot      | Use                                                                             |
| --------- | ------------------------------------------------------------------------------- |
| `logo`    | The logo or name. Link it to the home page. Render your own `RouterLink`.       |
| `actions` | The person's menu or sign-in button, at the end of the bar. Keep to one or two. |
| `default` | The navigation, such as an `ENavList`, on its own row. Omit for no second row.  |

## Accessibility

- Renders the `banner` landmark: use one per page.
- Give the navigation a `label` (on `ENavList`) so it differs from other navigations.
- The navigation row and the menu button are hidden in print.
- The menu button is named "Menu" (message `menu`) and carries `aria-expanded`.

## Keyboard

The menu button (when shown), the logo, the actions and the navigation links are reached with Tab in that order. Enter or Space on the menu button toggles `navOpen`.

## Related

[`ENavList`](../NavList/README.md) for the navigation inside it, [`EAppShell`](../AppShell/README.md) for the whole page frame.
