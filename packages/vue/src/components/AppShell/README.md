# EAppShell

The frame of a whole page: skip link, header, optional side navigation, main content and footer.

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

| Prop           | Type     | Default  | Notes                                                                                       |
| -------------- | -------- | -------- | ------------------------------------------------------------------------------------------- |
| `mainId`       | `string` | `"main"` | The `id` of the `main` element, which the skip link targets. It must be unique on the page. |
| `sidebarLabel` | `string` | `"Main"` | The name of the sidebar landmark.                                                           |

<!-- props:end -->

`class`, `style` and attributes land on the `div` element. Content is capped at 72rem. With a sidebar the page is two columns from 48rem wide, and below that the sidebar sits above the content. Printing hides the sidebar. Two CSS custom properties are public: `--e-shell-width` sets the column width (72rem by default) and `--e-shell-rail` sets the colour of the line down each edge of the column (`transparent` turns it off). The two-column layout follows the window width, not the shell's own width, because the shell is the page frame. The shell has no links of its own: put `RouterView` in the default slot and pass `linkComponent` to your `ENavList`s.

## Slots

| Slot      | Use                                                                           |
| --------- | ----------------------------------------------------------------------------- |
| `header`  | An `EAppHeader`.                                                              |
| `sidebar` | The side navigation, such as an `ENavList`. Leave it out for a single column. |
| `footer`  | An `EAppFooter`.                                                              |
| `default` | The page. Start with an `EPageHeader`. Do not add a second `main`.            |

## Accessibility

- Landmarks: `banner`, `complementary` (named by `sidebarLabel`), `main`, `contentinfo`. Use one shell per page.
- The skip link is the first tab stop and moves focus to `main`.

## Keyboard

| Key | Action                                                              |
| --- | ------------------------------------------------------------------- |
| Tab | The first stop is the skip link. Enter on it moves focus to `main`. |

## Related

[`EAppHeader`](../AppHeader/README.md) and [`EAppFooter`](../AppFooter/README.md) fill its slots, [`ENavList`](../NavList/README.md) is the sidebar, and [`EPageHeader`](../PageHeader/README.md) starts the page.
