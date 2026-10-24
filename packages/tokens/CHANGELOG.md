# @eos-ui/tokens

## 0.13.1

### Patch Changes

- bf2cb90: The library's name is written in lowercase, eos, in the package descriptions, READMEs and generated `llms.txt`. Nothing in the API changes.

## 0.13.0

### Minor Changes

- 6280803: **Old spellings are removed.** Until 1.0 an old spelling goes outright instead of warning. Each line names what to write instead.

  Components:

  - `small` and `large` on `EAvatar`, `ESpinner`, `ESurface` and `EText`, `small` on `EIcon`, `EKbd` and `EStamp`, and `dense` on `ETable`: use `size` (`size="sm"`, `size="lg"`).
  - `ESurface` `paper` and `raised`: use `variant="paper"` and `variant="raised"`. `ESurface` `pad`: use `size`, `padding` or `flush`. `ESurface` `variant="tone"`: use `variant="tinted"`.
  - `EText` `muted` and `tone="muted"`: use `tone="neutral"`.
  - `EAvatar` `status`: use `presence`.
  - `EDescriptionList` item `badge` and `badgeTone`: use `stamp` and `stampTone`.
  - `EDataGrid` `bare`: use `ETable` for a short static list. Every grid now has its foot.
  - `EUpload` `@files`: use `v-model` or `@update:model-value`, which carry the same list.
  - `EStamp` `tone="ink"`: use `tone="neutral"`.
  - `EMenu` `side="left"` and `side="right"`: use `start` and `end`. `EDrawer` `side="left"` and `side="right"`: use `start` and `end`. `useLogicalSide()` and its `LogicalSide` type take `top`, `bottom`, `start` and `end` only.
  - `EInline` `nowrap`: use `:wrap="false"`.
  - `ESearchResults` `@edge`: use `@exit-top`.
  - `ESearchBar` and `ECombobox` no longer show the clear button when `clearable` is left out: it defaults to `false`, as in every field, with no warning. Pass `clearable` to show it.

  Messages:

  - `dragHere`: use `dropFile` (with `{choose}` where the `chooseOne` link goes).
  - `closeToast`: use `dismiss`. `EToast` no longer reads `closeToast`.

  `defineTheme` inputs:

  - `strokes.edge` and `strokes.card`: `strokes.hair` derives both. To pin one, set `tokens: { "stroke-edge": "2px" }` or `tokens: { "stroke-card": "2px" }`.
  - `motion: "none"`: every theme already stops moving under `prefers-reduced-motion`. To zero the durations anyway, set `duration-tap`, `duration-fade` and `duration-move` in `tokens`.

  CSS tokens (each `--e-*`):

  - `slab`: use `depth`. `stroke-ring`: use `stroke-edge`. `surface-hover` and `surface-press`: use `wash-hover` and `wash-press`. `brand-blue` and `brand-green`: use `brand` and `brand-accent`. `easing-standard`: use `ease-in-out`.
  - `leading-loose` and `space-7`: use another step of the scale (`leading-normal`, `space-6` or `space-8`). A gap or padding of `7` is no longer a space token.
  - `on-info`, `on-success` and `on-warning`: use `on-primary`, `on-secondary` and `surface`, which they were aliases of.
  - `shade-hover`, `shade-press` and `shade-slab`: use the `*-hover`, `*-press` and `*-slab` tokens of a fill, or `slab-ink`. Those carry the mix amounts inline now and resolve to the same colours on light and dark surfaces.
  - `bp-narrow`, `bp-medium` and `bp-wide`: write the breakpoints as literals (`26rem`, `36rem`, `48rem`), since a custom property cannot be read in `@media` or `@container`.

  The tokens package no longer exports `deprecated`. `explain()` and the DTCG export (`$deprecated`) no longer mark old tokens, and a removed token set in `tokens` is reported as not a known token.

- 4852210: Tokens and CSS values audit.

  - The `frame`, `float` and `paper` shadows draw their ring as `0 0 0 var(--e-stroke-card) var(--e-border)`, so a `border` or `stroke-card` override (from `defineTheme` or plain CSS on `:root`) reaches cards, popovers and paper. Only the drop layers are literal. `paper` is the ring plus `var(--e-well)`.
  - The `scrim` is a deep shade of the brand colour, so a custom `brand` no longer dims dialogs with the default teal.
  - New tokens: `brand` and `brand-accent` (the new names of `brand-blue` and `brand-green`), `type-meta` (one line of small mono metadata), `underline-offset` (0.25em, the gap under every underlined text), `tracking-snug` (the button label), `shell-width` and `shell-rail` (the `EAppShell` column, now in `tokens.json`). `type-button` is listed with the sans styles. `easing-linear` is `linear`.
  - `defineTheme`: `radius` also takes one base number in px (`radius-md`; `sm` is half, `lg` double). `strokes` needs only `{ hair, focus }`. The success and warning notice pairs are checked once each.
  - `base.css`: the unused recipe classes `.e-slab` (and `--thin`, `--bold`, `--shadow`, `--sink`), `.e-selected--value`, `.e-selected--place`, `.e-disabled`, `.e-disabled-row` and `.e-interact--field` are removed. They were never documented as API; the rules they stood for are now a comment in `base.css`, including the named hover exceptions (link, breadcrumb, disclosure summary) and the two ways "place" is drawn (a tab thickens its edges in a bordered strip, a nav item takes a slab).
  - Dialogs, drawers and the command palette arrive on `easing-enter` and leave on `easing-exit`; the scrim fades over `duration-fade`.
  - The selected calendar day stands on the standard slab. Notice, Stamp and Toast share one tone edge: `stroke-edge` plus `slab-bold` on the inline-start side, so the stamp's and the toast's are 1px heavier.
  - Raw line heights and letter spacing in component CSS are type, leading and tracking tokens. Calendar titles use `type-h4`, so they are medium weight, not strong; navigation group headings use `type-kicker`, like menu group labels. `ECodeBlock` sets code at the mono weight `fonts.css` loads (500).
  - Popovers and plain toasts are `size-panel-sm` wide (28rem, from 24rem), the menu grows to `size-panel-sm`, and the tooltip is half of `size-panel-md` (16rem, as before).

### Patch Changes

- 6280803: `elevation: "lifted"`: cards take a stronger, wider drop (three layers instead of two faint ones), so a lifted card visibly sits above the page and the preset reads differently from `outline`.

## 0.12.0

### Minor Changes

- a0043d5: New token `pad-inset` (half of `space-1`): the distance the corner maths assumes between a nested child and its container's edge. The rows of a list panel (`ESelect`, `ECombobox`, `ECommandPalette`, `ESearchResults`, `EMenu`) and the `EColorField` swatch keep their padding, but their corners are the container's radius less this (and the border), so a row's corner is 6px in an 8px panel instead of 4px and the two read as one shape.

  `ESegmented`: the hover and press ring is the piece's own border, so no strip of bare wash lies between it and the next piece. A chosen option in a disabled track is a flat tint with no edge of its own, inside the track's dashed edge.

  The `well` shadow is lighter on every control that has one (checkbox, switch and slider tracks, text fields, segmented track): 6% black instead of 10% in the default look, and softer in the bold and dark looks.

## 0.11.0

### Minor Changes

- 3338b52: Second audit pass: a spacing and interaction vocabulary, forms that behave like forms, and a long list of accessibility and robustness fixes. Pre-1.0, so the breaking changes are in a minor.

  **Conventions**

  - Spacing is now a semantic layer on the `space-N` scale: `gap-tight`, `-snug`, `-base`, `-loose`, `-section`, `pad-chip`, `-control`, `-control-sm`, `-cell`, `-card`, `-panel`, `gutter-min` and `gutter`. The parent owns the space between its children (`gap`, never a sibling margin). Components and the docs follow it, which fixes the cramped and misaligned toolbars and pagers on narrow screens. The rules are in `CONTRIBUTING.md`, "Design conventions".
  - One slab construction (`slab-thin`, `slab`, `slab-bold`, `--_lift`) replaces the five that had grown (gradient bands, bars, outer shadows). One interaction recipe (hover wash and ring, pressed ring, `transition-state`, one focus ring) applies to every control. Selected states are either a value you set (filled) or a place you are (outlined with a slab).
  - New utilities in `base.css`: `.e-slab`, `.e-interact`, `.e-selected--value`, `.e-selected--place`, `.e-disabled`, `.e-disabled-row`.

  **Tokens**

  - New: `gap-*`, `pad-*`, `gutter*`, `tracking-*`, `leading-*`, `type-*` font shorthands, `slab`, `slab-thin`, `slab-bold`, `stroke-ring`, `ring-hover`, `ring-press`, `transition-state`, `size-panel-sm|md|lg`, `radius-round`, `on-warning`, `duration-fade`, `easing-enter`, `easing-exit`.
  - Text sizes, control height and the icon, check and avatar boxes are now `rem`, so the browser's font-size setting applies. `textScale` still multiplies.
  - `shade-*` moved to the colour group. `surface-raised` and `surface-sunken` are removed (nothing used them). `selection` and `wash-ring` are retuned so they pass contrast.
  - `defineTheme`: new `preset` (`paper`, `ink`, `quiet`), `theme.explain(token)` and `theme.warnings` (ignored inputs, compact density with a small `controlHeight`, unknown tokens). The contrast checker now covers hover, pressed, soft and selected surfaces, evaluates `color-mix` tokens and reports pairs it cannot evaluate instead of skipping them. Derivations were adjusted so every default passes.
  - `tokens.css` follows `prefers-contrast`. The new `@eos-ui/tokens/tokens.auto.css` also follows `prefers-color-scheme`.

  **New components**

  `EForm` (error summary, focus the first invalid field, submitting state), `ECheckboxGroup`, `ESlider` (single and range), `EContainer`, `ETag`, `EMetric`, `EAvatarGroup`.

  **Forms**

  - Disabled controls no longer submit: the hidden inputs of `ENumberField`, `ECurrencyField`, `EOtpField`, `ECombobox`, `ESelect`, `EDatePicker`, `ERangePicker` and `ESignatureField` were still posting. Hidden inputs also carry the `form` attribute.
  - `readonly` on every control that had `disabled`. `ECheckbox`, `ESwitch`, `ESegmented` and `ESignaturePad` get the same `hint`, `error`, `required` and `optional` wiring as text fields.
  - `size`, `loading`, `clearable`, `counter`, `autocomplete` and `maxlength` on text fields. `ETextarea` can `autoGrow`. `ENumberField` follows typed text and clamps on blur or Enter. `EPhoneField` can post `e164` or `digits`.
  - `ESelect` can be `multiple`, `clearable` and `loading`. `ESelect`, `ERadioGroup`, `ESegmented` and `ECombobox` are generic over the option value.
  - `EDatePicker` and `ERangePicker` accept `valueFormat: "iso"`.
  - Breaking: `ESearchBar` renders `div[role=search]` instead of a `<form>`; Enter emits `submit` and never submits an enclosing form, and there is no default `name="q"`. `ESwitch` puts `class` and `style` on a wrapper `div` and its description is announced as a description, not as part of the name. `ESegmented` no longer emits `update:modelValue` on mount.

  **Accessibility and robustness**

  - `EDataGrid`: row checkboxes are named after the row, selection changes are announced, the header's controls are inert in card mode, the scroller is only a tab stop when it scrolls, rows stay (dimmed) while loading, new `error` state with `retry`. The mobile toolbar and pager now wrap and align. `ETable` gains `loading`, `empty` and `cards`.
  - `EDialog`: the footer stays in view with long content, `alertdialog` starts on the safe action (new `initialFocus`), new `size`. `EDrawer` gets `size` too and `left`/`right` warn in favour of `start`/`end`.
  - `EToastProvider`: announcements go through a live region, toasts pause while the tab is hidden, F8 focuses the region, Escape dismisses, `limit` caps the stack, no hydration warning. `useToast` gains `key` (dedupe), `update` and `promise`. A toast that never expires is always closable.
  - `EMenu`: link, label, checkbox, radio-group and submenu rows; keyboard focus is visible; `side` accepts `start` and `end`. `ECommandPalette`: `v-model:query` and `filter` for server-side search; Home and End move the caret.
  - `ETabs` no longer paint over a sticky header and cannot end up with nothing selected. `EAppShell` shows its sidebar in a drawer below 48rem. `EBreadcrumb` has `label` and `maxItems`. `ENavList` has nested groups, `disabled` and `isCurrent`. `EStepper` can be `interactive`, vertical and show errors. `EDisclosure` and `EExpandableRow` can be `disabled` and animate.
  - Right-to-left: Reka parts (menu, select, combobox, slider, dialog) now get the direction. `createEos({ locale })` sets `lang` and `dir`. New `useDir`.
  - Forced-colors keeps the edges of code blocks, search results and table headers. Messages with counts use plural forms, and sentences are no longer assembled from fragments.
  - `EProgress` is named "Progress" when determinate. `ESpinner` is always a status. `EButton` and `ELink` announce that a link opens in a new tab and a loading button announces itself.

  **Layout and text**

  - Breaking, can reflow: `EStack` defaults to `gap="base"` (12px, was 16px), `EInline` to `snug` and `EGrid` to `loose`. `gap` also takes the names. `EStack` gains `divider` and `wrapBelow`. `EStamp` no longer aligns itself in its parent.
  - `size="sm|md|lg"` on `ESurface`, `EText`, `EAvatar`, `ESpinner`, `EStamp`, `EKbd`, `EIcon`, `EButton` and `EIconButton` (the `small` and `large` flags still work). `EText` gains `tone`, `align`, `weight`, `mono`, `truncate`, `lines`. `EIconButton` gains `variant`, `loading` and `tooltip`.
  - `ENotice` has a `neutral` tone and a thicker accent border. `EEmptyState` gains `tone` and `size`. `EAvatar` gains `status`. `ESkeleton` gains `lines` and `circle`.
  - `ELink` messages: `opensInNewTab` is now `opensNewTab` (with the parentheses).

  **Build**

  - `style.css` is minified (21 kB gzipped, was 27 kB unminified). The layer order statement is kept at the top. The JavaScript budget rose by about 6% for the seven new components.
  - Removed `main` and `module` from `package.json` (the package is ESM-only; `exports` is enough). `llms/<Name>.txt` is published per component.

## 0.10.2

No changes in this release.

## 0.10.1

No changes in this release.

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
