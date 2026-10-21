# @eos-ui/vue

## 0.7.0

### Minor Changes

- 9cf6521: EHighlight takes a `swatch` colour and draws a small square of it to the right of the text, for showing a colour value such as `#2c95b4`. Highlight is also text colour only now, with no background wash.
- 9cf6521: ETabs has a `side` prop: a vertical list can sit on the `end` side of its panel (the right in a left-to-right page), with the selected tab's band on the outer edge and the tab opening into the panel.

### Patch Changes

- 9cf6521: The EDatePicker and ERangePicker calendars now open above positioned fields and sticky bars instead of underneath them.
- 9cf6521: EDataGrid in its narrow card layout no longer draws the toolbar's bottom border across the first card's rounded corners.
- @eos-ui/tokens@0.7.0

## 0.6.0

### Minor Changes

- c8324dd: New `ECommandPalette`: a modal search box over grouped commands, opened with `mod+k` or `v-model:open`, with built-in matching (or your own `filter`), keycaps for each command's shortcut, a custom `item` slot, and a combobox/listbox pattern with `aria-activedescendant`.
- c8324dd: New `ECopyButton` and `useCopy()`: copy text, show a check mark, announce "Copied" or "Couldn't copy", and fall back to a hidden textarea where the async clipboard is missing. `ECodeBlock` now uses them, so its copy announcement comes from the shared announcer.
- c8324dd: The build now writes `llms.txt` (an index of every component) and `llms-full.txt` (all the documentation in one file) for AI coding assistants. They ship as `@eos-ui/vue/llms.txt` and `@eos-ui/vue/llms-full.txt`. A new composables README documents every composable.
- c8324dd: `useAnnouncer()` says something to screen reader users through one shared hidden live region (`announce("3 rows selected")`, or `{ assertive: true }` for errors).
- c8324dd: `useShortcuts()` binds keys for the life of a component (`"mod+k"`, `escape`, `?`), skips key-only shortcuts while a text field has focus, and `formatShortcut()` gives the keycaps for `EKbd`.

### Patch Changes

- Updated dependencies [c8324dd]
  - @eos-ui/tokens@0.6.0

## 0.5.4

### Patch Changes

- bc684bf: A theme now sets `color-scheme` (`dark` for a dark surface, `light` otherwise), in its CSS and in `apply()`, so the browser's own controls, such as the colour picker and autofill, match it.

  Scrolling to the end of a dialog, drawer, picker, list or search panel no longer scrolls the page behind it (`overscroll-behavior: contain`).

  Scrollbars use the standard `scrollbar-width` and `scrollbar-color` everywhere; the hand-drawn `::-webkit-scrollbar` bar remains only as a fallback for browsers without them. Dropped the deprecated `clip` from the screen-reader-only class.

- bc684bf: Hover styles now apply only on devices that can hover (`@media (hover: hover)`). A tap on a touch screen no longer leaves a button, row or field stuck in its hover look.
- bc684bf: `NumberField` with a prefix or suffix no longer clips its value in a narrow column (under 10rem, as on a phone in the playground's spacing and control-height fields). The narrow-column side padding was also being applied to the fixed-width input and squeezed the digits out.
- bc684bf: `Segmented` now scrolls sideways, with no scrollbar, when its options are wider than the space (a phone) instead of clipping them. Its outline stays put and the chosen option is brought into view. A `Segmented` with a hint or error no longer lets the grid cell grow past its container.
- bc684bf: `AppShell` no longer draws its side hairlines when the page column fills the screen. The lines now sit just outside the column's edges instead of on them, so they fall off the screen whenever the viewport is no wider than the shell (a narrow desktop window as well as a phone) and show only beside a column that is narrower than the screen.
- bc684bf: A framed `Tabs` panel now squares its top outer corner when the row of tabs is wider than its space and scrolls, so the panel meets the tabs instead of curving away from them. With room to spare, the corner stays rounded.
- Updated dependencies [bc684bf]
  - @eos-ui/tokens@0.5.4

## 0.5.3

### Patch Changes

- 818c1b3: The hover highlight on text inputs, the search bar and wrapped fields now covers the whole field, including the strip under the top edge. It used to be the field's background, which the inset top shadow sat over, so the top few pixels never showed it; it is now a flat fill laid over the shadow (red-tinted on an invalid field).

  `surface-hover`, the hover tone for fields, rows, items and tiles, is now a neutral step (`surface` pulled 9% toward `ink`) instead of the brand-tinted `surface-tint`. A hovered item still matches the selected nav item.

- 0089884: `AppShell` no longer draws its side hairlines when the page column fills the screen. The lines now sit just outside the column's edges instead of on them, so they fall off the screen whenever the viewport is no wider than the shell (a narrow desktop window as well as a phone) and show only beside a column that is narrower than the screen.
- Updated dependencies [818c1b3]
  - @eos-ui/tokens@0.5.3

## 0.5.2

### Patch Changes

- a9760d9: Rounded corners no longer show a fringe of the fill colour outside the curve. A fill painted under an inset-shadow edge leaks through the antialiased corner pixels (white bleeding past a dark outline on a dark page, or a lighter rim round a button's bottom corners). Buttons, inputs, the search bar, tabs, the current nav item, notices, switches, checkboxes and radios, avatars, the progress track, the signature pad and the stepper dot now draw their edge as a real border and stop the fill inside it, so the outermost pixels are the edge colour alone. Solid-colour faces (the filled button variants and checked switches, checkboxes and radios) run under their border instead, because they are the colour of their own edge and a gap between the two would let the page show through as a light speck.

  The raised edge of buttons, selected tabs and the current nav item is now the border itself, thicker on the raised side, instead of a shadow over the face; it tapers up the corners the same way. Sizes and text positions are unchanged. As a side effect the edges survive forced-colors mode.

  `npm run check:css` now fails on an inset-shadow edge over a strong fill, so the pattern cannot return.

  `ESelect`: an open trigger now shows its focused look (focus ring colour and outline). Focus moves into the list when it opens, so the field only looked focused after a choice was made.

  The table and data grid frames keep their outline laid over the content, which measures closest to an ideal rounded corner when a tinted header sits in it. The progress bar stops half a stroke inside its outline so no gap or colour shows at the curve.

- @eos-ui/tokens@0.5.2

## 0.5.1

### Patch Changes

- 22dce5a: `ETabs`: the vertical, framed and fill looks now apply only to the tabs they are set on. Tabs placed inside the panel of a vertical or framed `ETabs` had picked them up and stacked into a column.

  `EPageHeader`: the status stamp is centred on the title, not nudged down towards its baseline.

- @eos-ui/tokens@0.5.1

## 0.5.0

### Minor Changes

- 1917529: New `ETable`: a plain, native table in an outlined, scrollable frame for read-only facts. It names its scroll region from `caption`, and has `striped`, `dense`, `hideCaption` and `maxHeight` (sticky heading row). `EDataGrid` now shares its table look through the same stylesheet.
- 1917529: Every outlined control now draws its edge the way cards do: one box-shadow ring, no CSS border, so corners are crisp and consistent. This covers inputs, the search bar, buttons, tabs, nav items, segmented controls, avatars, keycaps, checkboxes, radios, switches, notices, the signature pad and calendar/pagination hover edges. Dashed disabled and empty edges are drawn as outlines.

  `EButton` has a new `loading` prop: a spinner replaces the icon, clicks are ignored, and the button is announced as busy while keeping its width.

  An invalid input keeps its error colour on hover and tints its background. `EEmptyState` shows its icon on its own in the primary colour, without a circle behind it.

- 1917529: `ESegmented` is now a pressed-in track whose chosen option fills its cell edge to edge in the primary colour, so it no longer looks like a row of tabs. The track clips the chosen piece, so only the options at either end take the rounded corners. It is the same height, and the markup and props are unchanged.
- 1917529: EStamp: the `size="sm"` prop is now the boolean `small`, like `EIcon`, `EAvatar` and `EKbd`. README fixes: working icon names in examples, linked sibling components, shorter accessibility notes.
- 1917529: ETabs: add a `framed` prop that joins the tabs to their panel as one outlined card, like folder tabs. The chosen tab opens into the panel and the edge stays open where there are no tabs. Works across and vertical.
- 1917529: ETabs: add an `orientation` prop. `vertical` stacks the tabs in a column beside the panel, for a long list of sections; arrow keys move up and down.

### Patch Changes

- 1917529: Buttons, tabs and the current nav item now draw their raised edge (the slab) inside their own outline, as an inset shadow shifted by the lift, instead of as an offset copy of the box behind it. The slab still follows the corners up the sides, which gives the depth, but the box has one outline, so the corner no longer shows a fringe or a thickened crescent where two antialiased shapes overlapped. Every control is still one control height tall.
- 1917529: `EDialog` and the bottom `EDrawer` now round their corners with `--e-radius-md`, like cards and inputs, so the `radius` setting changes every surface together. `--e-radius-lg` stays available for your own large surfaces.
- Updated dependencies [1917529]
- Updated dependencies [1917529]
  - @eos-ui/tokens@0.5.0

## 0.4.0

### Minor Changes

- 43125ac: Rounded corners and raised edges are cleaner. Every outlined box is now drawn once: a border, or a box-shadow ring, is the whole stroke. Laying an identical outline over it, which these components did to thicken the curve, painted the antialiased corner pixels twice and made every rounded corner look heavier than its straight edges. A button, selected tab and selected nav item draw their raised slab as an offset copy of the face (a whole rounded box), so the curve no longer thickens or pinches at the bottom corners; a notice draws its left accent inside its outline instead of as a thick left border; and the selected segment no longer has an inset band that ended in a point against the container edge. Heights and spacing are unchanged, and a pressed button sinks onto its slab.
- 43125ac: `ETabs` has a `fill` prop that shares the row width equally between the tabs, for a narrow container where they must all fit. Labels truncate instead of the row scrolling.

### Patch Changes

- @eos-ui/tokens@0.4.0

## 0.3.0

### Minor Changes

- b8930cc: `ETabs` has a `fill` prop that shares the row width equally between the tabs, for a narrow container where they must all fit. Labels truncate instead of the row scrolling.

### Patch Changes

- @eos-ui/tokens@0.3.0

## 0.2.1

### Patch Changes

- 6431f3a: `--e-stroke-edge` is now a whole pixel (1px by default, and `strokes.hair` still scales it, rounded down). Controls draw their edge as a border with an identical outline laid over it, and a fractional width such as 1.5px was rounded differently for the two in Firefox, which showed as a doubled, thicker top and right edge on buttons.
- Updated dependencies [6431f3a]
  - @eos-ui/tokens@0.2.1

## 0.2.0

### Minor Changes

- 03dc50f: Breaking: `EAutocomplete` and `EMultiSelect` are removed; `ECombobox` replaces both. Use `<ECombobox freeform>` where you used `EAutocomplete` (the model is the typed text) and `<ECombobox multiple>` where you used `EMultiSelect` (the model is a `string[]`, shown as tags). `multiple` wins when both are set. `EComboboxProps` gains `multiple` and `freeform`. The internal match-marking helper is renamed so it no longer shares a name with `EHighlight`.

  Style sweep over the form controls (Calendar, DataGrid, Combobox, NumberField, ColorField, SearchBar, Select, TextField): stroke, spacing and radius literals use tokens, focus rings use the focus-gap tokens, and forced-colors and reduced-motion are covered.

- 03dc50f: `EDialog` and `EDrawer` take a `dismissible` prop that also closes them on a backdrop press (emitting `close`). It is off by default, so a stray press still cannot lose a half-filled form.
- 03dc50f: New `EExpandableRow`: a native `details` row with `leading`, `trailing`, body and `actions` slots. The row's classes are `e-xrow` (with `e-xrow-title`, `e-xrow-sub`, `e-xrow-trail`).
- 03dc50f: `EGrid` gains a `masonry` prop. Cards of uneven height pack into columns (CSS multi-column, `min` as the column width) with no gaps under the short ones. Items flow top to bottom within each column.
- 03dc50f: The default typefaces are now Bricolage Grotesque (sans) and Geist Mono (mono), replacing Jost and Spline Sans Mono. `fonts.css` loads them from Google Fonts; `defineTheme({ fonts })` still sets any other stack.
- 03dc50f: Style sweep: strokes, spacing and heights use the stroke, space and control-height tokens (Stepper, signature baselines, Segmented, Dialog, Avatar, Pagination, Breadcrumb, AppHeader); print styles use `--e-print-ink` and `--e-print-paper`; Checkbox, RadioGroup and Switch compute their offsets from tokens (the Switch thumb now sits symmetrically, 1px further on); the EmptyState icon draws border plus outline instead of an inset shadow; Surface, Dialog, Drawer, Upload, Avatar and EmptyState have forced-colors rules; the AppShell main landmark shows a focus ring when focused from the skip link.
- 03dc50f: Props now follow one set of conventions (see CONTRIBUTING.md). Breaking, while we are pre-release:

  - `variant` is only for `EButton` and `EMenu`. It is gone from `EChip`, `EStamp` and `EDisclosure`, which keep their former default look; `EDisclosure` loses `meta`, and `EAccordion` draws its own cards.
  - `EText`: `variant="small"` is `small`, `variant="deck"` is `large`.
  - `ESurface`: `tone="tint"` is removed and `tone="float"` is `raised`.
  - `dense` is removed from `ENavList` and `ETabs`; vertical tabs always use the compact rows.
  - `EDataGrid`: `plain` is `bare`.
  - `EItemRow`: `tone`, `label` and `detail` are `statusTone`, `statusLabel` and `statusDetail`.
  - `EDetailRow`: `status` and `tone` are `badge` and `badgeTone`.
  - `EOtpField`: `type` is `inputmode`.

- 03dc50f: Fewer components, same pieces. Breaking, while we are pre-release:

  - `EToggle`, `ELinkCard`, `EBackLink` and `EPanel` are removed. They are now documented recipes built from `EButton`, `ESurface`, `ELink` and `EHeading` (see Recipes in the docs). `EButton` styles `aria-pressed="true"` as a selected toggle.
  - `EButtonGroup` is removed. `EActions` takes its place and gains a `label` prop that renders `role="group"` with `aria-label`.
  - `ELoadingBar` is removed. `EProgress` is indeterminate when `value` is left out, and its `label` and `value` are now optional.
  - `EPopover` is renamed `EDefinition`, with the same props, slots and behaviour.
  - Menu, Toast, Progress, Skeleton, Tooltip, Button and IconButton use stroke, spacing and shade tokens, and gain forced-colors handling. A disabled `EIconButton` now has the same dashed edge as a disabled `EButton`.

- 03dc50f: Breaking (pre-1.0): `EAmount` and `ETimeline` are removed, along with the "Account" component group. Show a figure with `EKicker` and your own mono-numeral text, and a history with `EDescriptionList` or a plain list.
- 03dc50f: Breaking (pre-1.0): the domain composites `EStatementCard`, `EStatementRow`, `EBookingCard`, `ESlotPicker`, `ECardField` and `EAddressField` are removed, along with their types (`Address`, `BookingProvider`, `SlotOption`, `StatementProps`). Compose them from `EFieldset`, `ETextField`, `ESelect`, `ESurface`, `EDescriptionList`, `EExpandableRow`, `EStamp` and `EDisclosure` instead. The `@eos-ui/vue/patterns` entry point is removed; `ESignatureField` and `ESignaturePad` are general components again and ship from `@eos-ui/vue`. `EExpandableRow` stays.
- 03dc50f: Breaking (pre-1.0): `EErrorSummary` is removed. Each field already shows its own `error`, so show errors there.
- 03dc50f: Fewer row and section components. Breaking: `EAccordion` is removed (use `EDisclosure` items sharing a `group`; `EDisclosure` gains a `title` slot and its `title` prop is optional). `EMetaList`, `EDetailRow`, `EItemList` and `EItemRow` are removed: `EDescriptionList` now takes optional `label` (leave every label out for a plain icon list), `icon`, `badge`/`badgeTone` and `editable` per item, emits `edit`, and has a scoped `action` slot for a row's end (stamp, button). `EFormSection` is removed: use `EFieldset` with `section` (`legend` is the title, `hint` the description; `headingLevel` and `gap` are gone). The Disclosure chevron uses the card stroke token and honours forced colours.
- 03dc50f: New tokens: `--e-shade-hover`, `--e-shade-press` and `--e-shade-slab` (mix amounts for `color-mix(in srgb, <fill>, var(--e-shade-hover))`; they lighten instead on a dark surface, except the slab), `--e-print-ink` and `--e-print-paper`, `--e-tap` (44px minimum tap target) and `--e-z-focus`. `--e-z-sticky` is now 2. `--e-focus-gap-field` is `calc(-1 * var(--e-stroke-edge))`, so a field's focus outline lies exactly over its border on every preset.
- 03dc50f: `EAppShell` draws a hairline down each edge of the page column, through the header and footer, from 64rem wide. `--e-shell-width` sets the column width (72rem by default); `--e-shell-rail` sets the line colour, `transparent` turns it off.
- 03dc50f: Breaking: `EChip` is removed; `EStamp` is now the one status label. It is a plain inline `span` (no `role="img"`), takes the word from the default slot, `label` or a `status` preset, and adds the `neutral` and `ink` tones (the default without a status; it was `info`) and a `size` prop (`sm` | `md`) that replaces `small`. The size modifier class is `e-stamp--sm` (was `e-stamp--s`). `ChipTone` is gone; use `StampTone`. `ETabs` switches panels only: the link mode and the `label`, `linkComponent`, `href`, `to` and `current` props are removed, and `TabItem.id` is required. Use `ENavList` for every list of links, vertical or horizontal; `LinkNav` now lives in the NavList folder. `EHeading`'s `kicker` prop renders an `EKicker`.
- 03dc50f: `EStamp` no longer draws a glyph from its status or tone; pass `icon` to add one.
- 03dc50f: New `surface-hover` token: `surface-tint` pulled 3% toward `ink`, the selected nav item's fill. Hovered rows, menu items, nav items, tabs, pagination, calendar days, search results, segmented options and upload zones use it, so hover and selected fills match. It follows dark surfaces and `contrast: "high"` automatically.
- 03dc50f: `ETabs` is horizontal only: the `orientation` and `sections` props are gone (use `ENavList` for a sidebar or outline). Every tab is ringed and flush with its neighbours, rounded only at the ends of the row, and the selected one is outlined in the primary colour with a thick bottom edge. Vertical `ENavList` items are divided by a hairline separator with space around it.
- 03dc50f: `defineTheme` gains `contrast: "high"` (borders in the foreground colour, `muted` at 15:1, a neutral `surface-tint`, a darker `scrim`) and `strokes.edge` / `strokes.card`, which set `stroke-edge` and `stroke-card` outright. Every look the theme playground can build is now a plain `defineTheme` input, with no raw `tokens` overrides.

### Patch Changes

- 0a34a31: `EBookingCard` shows its facts under a full-width divider, each with its icon in a bordered tile centred in the column of the provider picture or date tile.
- 03dc50f: Rounded corners are as heavy as the straight edges of an outline. A one-pixel curve antialiases to a lighter line, so every outlined box is now painted twice: its ring or border plus an identical outline laid over it (outlines snap to whole device pixels, so straight edges stay crisp at fractional display scaling). Print styles drop the overlay.
- d4cd548: The selected item of `ENavList` draws its outline in the primary colour.
- 03dc50f: The secondary (green) colour now marks subtle, informational highlights where primary is never in play: the typed signature line, the empty-state icon tile and the Upload drag-over state. Where primary is in play (the Calendar range and today marker, completed Stepper steps, and the count badges in `ENavList` and `ETabs`) the subtle highlights use primary itself.
- Updated dependencies [03dc50f]
- Updated dependencies [03dc50f]
- Updated dependencies [03dc50f]
- Updated dependencies [03dc50f]
  - @eos-ui/tokens@0.2.0

## 0.1.1

### Patch Changes

- 2ec553e: The password field shows its dots at the normal input size, avatars are slightly larger (32px small, 44px default, 64px large), and a Select value no longer clips descenders such as g and y.
- Updated dependencies [2ec553e]
  - @eos-ui/tokens@0.1.1

## 0.1.0

### Minor Changes

- ab054bb: Add `EColorField`, `EButton` `href` (a link that looks like a button), and `ENavList` `sections` and `dense`. Fix the Select trigger tint, the Segmented disabled-and-selected text, Calendar day spacing, Field and AddressField label gaps, AppHeader and AppFooter alignment, the narrow BookingCard layout, and a Stack that grew to fit a wide child.
- 291bf9d: First release: 92 accessible Vue 3 components (primitives, layout blocks, form controls, date pickers, a data grid, dialogs, notices, toasts, account and page components), design tokens with `defineTheme()` and contrast checks, a layered stylesheet, bring-your-own-icons adapters, and a plugin for locale, currency, words and theme.

### Patch Changes

- Updated dependencies [291bf9d]
  - @eos-ui/tokens@0.1.0
