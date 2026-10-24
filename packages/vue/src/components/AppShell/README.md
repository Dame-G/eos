# EAppShell

The frame of a whole page: skip link, header, optional side navigation, main content and footer. Use it once per app, with [`EAppHeader`](../AppHeader/README.md) and [`EAppFooter`](../AppFooter/README.md) in its slots.

```vue
<EAppShell sidebar-label="Account">
  <template #header>
    <EAppHeader><template #logo>Acme</template></EAppHeader>
  </template>
  <template #sidebar>
    <ENavList label="Account" :items="items" />
  </template>
  <template #footer>
    <EAppFooter>© 2026 Acme</EAppFooter>
  </template>

  <EPageHeader title="Your account" description="Pay a bill, check a statement or book a visit." />
  ...
</EAppShell>
```

## Props

<!-- props:start -->

| Prop           | Type      | Default     | Notes                                                                                                                                                         |
| -------------- | --------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `navOpen`      | `boolean` | `false`     | `v-model:navOpen`: whether the sidebar drawer is open. It only exists below 48rem.                                                                            |
| `mainId`       | `string`  | `"main"`    | The `id` of the `main` element, which the skip link targets. It must be unique on the page.                                                                   |
| `sidebarLabel` | `string`  | `"Sidebar"` | The name of the sidebar landmark.                                                                                                                             |
| `navToggle`    | `boolean` | `true`      | Below 48rem the sidebar leaves the page and opens in a drawer from a menu button in the header. Turn it off to keep the sidebar above the content on a phone. |

<!-- props:end -->

`class`, `style` and attributes land on the `div` element. The header and footer run the full width of the page and their content lines up with the content column. Content is capped at 72rem, on the page background; the ground beside it is the brand colour mixed into the page background, and the header and footer share the `surface` background. With a sidebar the page is two columns from 48rem wide, and below that the sidebar leaves the page and opens in an [`EDrawer`](../Drawer/README.md) from a menu button that the [`EAppHeader`](../AppHeader/README.md) shows by itself. Bind `v-model:navOpen` to read or set the drawer. Following a link inside it closes it. `navToggle` off keeps the sidebar above the content instead. Printing hides the sidebar. Two CSS custom properties are public: `--e-shell-width` sets the column width (72rem by default) and `--e-shell-rail` sets the colour of the line down each edge of the column, which runs beside the content only and not through the header or footer (`transparent` turns it off). The two-column layout follows the window width, not the shell's own width, because the shell is the page frame. The shell has no links of its own: put `RouterView` in the default slot and pass `linkComponent` to your `ENavList`s.

## Slots

| Slot      | Use                                                                           |
| --------- | ----------------------------------------------------------------------------- |
| `header`  | An `EAppHeader`.                                                              |
| `sidebar` | The side navigation, such as an `ENavList`. Leave it out for a single column. |
| `footer`  | An `EAppFooter`.                                                              |
| `default` | The page. Start with an `EPageHeader`. Do not add a second `main`.            |

## Accessibility

- Landmarks: `banner`, `complementary` (named by `sidebarLabel`, "Sidebar" by default so it differs from the "Main" navigation inside it), `main`, `contentinfo`. Use one shell per page.
- In the drawer the sidebar is a dialog named "Menu" (or `sidebarLabel`). Escape closes it and focus returns to the menu button.

## Keyboard

| Key | Action                                                              |
| --- | ------------------------------------------------------------------- |
| Tab | The first stop is the skip link. Enter on it moves focus to `main`. |

## Related

[`EAppHeader`](../AppHeader/README.md) and [`EAppFooter`](../AppFooter/README.md) fill its slots, [`ENavList`](../NavList/README.md) is the sidebar, and [`EPageHeader`](../PageHeader/README.md) starts the page.
