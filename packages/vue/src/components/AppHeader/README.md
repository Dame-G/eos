# EAppHeader

The bar across the top of the page, with logo, actions and a navigation row that wraps its links when they do not fit.

```vue
<EAppHeader sticky brand="Acme" brand-to="/" :link-component="RouterLink">
  <template #actions><EButton variant="outline" icon="user">Maria</EButton></template>
  <ENavList label="Main" orientation="horizontal" :link-component="RouterLink" :items="items" />
</EAppHeader>
```

## Props

<!-- props:start -->

| Prop            | Type                  | Default | Notes                                                                                                                                                                        |
| --------------- | --------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `navOpen`       | `boolean`             | `false` | `v-model:navOpen`: whether the navigation the menu button opens is open. It is the `aria-expanded` of the button. Inside an `EAppShell` the shell keeps it.                  |
| `sticky`        | `boolean`             | `false` | Pins the header to the top while the page scrolls. It stays above anything raised in the page (a sticky table head, a selected tab) and under every dialog, menu and toast.  |
| `navToggle`     | `boolean`             | `false` | Shows a menu button before the logo, for a navigation that opens on demand. Inside an `EAppShell` it shows by itself while the sidebar is in a drawer, so you do not set it. |
| `brand`         | `string`              | None    | The name of the site or app, drawn as a styled link to the home page at the start of the bar. The `brand` slot replaces the text (a logo).                                   |
| `brandHref`     | `string`              | `"/"`   | Where the brand link goes.                                                                                                                                                   |
| `brandTo`       | `unknown`             | None    | A router location for the brand link, passed to `linkComponent` as `to`. Use it instead of `brandHref`.                                                                      |
| `brandLabel`    | `string`              | None    | The brand link's name for screen readers, when the brand is a picture or needs more words ("Acme, home").                                                                    |
| `linkComponent` | `string \| Component` | `"a"`   | What renders the brand link: `RouterLink` or any component that takes `href` or `to` and a default slot.                                                                     |

<!-- props:end -->

`class`, `style` and attributes land on the `header` element. `brand` draws the site name as a styled link to the home page (`brandHref`, default `/`, or `brandTo` with a `linkComponent`): a tap target in the ink colour that takes the primary colour on hover. Put a logo in the `brand` slot instead of text, and name it with `brandLabel`. A sticky header stays above anything the page raises (a sticky table head, a selected tab, a focused control) and below every dialog, menu and toast. `navToggle` adds a menu button before the logo and `v-model:navOpen` holds its `aria-expanded` state. Inside an [`EAppShell`](../AppShell/README.md) the button appears by itself while the sidebar is in a drawer.

## Slots

| Slot      | Use                                                                                                                  |
| --------- | -------------------------------------------------------------------------------------------------------------------- |
| `brand`   | A logo inside the styled home link, in place of the `brand` text.                                                    |
| `logo`    | Anything at the start of the bar after the brand link, such as a search button. Without `brand`, your own home link. |
| `actions` | The person's menu or sign-in button, at the end of the bar. Keep to one or two.                                      |
| `default` | The navigation, such as an `ENavList`, on its own row. Omit for no second row.                                       |

## Accessibility

- Renders the `banner` landmark: use one per page.
- Give the navigation a `label` (on `ENavList`) so it differs from other navigations.
- The navigation row and the menu button are hidden in print.
- The menu button is named "Menu" (message `menu`) and carries `aria-expanded`.

## Keyboard

The menu button (when shown), the logo, the actions and the navigation links are reached with Tab in that order. Enter or Space on the menu button toggles `navOpen`.

## Related

[`ENavList`](../NavList/README.md) for the navigation inside it, [`EAppShell`](../AppShell/README.md) for the whole page frame.
