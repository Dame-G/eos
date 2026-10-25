# @eos-ui/vue

## 0.17.1

### Patch Changes

- 98b3901: ESlider: the thumb has a page-surface face on its primary slab instead of black, and its bottom corners take taller vertical radii so the sides keep their full width.
- 64f27d3: Generated ids can no longer collide with the ids a component derives from another generated id. The path Vue builds (`v-0-0`) had its dashes turned into underscores in `useUid`: one component's first option was `e-v-0-0` plus `-0`, and a component in a later async boundary of the same page was `e-v-0-0-0` itself, so a label's `for` pointed at the wrong control (on the docs site, clicking the Masonry switch of the Grid demo selected the Light option of the preview colour scheme instead).
- Updated dependencies [e5fc23f]
  - @eos-ui/tokens@0.17.1

## 0.17.0

### Minor Changes

- 337fcbb: `surface-tint`, the second ground (wells, table headers and stripes, footers, the ground beside the page column in `EAppShell`), is now deeper in a light theme (0.1 of lightness below the surface, `#dfdbea` by default) and carries a light touch of the brand hue: chroma 0.02 in a light theme and 0.01 in a dark one (never more than the brand has, so a grey brand stays grey). The default `border` darkens (`#7c8c93` to `#6d7d84`) to keep 3:1 on it, and a derived theme's border follows. `EAppShell` uses the token directly.

  `wash-hover` and `wash-press`, the hover and pressed fills that rows, menu items, tabs, quiet buttons, disclosures and the selected nav item share, are now made of the same tint instead of a wash of `ink`. They stay translucent (the pigment is the colour that is exactly `surface-tint` at 50% over `surface`): a hovered row on a plain ground is the tinted ground, and on one that is already tinted (a striped row, a segmented track) it goes one step deeper, so there is always something to see. Primary text is also checked against the selected-row fill in `fitFeedback`.

### Patch Changes

- 337fcbb: Buttons (and the nav item for the current page, the chosen calendar day and Kbd) no longer have a diagonal-looking bottom corner. With a slab thicker at the bottom than at the sides, one `border-radius` made the face's inner corner a flattened ellipse. The bottom corners are now as much taller than wide as the slab is thick, so the face has a true circular corner like the top ones.
- Updated dependencies [337fcbb]
  - @eos-ui/tokens@0.17.0

## 0.16.0

### Minor Changes

- a12ac4c: ENotice: closed on every side (a border on the inline-end edge too) and follows the theme's corner radius, like the other components, instead of being square.
- af48b28: EAppShell: the ground beside the page column is the brand colour mixed into the page background, not `surface-tint`, so it reads against the column in a light theme.

### Patch Changes

- 48fb447: Pressable controls no longer select the text around them when clicked, double-clicked or shift-clicked: every button, summary and element with a button, tab, switch, menu item, option or combobox role is covered, not only a list of known classes.
- a12ac4c: Select and Combobox: the list panel is at least as wide as the field and grows to fit its rows, so a selected row's check no longer overlaps its label in a narrow field.
- @eos-ui/tokens@0.16.0

## 0.15.1

### Patch Changes

- 9d78c47: ECombobox: a bare `multiple` (`<ECombobox multiple>`) now turns multiple on; it was ignored, so the field acted as a single choice. Option rows in a Select or Combobox list have a small gap between them.
- @eos-ui/tokens@0.15.1

## 0.15.0

### Minor Changes

- c5ffbd0: ENotice: full width and square, so it sits against the edge of its container. It keeps the tone slab, the top and the bottom, and drops the end edge and the rounded corners.

### Patch Changes

- d8e8f5f: ESegmented: bringing the chosen option into view no longer scrolls past the ends of the track, which on iOS Safari left empty space before the first option.
- @eos-ui/tokens@0.15.0

## 0.14.1

### Patch Changes

- 714986f: `ENavList`: in a vertical list, each section heading has a full-width hairline under it, so the heading reads as the head of its section.
- @eos-ui/tokens@0.14.1

## 0.14.0

### Minor Changes

- 4db204d: The default theme is pastel lavender. `brand` is `#bfa8f5` and `brand-accent` a pastel mint, `#9ad9b4`. Everything derived from them follows:

  - `primary` is a deep violet, `#624b90`, with white text at 7.2:1.
  - `secondary` is `#266444`.
  - `surface-tint`, `secondary-soft`, `selection` and `scrim` take the new hues.
  - The default dark surface for `scheme: "auto"` is a violet near-black, `#15121b`. On it, the action colour is the lavender itself, with black text.

  A theme that sets its own `brand`, `accent` and `surface` looks the same as before.

  The logo in `brand/` is the lavender tile with a deep violet e.

### Patch Changes

- Updated dependencies [4db204d]
  - @eos-ui/tokens@0.14.0

## 0.13.1

### Patch Changes

- bf2cb90: The library's name is written in lowercase, eos, in the package descriptions, READMEs and generated `llms.txt`. Nothing in the API changes.
- Updated dependencies [bf2cb90]
  - @eos-ui/tokens@0.13.1

## 0.13.0

### Minor Changes

- 4852210: Form inputs audit.

  - `EForm` checks every control on submit. `ECheckbox`, `ESwitch`, `ESegmented`, `EFieldset` (and so `ECheckboxGroup` and `ERadioGroup`) and `ESignaturePad` register their `error`. An empty required `ESelect` or `ESignaturePad` stops the submit with the browser's own message. An empty required `ERadioGroup` is listed once, by its label. `useFormField` takes a `check` for a custom control.
  - `ENumberField` has `locale`, and `ECurrencyField` passes its `locale` on, so the separators and reading typed text follow it, not only the symbol.
  - `ESelect`, `ECombobox`, `EDatePicker` and `ERangePicker` take `size`. `ECheckboxGroup` and `ERadioGroup` take `id` and `orientation`. `ECombobox` emits `clear`. `ETextarea` documents `name`.
  - `clearable` is off by default in every field, `ESearchBar` and `ECombobox` included: pass `clearable` to show the button.
  - `EUpload`: the `files` event is removed (it repeated `v-model`). The prompt is one message, `dropFile`, with `{choose}`, in place of `dragHere`.
  - `EDatePicker` and `ERangePicker` post nothing while the typed date cannot be used, and keep the consumer's `form` attribute, as does `ESignatureField`. `ERangePicker`'s placeholders show the date format.
  - `@focus` and `@blur` on `EOtpField`, `ERangePicker` and `ESegmented` fire as focus enters and leaves the field (`useFieldAttrs().group()`).
  - `EOtpField`'s arrow keys follow the boxes in a right-to-left page. `ESegmented` does not smooth-scroll under reduced motion (`useReducedMotion`, shared with `ETabs`) and always renders one wrapper (`.e-seg-field`), which takes `class` and `style`.
  - A read-only `ESelect` looks read-only and has no arrow. The rows of a disabled `ECheckboxGroup`, `ERadioGroup` or `ESignatureField` look disabled. `ERadioGroup` describes an option with its `description` instead of folding it into the name.
  - Invalid ARIA removed: `aria-readonly` on `ECheckboxGroup`'s fieldset and `EUpload`'s file input (described as "Read only" instead), `aria-invalid` on `ESignaturePad`'s image.
  - `ECombobox` only keeps the field open for its own list, and the multi-select input height comes from the tokens. `ESignatureField`'s Type and Draw switch is read-only, not disabled. `ESlider` keeps the last tick with a decimal step.

- 4852210: **Development warnings no longer ship to production.** `isProduction()` guarded its lookup with `typeof process`, which bundlers leave in place, so it was false in every browser bundle. It now reads `process.env.NODE_ENV` alone, and `check:dist` bundles it both ways to prove it.

  **Per-component paths.** `@eos-ui/vue/components/EButton` (any component), `@eos-ui/vue/plugin` (`createEos`, `themeCss`) and `@eos-ui/vue/icons/builtin`. They are the modules the root exports, so mixing them is safe. The built-in Phosphor set (about 9 kB gzipped) is now registered by the package root instead of imported by the config, so an app that imports only per-component paths does not bundle it; `import "@eos-ui/vue/icons/builtin"` brings it back. Importing the root behaves as before, with or without the plugin.

  **Global component types are opt-in.** `createEos()` registers no components, so `GlobalComponents` moved to `@eos-ui/vue/globals` (`import type {} from "@eos-ui/vue/globals"` after `app.component(...)`). A component you forgot to import now fails `vue-tsc` instead of failing at run time. `$e` is still typed by the package.

  **Internal composables are no longer exported:** `useSize`, `useDetails`, `useFieldControl`, `useFormField`, `FORM_KEY`, `isApple` and `localeDirection`. They were undocumented helpers for the components. `focusInside` still is, from one file.

  **Icon components in `createEos({ icons: { icons } })` stay raw** instead of becoming reactive proxies.

  **New:**

  - `ELinkCard`: a card that is one link (`title`, `href`/`to`/`linkComponent`, `external`, `as`, `size`), the whole card the click target, with a border that hover recolours and never thickens.
  - `EConfigProvider`: a scoped config for part of the page. Inherits the parent config and overrides `theme`, `scheme`, `locale`, `currency`, `dir`, `messages` and `icons`; the theme's tokens go on its element, and floating parts opened inside render inside it (`portal`).
  - `EAppHeader` `brand`, `brandHref`, `brandTo`, `brandLabel`, `linkComponent` and a `brand` slot: a styled home link.
  - `EDefinition` `inline`: the term in running text, without the info icon.
  - `createEos({ applyTheme: false })`: leaves the theme to CSS the page ships itself.
  - `EToast` and `ToastTone` take `neutral`. `EText` takes `tone="neutral"`. `ESurface` takes `variant="tinted"`. `EAvatar` takes `presence`. `EDescriptionList` items take `stamp` and `stampTone`.
  - Shared `Size`, `Tone` and `ElementTag` types; each component narrows them with `Extract`, and every polymorphic `as` takes an `ElementTag`.

  **Fixes:**

  - `EInline` and `EGrid` with `as="ul"` or `"ol"` drop the bullets and padding and keep the list role, as `EStack` does.
  - A sticky `EAppHeader` sits above anything the page raises (a sticky table head, a focused control) and below every overlay. It was level with a sticky table head.
  - A dialog or select no longer shifts a page that sets `scrollbar-gutter: stable`: the scroll lock does not pad the body there.
  - `EAvatar` capitalises its initials in the configured locale.

  **EIcon sizes.** The default is now an explicit `md` = 20px, with `sm` 14px, `lg` 28px and `xl` 40px. `sm` and the default keep their size. An explicit `size="md"` was 28px and is now 20px: write `size="lg"` for 28px. `size="lg"` was 40px and is now 28px: write `size="xl"` for 40px.

  **Repository:** the root build builds the tokens once, `pnpm ssr` renders every component on the server from the build (in `check:built` and the smoke test), the accessibility matrix covers every tone of Tag, Stamp, Text and Metric with Highlight and Kbd, and `check:icon-aliases` checks the Iconify aliases (needs the network).

- 4852210: Overlays, navigation, feedback and data: fixes from the audit.

  **Overlays**

  - `EDialog`, `EDrawer`, `ECommandPalette`: a press on a toast no longer counts as a press outside, so dismissing a toast leaves a dismissible dialog (and the palette) open.
  - `inline` previews of `EDialog` and `EDrawer` now ignore Escape, presses outside and focus moving out.
  - `ECommandPalette` emits `close` when a command is chosen and when the shortcut closes it, not only on Escape and the backdrop.
  - `ETooltip` emits `close` only when the person hides it. Setting `open` to false no longer fires it, matching `EDialog`, `EDrawer` and `EMenu`.
  - `EMenu` `side` takes `start` and `end`, which follow the reading direction, in place of `left` and `right`. The side mapping is shared through the new `useLogicalSide()`, exported next to `useDir()`.
  - `useOverflow(scroller, watch, { children: true })` also watches the scroller's children. `EDialog` and `EDrawer` share one body built on it.

  **Toasts**

  - `EToastProvider`: closing a toast with its button moves focus to the next toast, or back to where it was, instead of dropping it to the page. The region shows a focus ring when F8 focuses it.
  - `EToast`'s dismiss button now uses the `dismiss` message ("Dismiss"), as `ENotice` does, in place of "Close notification". The `closeToast` message is removed. Panels (dialog, drawer, the Columns menu) keep `close`.

  **Data**

  - `EDataGrid` no longer depends on `@tanstack/vue-table`: filtering, sorting, paging and selection are plain computeds. Behaviour is unchanged. `@tanstack/vue-virtual` stays for `virtual`.
  - `EDataGrid` as cards (below 40rem) now shows the `filterable` filters above the rows, labelled by column, as the sort moves to a menu.
  - `EDataGrid` with `manual`: `searchDebounce` also waits for typing in text and number filters.
  - `EDataGrid`'s error state uses the icon name `alert`, so every icon set draws it.
  - `ETable`: the loading status region stays in the page and only its text changes, so screen readers hear it. `skeletonRows` defaults to 5, as in `EDataGrid` (was 3).

  **Navigation and feedback**

  - `EStepper`: a `disabled` interactive step stays focusable with `aria-disabled`, as `EPagination` does, instead of leaving the Tab order. The brackets around the screen-reader words are now in the `done` and `stepError` messages ("(done)", "(has an error)"): if you translated them, add brackets if you want them.
  - `EPagination`: an empty `label` falls back to "Pagination", as `EBreadcrumb` and `EStepper` do.
  - `EProgress`: the indeterminate bar slides from the start edge in a right-to-left page too, and the percentage is formatted in the configured locale.

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

### Patch Changes

- 6280803: `EDisclosure`, `EExpandableRow` and `ENavList` groups: while the content slides open or shut it is clipped exactly at the moving edge, so text no longer shows below a closing panel. The clip gives way by `gap-snug` (for focus rings) only once the panel is open.
- 6280803: `EStamp`, `ETag` and `EKbd` stay as wide as their content as the child of a grid or a column (an `EStack`, a pattern's card), instead of stretching to its width.
- 4852210: `ESelect`: a select rendered open from the first render (`open` set) no longer throws `document is not defined` in a server render.
- 6280803: `EStamp` centres its capitals with `text-box` where the browser supports it, so the word sits in the middle with any font, size or text scale. Other browsers keep the small nudge above the text.
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

- Updated dependencies [6280803]
- Updated dependencies [6280803]
- Updated dependencies [4852210]
  - @eos-ui/tokens@0.13.0

## 0.12.0

### Minor Changes

- a0043d5: `ETag` is a paper tag: a small square-cornered label with a thin slab edge, in place of the pill. A tag names a category, so its tones are quiet: they colour the text, and the tag keeps the neutral surface and edge. Use `EStamp` for a status.

  `ECombobox` draws its chosen options with `ETag`, so they match tags everywhere else. Its own chip styles are gone.

  The character counter under `ETextField` and `ETextarea` stays on one line at the right edge of the field. A long hint wraps beside it instead of squeezing it, and on a narrow field the counter drops below the hint, still at the right.

  `EStamp` is a soft tint of its tone, as a Notice is: the word in the tone's colour, an edge in the same colour and a thick side on the inline-start edge, which flips in a right-to-left page. The `final` stamp, which is a ring, has none of this.

  `EStamp`: the word and the detail share a line height, so their text sits on one line (the capitals no longer ride above the detail).

### Patch Changes

- a0043d5: `EAppShell`: the ground beside the page column is tinted (`surface-tint`), and the column keeps the page background. `EAppFooter` has the same `surface` background as `EAppHeader`.
- a0043d5: Corners are concentric: a rounded element inside a rounded, bordered one now has the container's radius less the distance between their edges, so the curves share a centre (a thumb on a track, a picture in an avatar ring, an option in a panel). It holds under every `radius` setting and in a scoped theme. The rule is in `CONTRIBUTING.md`, "Corners".
- a0043d5: `EDisclosure`: hovering or pressing the summary line washes it like a row, and the title keeps its ink. The link-style colour change and underline are gone.
- a0043d5: `EFieldset` with `bare`: the controls are spaced like the boxed and section groups. They had no gap between them.
- a0043d5: New token `pad-inset` (half of `space-1`): the distance the corner maths assumes between a nested child and its container's edge. The rows of a list panel (`ESelect`, `ECombobox`, `ECommandPalette`, `ESearchResults`, `EMenu`) and the `EColorField` swatch keep their padding, but their corners are the container's radius less this (and the border), so a row's corner is 6px in an 8px panel instead of 4px and the two read as one shape.

  `ESegmented`: the hover and press ring is the piece's own border, so no strip of bare wash lies between it and the next piece. A chosen option in a disabled track is a flat tint with no edge of its own, inside the track's dashed edge.

  The `well` shadow is lighter on every control that has one (checkbox, switch and slider tracks, text fields, segmented track): 6% black instead of 10% in the default look, and softer in the bold and dark looks.

- a0043d5: ELink: hover and press only turn the text to ink. The background wash is gone, since the underline and the colour change already answer the pointer.
- a0043d5: `EStamp`: the capitals sit in the middle of the stamp. A line box centres capitals high, so the word and the detail have a little space above the text. `ETabs`: the selected tab's edges are as thick as a focused field's outline (2px by default) instead of the slab depth, on all four sides.

  `ECheckbox` and `ERadioGroup`: an unchecked box or radio has no well (the inset top shadow); the fill and edge are unchanged. `ESwitch`: the thumb is plain (no border or slab), and the track is flat on or off, so the thumb sits at the same height. `ESegmented`: every option draws its own edge and the track draws none, so corners are drawn once; the track clips only when it scrolls.

  `ETabs` and `ESegmented`: an inactive tab or option answers the pointer the same way: ink text, a wash and a darker edge of the same width (no ring is added, so the edge never gets thicker).

- Updated dependencies [a0043d5]
  - @eos-ui/tokens@0.12.0

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

### Patch Changes

- Updated dependencies [3338b52]
  - @eos-ui/tokens@0.11.0

## 0.10.2

### Patch Changes

- d08bd18: `ETabs`: the selected tab in a vertical list has the same border thickness on all four sides, matching the horizontal list. The side facing the panel was thinner.

  In a horizontal list the selected tab's slab, which faces the panel, no longer changes colour on hover. In a vertical list the outer slab still darkens.

  `EDisclosure`: the space between an open disclosure's title and its content is smaller, so the title sits right above the content.

  `ERadio`: the border around a checked radio is an even ring, so it no longer looks choppy. The slab under it is drawn as a smooth crescent along the bottom.

- @eos-ui/tokens@0.10.2

## 0.10.1

### Patch Changes

- 4414068: `ETabs`: the selected tab in a vertical list has the same border thickness on all four sides, matching the horizontal list. The side facing the panel was thinner.

  In a horizontal list the selected tab's slab, which faces the panel, no longer changes colour on hover. In a vertical list the outer slab still darkens.

  `EDisclosure`: the space between an open disclosure's title and its content is smaller, so the title sits right above the content.

- @eos-ui/tokens@0.10.1

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

### Patch Changes

- Updated dependencies [8c29cfc]
  - @eos-ui/tokens@0.10.0

## 0.9.0

### Minor Changes

- 28e41d2: EDialog and EDrawer take a `description` prop, shown under the title and wired through `aria-describedby`, and a `role` prop that can be `alertdialog` for confirmations. A consumer's own `aria-describedby` is no longer overridden. Toasts raised while a modal dialog is open are no longer hidden from assistive technology and can be clicked. EDrawer's slide uses `--e-duration-move`, so the motion presets apply. The toast docs now say that `createEos()` already provides `useToast()` everywhere.
- 5d6bbe1: `ETabs` takes a `label` that names the tab list. A disabled `ESearchBar` now has the dashed disabled look and no hover fill. `ECheckbox`, `ERadioGroup` and `ESegmented` show an error with a red edge. `ESelect`, `ESegmented`, `ERadioGroup` and `EOtpField` expose `input` and `focus()`, and `ECombobox` exposes `input` as an element rather than a function.
- 865c379: ENumberField and ECurrencyField read and write numbers with the configured locale, so a decimal comma works in French and German instead of being dropped (`1,5` no longer becomes 15). The number spinbutton also answers Home and End (min and max) and PageUp and PageDown (steps of ten).

  ETextField, EPasswordField, ETextarea, ENumberField, ECurrencyField and EDatePicker have a `readonly` prop. The input is readonly, the number buttons and keys and the date calendar do nothing, and the prefix and suffix wrap gets the same tinted look as a bare readonly input.

- ee9f749: A message can now be a plural object (`{ one, other }` and the other `Intl.PluralRules` categories). `t()` picks the form from `n` using the configured locale, and a plain string still works. `resultsCount`, `rows` and `rowsAnnounce` use it, so the command palette and data grid no longer read "1 results" or "1 rows". `messages` in `createEos()` accepts either form. The unused `you`, `team`, `automatic` and `activity` messages are removed, and the month and year button label now reads "Change month or year, currently {month} {year}". Docs: "EOS" spelling, accurate bundle size and plugin option lists, no semicolons in prose.

### Patch Changes

- 5e89142: The hidden screen-reader region no longer adds a pixel of scroll height. A page exactly one screen tall showed a scrollbar after the first "Copied" or other announcement.
- fe12618: A button avatar fills with a darker tint on hover, as well as darkening its edge.
- a7bf4d0: The label notes on ESelect and ECombobox read in the same voice as the other prop notes and no longer describe the label as a kicker.
- 16ef3a2: EHighlight has a faint tint of its accent colour behind the text. It is paint only, so the text takes the same room as before.
- 02ea38e: Body text on a mid-grey surface no longer reports a contrast issue when neither black nor white can reach 7:1. The target there is the best of the two, which is always above 4.5:1.
- 88f0f59: `defineTheme` now gives readable action colours on mid-tone surfaces such as `#9e9e9e` and `#808080`. Before, the primary, secondary, danger and warning colours came out near white next to a white label. Each now tries both darker and lighter, and flips the label between black and white when that is the only way to hold the contrast. Themes that already passed keep their colours. The default `border` is a shade darker (`#7c8c93`) and derived borders are adjusted so the outline holds 3:1 on `surface-tint` as documented. `checkContrast` now follows `var(--e-name)` references, which it skipped before, and also checks `focus-ring`, `focus-field`, `muted` on `surface-tint` and `border` on `surface-tint`. Body text between about `#5c5c5c` and `#959595` cannot reach 7:1 in black or white, so a theme on those surfaces still reports `ink` on `surface` and `background`.
- 16ef3a2: Disabled Select and Combobox fields no longer show the chevron, and a disabled field's chips and Upload's "choose one" link are neutral instead of primary.
- a7bf4d0: The props tables in the component READMEs show None in the Default column for a prop with no default, instead of a dash.
- a7bf4d0: The range summary in ECalendar reads "(1 day)" for a one-day range instead of "(1 days)". `rangeDone` is now a plural message and takes `n`. An override that uses `{days}` keeps working.
- 5a23c12: The switch thumb has a softer slab under it.
- 301f236: Line heights follow the text scale. EText, ENotice, EToast, EStamp, ETabs, ENavList, EBreadcrumb and the checkbox and radio labels set their line height as a ratio of the font size, so a theme with a `textScale` of 1.5 or more no longer packs lines on top of each other. Rendering at the default scale is unchanged.
- da438e1: Upload applies `accept` and `multiple` to dropped files, announces added, rejected and removed files, lets each file be removed, shows sizes in the locale and shows the danger edge when invalid. Combobox returns focus to the input and announces a removed chip. Progress clamps `aria-valuenow` and sets `aria-valuetext` from `valueText`.
- e0dd5e3: Tidy the wording of the docs for A to D components.
- e450528: Tidy the wording of the docs for P to V components.
- 6d1bd7b: Tidy the wording of the docs for D to P components.
- Updated dependencies [02ea38e]
- Updated dependencies [88f0f59]
- Updated dependencies [301f236]
  - @eos-ui/tokens@0.9.0

## 0.8.1

### Patch Changes

- e6e03e5: In a boxed EFieldset, the Required or Optional word now sits at the right end of the line, with the outline running between it and the title, instead of right after the title.
- 689bc82: An inline EDialog (the preview form) no longer moves focus when it opens or closes. Closing one used to send focus back to whatever had it when the dialog mounted, such as a tab, which then switched to that tab.
- 253fdac: The selected tab's edges are now as thick as its slab all round: the sides in horizontal and vertical lists, and the top in a horizontal list.
- @eos-ui/tokens@0.8.1

## 0.8.0

### Minor Changes

- 21fcda1: Redesign the loading components and the small controls so they match the buttons. EProgress is a flat bar on a tinted track with moving stripes on the part still to do. ESpinner and the loading EButton share one ring: an arc travelling round a track of faint dashes (the button drops its moving stripes). ESkeleton loses its outline and becomes a faint neutral tint that keeps the original pulse. Checkboxes, radios and switch thumbs are button faces with a slab, and a mixed checkbox now shows a dash. Kbd is a keycap, pressable EAvatar has a slab, EStepper has rounded-square dots with a plain tint on the current step, and the ESegmented slab is deeper.

### Patch Changes

- @eos-ui/tokens@0.8.0

## 0.7.1

### Patch Changes

- 65271f4: The package description and README open with "A component library for Vue."
- @eos-ui/tokens@0.7.1

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
