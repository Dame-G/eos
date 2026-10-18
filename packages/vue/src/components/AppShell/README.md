# EAppShell

The frame of a whole page: a skip link, the header, an optional side navigation, the main content and a footer.

```vue
<EAppShell sidebar-label="Account">
  <template #header>
    <EAppHeader><template #logo>OpenPractice</template></EAppHeader>
  </template>
  <template #sidebar>
    <ENavList label="Account" :items="items" />
  </template>
  <template #footer>
    <EAppFooter>© 2026 OpenPractice</EAppFooter>
  </template>

  <EPageHeader title="Your account" description="Pay a bill, check a statement or book a visit." />
  ...
</EAppShell>
```

## Props and slots

| Prop           | Type     | Default | Notes                                                        |
| -------------- | -------- | ------- | ------------------------------------------------------------ |
| `mainId`       | `string` | `main`  | The `id` of the `main` element, which the skip link targets. |
| `sidebarLabel` | `string` | "Main"  | The name of the sidebar landmark.                            |

| Slot      | Holds                                                                         |
| --------- | ----------------------------------------------------------------------------- |
| `header`  | An `EAppHeader`.                                                              |
| `sidebar` | The side navigation, usually an `ENavList`. Leave it out for a single column. |
| `footer`  | An `EAppFooter`.                                                              |
| default   | The page. Start with an `EPageHeader`.                                        |

`class`, `style` and attributes fall through to the root.

## Layout

- The content column is capped at 72rem and centred, so lines stay readable.
- With a sidebar, the page is two columns (15rem and the content) from a viewport width of 48rem. Below that, the side navigation sits above the content.
- The frame is a grid of header, body and footer, so a footer stays at the bottom of a short page when the shell has height (`min-height: 100%` inside a full-height parent).
- Printing hides the sidebar, removes the column cap and padding, and sets a white background with black text on `.e-root` and `body`.

## Router usage

The shell has no links of its own, so it needs nothing for a router. Put your `RouterView` in the default slot, a `RouterLink` in the header's `logo` slot, and pass `linkComponent` to the `ENavList`s.

## Accessibility

- Landmarks: `banner` (header), `complementary` named by `sidebarLabel` (the `aside`), `main`, `contentinfo` (footer). The `ENavList` inside the sidebar is a `navigation` landmark with its own name.
- The skip link is the first tab stop. It moves focus to `main`, which has `tabindex="-1"` and no focus outline, so reading starts at the page, not the navigation.
- Use one shell per page, so there is one `main` and one `banner`.

## Rules

- Give the `main` target a unique `id` if you change `mainId`.
- Do not put a second `main` inside the default slot.
