# @eos-ui/vue

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
