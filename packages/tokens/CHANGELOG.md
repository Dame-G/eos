# @eos-ui/tokens

## 0.10.0

### Minor Changes

- 8c29cfc: Audit pass across the tokens, every component and the build. Pre-1.0, so the breaking changes are in a minor.

  **Tokens**

  - Added `scheme: "auto"` (follows `prefers-color-scheme`), `contrast: "auto"` (follows `prefers-contrast`) and `density: "compact"`. Reduced motion now zeroes the tap and move durations in one place, and print colours are one `@media print` override.
  - Icon, checkbox and avatar sizes follow `textScale` (`icon-size`, `check-size`, `avatar-size-*`).
  - New: `success`, `info`, `warning` tones, `*-hover`, `*-press`, `*-slab` fill states, `surface-raised`, `surface-sunken`, `surface-paper`, `skeleton`, `text-link`, `disabled-ink`, `disabled-fill`, `selection`, `stamp-ink`, `slab-edge`, `slab-sink`, `paper`, `weight-*`, `duration-loop`, `duration-spin`, `easing-standard`, `easing-linear`, `z-skip`, `font-script`, `space-5`, `-7`, `-10`, `-12`, `-16`.
  - Breaking: the `edge` shadow is now `frame`; `focus-gap`, `print-ink` and `print-paper` are removed.

  **Components**

  - Breaking: `ECommandPalette` `filter` is now `score`. `ETabs` `framed` is removed and panel slots are `panel-<id>`. `ENotice` shows its close button only with `closable`. `EToast` shows its dismiss button by default (`closable=false` hides it). `ECalendar` shows Clear only with `clearable`. `EDataGrid` `selected` keeps the row id type, and manual mode calls `queryChange` once on mount. `ESurface` is padded by default (`flush` removes it, `pad` is deprecated). `ESearchResults` entries with no link render as buttons, and `edge` is deprecated for `exit-top` and `exit-bottom`. `EUpload` `multiple` appends instead of replacing. `EPagination` previous and next use `aria-disabled`. `ENavList` items with no destination are no longer links.
  - Fixed: OtpField Tab trap, Pagination and NumberField losing focus at their limits, Checkbox losing focus when `error` toggles, Calendar tab stop on a disabled day, Upload focus ring and rejected drops, SignaturePad ignoring its value, SignatureField announcing every keystroke, Notice close button styling, Fieldset `aria-invalid`, always-focusable Table and Drawer bodies, and forced-colors markers in Calendar.
  - New: `EHeading as`, `EDivider vertical`, `ELink to` and `linkComponent`, `EIcon label`, `EMenu side`, `ETooltip side` and `delay`, `EUpload maxSize`, `maxFiles` and `reject`, `ESpinner small` and `large`, `EStamp final`, `ESurface paper`, `EStack justify`, `EPagination href`, `EExpandableRow` `v-model:open` and `group`, `EDataGrid` column `format`, `searchDebounce` and `skeletonRows`, `EDatePicker` and `ERangePicker` `disabledDate` and `marked`, `ECalendar` `update:month`, `EColorField` `name` and `readonly`, `ECombobox readonly`, `EPhoneField format="e164"`, `ECommandPalette` `loading` and `emptyText`, and a `copy` icon.
  - `EAppShell`: header and footer span the full width; the rails only run beside the content.
  - Every component README now has Keyboard and Related sections.

  **Build and types**

  - `GlobalComponents` and `$e` types for Volar, `EosResolver({ css })`, `useQuietFocus` is exported, dev warnings no longer depend on `import.meta.env`.
  - The `style.css` size budget is now 27,500 B gzip (was 24,000).

## 0.9.0

### Patch Changes

- 02ea38e: Body text on a mid-grey surface no longer reports a contrast issue when neither black nor white can reach 7:1. The target there is the best of the two, which is always above 4.5:1.
- 88f0f59: `defineTheme` now gives readable action colours on mid-tone surfaces such as `#9e9e9e` and `#808080`. Before, the primary, secondary, danger and warning colours came out near white next to a white label. Each now tries both darker and lighter, and flips the label between black and white when that is the only way to hold the contrast. Themes that already passed keep their colours. The default `border` is a shade darker (`#7c8c93`) and derived borders are adjusted so the outline holds 3:1 on `surface-tint` as documented. `checkContrast` now follows `var(--e-name)` references, which it skipped before, and also checks `focus-ring`, `focus-field`, `muted` on `surface-tint` and `border` on `surface-tint`. Body text between about `#5c5c5c` and `#959595` cannot reach 7:1 in black or white, so a theme on those surfaces still reports `ink` on `surface` and `background`.
- 301f236: Line heights follow the text scale. EText, ENotice, EToast, EStamp, ETabs, ENavList, EBreadcrumb and the checkbox and radio labels set their line height as a ratio of the font size, so a theme with a `textScale` of 1.5 or more no longer packs lines on top of each other. Rendering at the default scale is unchanged.

## 0.8.1

No changes in this release.

## 0.8.0

No changes in this release.

## 0.7.1

No changes in this release.

## 0.7.0

No changes in this release.

## 0.6.0

### Minor Changes

- c8324dd: `theme.dtcg()` returns the theme as W3C Design Tokens JSON (typed colours, dimensions, durations and easings; aliases for tokens that reference others; usage notes as descriptions). The default theme ships as `@eos-ui/tokens/tokens.dtcg.json` for Tokens Studio and Style Dictionary.

## 0.5.4

### Patch Changes

- bc684bf: A theme now sets `color-scheme` (`dark` for a dark surface, `light` otherwise), in its CSS and in `apply()`, so the browser's own controls, such as the colour picker and autofill, match it.

  Scrolling to the end of a dialog, drawer, picker, list or search panel no longer scrolls the page behind it (`overscroll-behavior: contain`).

  Scrollbars use the standard `scrollbar-width` and `scrollbar-color` everywhere; the hand-drawn `::-webkit-scrollbar` bar remains only as a fallback for browsers without them. Dropped the deprecated `clip` from the screen-reader-only class.

## 0.5.3

### Patch Changes

- 818c1b3: The hover highlight on text inputs, the search bar and wrapped fields now covers the whole field, including the strip under the top edge. It used to be the field's background, which the inset top shadow sat over, so the top few pixels never showed it; it is now a flat fill laid over the shadow (red-tinted on an invalid field).

  `surface-hover`, the hover tone for fields, rows, items and tiles, is now a neutral step (`surface` pulled 9% toward `ink`) instead of the brand-tinted `surface-tint`. A hovered item still matches the selected nav item.

## 0.5.2

No changes in this release.

## 0.5.1

No changes in this release.

## 0.5.0

### Patch Changes

- 1917529: `EDialog` and the bottom `EDrawer` now round their corners with `--e-radius-md`, like cards and inputs, so the `radius` setting changes every surface together. `--e-radius-lg` stays available for your own large surfaces.
- 1917529: EStamp: the `size="sm"` prop is now the boolean `small`, like `EIcon`, `EAvatar` and `EKbd`. README fixes: working icon names in examples, linked sibling components, shorter accessibility notes.

## 0.4.0

No changes in this release.

## 0.3.0

No changes in this release.

## 0.2.1

### Patch Changes

- 6431f3a: `--e-stroke-edge` is now a whole pixel (1px by default, and `strokes.hair` still scales it, rounded down). Controls draw their edge as a border with an identical outline laid over it, and a fractional width such as 1.5px was rounded differently for the two in Firefox, which showed as a doubled, thicker top and right edge on buttons.

## 0.2.0

### Minor Changes

- 03dc50f: The default typefaces are now Bricolage Grotesque (sans) and Geist Mono (mono), replacing Jost and Spline Sans Mono. `fonts.css` loads them from Google Fonts; `defineTheme({ fonts })` still sets any other stack.
- 03dc50f: New tokens: `--e-shade-hover`, `--e-shade-press` and `--e-shade-slab` (mix amounts for `color-mix(in srgb, <fill>, var(--e-shade-hover))`; they lighten instead on a dark surface, except the slab), `--e-print-ink` and `--e-print-paper`, `--e-tap` (44px minimum tap target) and `--e-z-focus`. `--e-z-sticky` is now 2. `--e-focus-gap-field` is `calc(-1 * var(--e-stroke-edge))`, so a field's focus outline lies exactly over its border on every preset.
- 03dc50f: New `surface-hover` token: `surface-tint` pulled 3% toward `ink`, the selected nav item's fill. Hovered rows, menu items, nav items, tabs, pagination, calendar days, search results, segmented options and upload zones use it, so hover and selected fills match. It follows dark surfaces and `contrast: "high"` automatically.
- 03dc50f: `defineTheme` gains `contrast: "high"` (borders in the foreground colour, `muted` at 15:1, a neutral `surface-tint`, a darker `scrim`) and `strokes.edge` / `strokes.card`, which set `stroke-edge` and `stroke-card` outright. Every look the theme playground can build is now a plain `defineTheme` input, with no raw `tokens` overrides.

## 0.1.1

### Patch Changes

- 2ec553e: The password field shows its dots at the normal input size, avatars are slightly larger (32px small, 44px default, 64px large), and a Select value no longer clips descenders such as g and y.

## 0.1.0

### Minor Changes

- 291bf9d: First release: 92 accessible Vue 3 components (primitives, layout blocks, form controls, date pickers, a data grid, dialogs, notices, toasts, account and page components), design tokens with `defineTheme()` and contrast checks, a layered stylesheet, bring-your-own-icons adapters, and a plugin for locale, currency, words and theme.
