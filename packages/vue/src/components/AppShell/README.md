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

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `mainId` | `string` | `"main"` | The `id` of the `main` element, which the skip link targets. Keep it unique. |
| `sidebarLabel` | `string` | `"Main"` | The name of the sidebar landmark. |

<!-- props:end -->

`class`, `style` and attributes land on the `div` element. Content is capped at 72rem. With a sidebar the page is two columns from 48rem wide; below that the sidebar sits above the content. Printing hides the sidebar. The shell has no links of its own: put `RouterView` in the default slot and pass `linkComponent` to your `ENavList`s.

## Slots

| Slot      | Use                                                                           |
| --------- | ----------------------------------------------------------------------------- |
| `header`  | An `EAppHeader`.                                                              |
| `sidebar` | The side navigation, usually an `ENavList`. Leave it out for a single column. |
| `footer`  | An `EAppFooter`.                                                              |
| `default` | The page. Start with an `EPageHeader`. Do not add a second `main`.            |

## Accessibility

- Landmarks: `banner`, `complementary` (named by `sidebarLabel`), `main`, `contentinfo`. Use one shell per page.
- The skip link is the first tab stop and moves focus to `main`.
