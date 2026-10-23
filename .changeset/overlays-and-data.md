---
"@eos-ui/vue": minor
---

Overlays, navigation, feedback and data: fixes from the audit, with deprecations in place of breaks.

**Overlays**

- `EDialog`, `EDrawer`, `ECommandPalette`: a press on a toast no longer counts as a press outside, so dismissing a toast leaves a dismissible dialog (and the palette) open.
- `inline` previews of `EDialog` and `EDrawer` now ignore Escape, presses outside and focus moving out.
- `ECommandPalette` emits `close` when a command is chosen and when the shortcut closes it, not only on Escape and the backdrop.
- `ETooltip` emits `close` only when the person hides it. Setting `open` to false no longer fires it, matching `EDialog`, `EDrawer` and `EMenu`.
- `EMenu` `side="left"` and `side="right"` are deprecated (they still work, and warn in development). Use `start` and `end`. The side mapping is shared through the new `useLogicalSide()`, exported next to `useDir()`.
- `useOverflow(scroller, watch, { children: true })` also watches the scroller's children. `EDialog` and `EDrawer` share one body built on it.

**Toasts**

- `EToastProvider`: closing a toast with its button moves focus to the next toast, or back to where it was, instead of dropping it to the page. The region shows a focus ring when F8 focuses it.
- `EToast`'s dismiss button now uses the `dismiss` message ("Dismiss"), as `ENotice` does, in place of "Close notification". The `closeToast` message is deprecated: if you set it, it still names the button. Panels (dialog, drawer, the Columns menu) keep `close`.

**Data**

- `EDataGrid` no longer depends on `@tanstack/vue-table`: filtering, sorting, paging and selection are plain computeds. Behaviour is unchanged. `@tanstack/vue-virtual` stays for `virtual`.
- `EDataGrid` `bare` is deprecated in favour of `ETable` (it still works, and warns in development).
- `EDataGrid` as cards (below 40rem) now shows the `filterable` filters above the rows, labelled by column, as the sort moves to a menu.
- `EDataGrid` with `manual`: `searchDebounce` also waits for typing in text and number filters.
- `EDataGrid`'s error state uses the icon name `alert`, so every icon set draws it.
- `ETable`: the loading status region stays in the page and only its text changes, so screen readers hear it. `skeletonRows` defaults to 5, as in `EDataGrid` (was 3).

**Navigation and feedback**

- `EStepper`: a `disabled` interactive step stays focusable with `aria-disabled`, as `EPagination` does, instead of leaving the Tab order. The brackets around the screen-reader words are now in the `done` and `stepError` messages ("(done)", "(has an error)"): if you translated them, add brackets if you want them.
- `EPagination`: an empty `label` falls back to "Pagination", as `EBreadcrumb` and `EStepper` do.
- `EProgress`: the indeterminate bar slides from the start edge in a right-to-left page too, and the percentage is formatted in the configured locale.
