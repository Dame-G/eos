# EAppHeader

The bar across the top of the page, with logo, actions and a navigation row that wraps its links when they do not fit. Put it in the `header` slot of [`EAppShell`](../AppShell/README.md), and use [`EPageHeader`](../PageHeader/README.md) for the title of each page.

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

`class`, `style` and attributes land on the `header` element. The brand link is a tap target in the ink colour that takes the primary colour on hover; put a logo in the `brand` slot and name it with `brandLabel`. Inside an [`EAppShell`](../AppShell/README.md) the menu button appears by itself below 48rem, where the sidebar is a drawer.

The header sets `--e-header-height` on the page root: its height while `sticky`, and `0px` otherwise. Use it to keep a sticky part of the page under the header (`top: var(--e-header-height, 0px)`) or to offset anchors (`scroll-padding-top`).

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
- In print the header is the brand alone: the navigation row, the menu button and the actions are hidden, and a sticky header prints once, at the top of the first page.
- The menu button is named "Menu" (message `menu`) and carries `aria-expanded`; inside an `EAppShell` it points at the open drawer with `aria-controls`.
- A navigation row that scrolls sideways is a tab stop while it scrolls, so the keyboard can scroll it.

## Keyboard

The menu button (when shown), the logo, the actions and the navigation links are reached with Tab in that order. Enter or Space on the menu button toggles `navOpen`.

## Related

[`ENavList`](../NavList/README.md) for the navigation inside it.
