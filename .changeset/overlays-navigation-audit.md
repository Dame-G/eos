---
"@eos-ui/vue": minor
---

Overlays, navigation and feedback: behaviour, accessibility and API fixes.

Breaking (renamed or removed):

- `EToast`: `live` is replaced by `role` (`"alert" | "status" | false`), the same prop `ENotice` has. `:live="false"` becomes `:role="false"`.
- `ENotice`: `role` is typed `"alert" | "status" | false` instead of any string.
- `ESpinner`, `ESkeleton` with a `label`, and a standalone `EToast` no longer carry `role="status"`/`role="alert"`: they announce their words through the shared live regions of `useAnnouncer` as they appear, which a live region that arrives with its words in it does not reliably do. `ENotice` keeps its role, which announces a change of its words after it is in the page.
- `EProgress`: no `aria-busy` on the indeterminate bar, and the stripes of a known fraction no longer move.
- `ETabs`: `items` is required. `ENavList`: `items` or `sections` is required.
- The count badge of `ETabs` and `ENavList` is one shared class, `.e-count` (`.e-nav-count` is gone; a tab's badge keeps `.e-tab-count` beside it).
- The chevron of `EDisclosure` and of an `ENavList` group is the library's chevron icon (`.e-details-chevron`) instead of a drawn `summary::after`.
- `EAppShell`: `main` no longer has a permanent `tabindex="-1"`; the skip link lends it one while focus is there.
- `useDir()`: with no `dir` set it follows the direction of the page around the component once mounted (the locale on the server), so Reka parts agree with CSS `:dir()` on a page with `<html dir="rtl">` and no locale.
- `useAnnouncer()`: a message announced while another of the same politeness waits to be written replaces it, so a burst says only its last.

New:

- `EMenu`: link rows take `to` with a `linkComponent`; checkbox and radio rows take `keepOpen`; choosing the radio option already chosen calls nothing.
- `ETooltip`: `describes`. A label that is the trigger's accessible name already (an `EIconButton` with `tooltip`) is no longer read twice; the bubble is then hidden from screen readers.
- `ENavList`: `size="sm"` for short rows with no rule between them, and `marker="text"` to mark the current page by colour and weight only. Development warns when two navigations are left on the default "Main".
- `ETabs`: `stretch` makes the tabs fill their container's height with the panel scrolling its own content.
- `EAppHeader`: sets `--e-header-height` on the page root (its height while `sticky`, else `0px`); a navigation row that scrolls is a tab stop; the menu button has `aria-controls` for the shell's drawer.
- `ESpinner`: `silent` leaves the announcement to a parent.
- `EExpandableRow`: a chevron shows whether the row is open.
- `EConfigProvider` gives the Reka parts inside it the direction, the scroll-lock padding and one shared `TooltipProvider`.

Fixed:

- `EPagination` no longer writes page 1 back to `v-model` while `pageCount` is 0, so a page restored from the address survives until the count arrives; it announces "Page N of M" only after a person's choice.
- A toast shown before a modal opens stays visible to screen readers (the region keeps out of the modal's `aria-hidden`); in a right-to-left page the toast region keeps clear of the left safe area.
- `ECommandPalette`: the result count is announced once typing pauses; the shortcut does nothing over another open modal, and with two palettes only one answers. `hide()` does not fire `close` (documented).
- `EDialog` marks a modal `aria-modal="true"`. `EDialog` and `EDrawer` share one props interface; the drawer README no longer claims `left`/`right`.
- `EAppShell` hides the server-rendered sidebar on a phone until the page runs, and the header's menu button is there from the first render, so nothing moves on hydration.
- `EAppHeader`: no double gap after the brand link. `EDisclosure`: the summary's focus ring and the first control's ring inside are no longer clipped.
- `ETooltip`: the click after a touch no longer closes the tooltip at once. `EMenu`: long labels wrap inside their row. Every link (`ELink`, `ELinkCard`, `EBreadcrumb`, `ENavList`, `EAppHeader`, `EMenu`) gets `to` for a link component and `href` for a plain `a`, never both.
- The scrollbar gutter is read once per page instead of once per dialog or select.
