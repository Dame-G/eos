# @eos-ui/tokens

## 0.20.0

### Minor Changes

- 77958d0: Gaps found polishing an app built on eos. Everything is additive; no existing spelling changes.

  - `ESheet`: `measure` (head, description and content kept to `--e-measure` and centred), `back` (a built-in Back button and a `back` event), `closeLabel`, `transition="slide" | "fade" | "none"` (a modal sheet no longer has to fade the page behind it in), and a long title ends in an ellipsis with its whole text as the `title` attribute.
  - `EListRow`: `expanded` sets `aria-expanded` on the row's button; `live` passed at all reserves the dot's gutter before the title and subtitle, so live and finished rows line up; `liveTone` colours the dot (`success`, `danger`, `warning`, `info`); `trailingStack` stacks two lines in the trailing slot; an `actions` slot puts buttons beside the row's own button without nesting controls.
  - `ECellRow` (new): a number and several independently chosen cells in an `EList`, for a move list. One tab stop; Left and Right step across cells, Up and Down keep the column; works in an `EVirtualList`. `EList` now moves focus by lines and cells, and leaves the arrow keys alone when they are pressed on a control beside a row.
  - `ETree`: `toggleOn="chevron"` separates selecting from opening, controls inside rows keep their own presses and keys, `dense`, `indent="sm"`, and `class` and attributes reach the root.
  - `EIconButton`: `href`, `to` and `linkComponent` make it a real link; `current` sets `aria-current="page"`; `size="xs"`.
  - `EButton`: `size="xs"`, a dense button (32px) that keeps a 44px hit area.
  - `ESegmented`: `stretch`, `multiple` (a group of toggles; the array is `v-model:values`) and `collapse` (a select in place of a track that does not fit).
  - `EProgress`: `hideLabel` and `hideValue`.
  - `EDialog` and `EDrawer`: `footer="row"` keeps the foot's buttons side by side at every width. `EActions` takes `stack="never"`.
  - `EConfirmDialog` (new): a yes or no question as an alert dialog, with a danger tone, focus on Cancel first, `loading` and `closeOnConfirm`.
  - `EEmptyState`: `align="start"`, and its parts no longer spread over a tall container (they sit together in the middle).
  - `EDisclosure`: `titleStyle="text"`. `ECheckboxGroup`: `columns`. `ENotice`: `retry`, `retryLabel`, `retrying` and a `retry` event. `EMetric`: `unit`.
  - Second round: `ECopyButton` `showLabel` and `copiedLabel` (a visible "Copy FEN" that becomes "FEN copied" with a check, announced); `ETabs` `flush` (square tabs on a full-width rule that the selected tab covers); `EList` `flush` (square rows); the `EDialog`, `EDrawer` and `ESheet` bodies keep bottom padding under the last control.
  - `EActions` now stacks a `bar` and `stack="narrow"` below 24rem of its own width instead of 32rem, so a dialog of any size keeps its buttons side by side and only a phone stacks them (`footer="row"` and `stack="never"` still opt out).
  - A disabled quiet `EButton` or `EIconButton` no longer draws the dashed box: it dims to `disabled-ink` and loses its underline. Other variants keep the dashed edge.
  - Icon: `refresh` (a name in every built-in alias table), shown on `ENotice`'s retry button.
  - Messages: `cancel` and `confirm`.
  - Tokens: `danger-ink`, danger red as text with 4.5:1 on the surface and on `surface-tint`. `info` no longer follows an orange or red brand onto the hue of `warning` or `danger`: in that case a theme gives it a blue of its own (and a blue `info-soft`), so the information and warning stamps differ in a dark theme.

## 0.19.0

No changes in this release.

## 0.18.0

### Minor Changes

- cc9e938: The default theme is blue again. `brand` is the logo blue, `#2c95b4`, and `brand-accent` the logo green, `#72c451`. Everything derived from them follows:

  - `primary` is a deep teal, `#005f7c`, with white text at 7.2:1.
  - `secondary` is a deep green, `#0d6600`, and `secondary-soft` is `#e5f9df`. `success` keeps its own green.
  - `primary-soft`, the tint of where you are, is the brand at 16% on `surface`: the tint now sits no further than 1.2:1 from the surface, so a saturated brand gives a soft tint rather than a fill.
  - `surface-tint`, `wash-hover`, `wash-press`, `selection` and `scrim` take the blue hue.
  - The default dark surface for `scheme: "auto"` is a blue-tinted near-black, `#10151a`. On it, `primary` is `#3ca1c1`, with black text.

  A theme that sets its own `brand`, `accent` and `surface` looks the same as before.

  The logo in `brand/` is the primary tile with a white e, and the word in the primary.

- cc9e938: One material language: Raised, Flush and Sunk.

  - **Floating surfaces are slabs.** `--e-shadow-float` (`--e-float` before the renames in this release) is the ring, a hard bottom edge twice `--e-depth` deep in the ring's own `--e-border` (edge and slab one piece, as on a button), and one faint drop, in place of four soft shadows. Popovers, menus, list panels, the date panel, dialogs and the command palette read as slabs lifted off the page; a toast, marked by its tone edge, floats on a plain ring and the drop. `elevation: "lifted"` stands cards on a slab of `depth` and widens the drop instead of adding soft card shadows; `"bold"` keeps 2px rings and deeper wells. Every shadow of a theme, the well included, is drawn in one shade.
  - **The slab is a dimension.** `defineTheme({ depth })` sets `depth` in px and derives `depth-thin` (half, at least 1px) and `depth-bold` (double). The `ink` preset stands on a 3px slab; `quiet` is a quiet slab (1px) on the outline elevation instead of soft lifted shadows.
  - **Round slab corners everywhere.** Every raised face (the current page, the chosen segment, a checked box, the switch, a tag, an expandable row, a pressable avatar) has bottom corners taller by its lift, so the face inside stays round; the tone edge of a notice, stamp and toast has start corners wider by `depth-bold`.
  - **The slab follows the face's height.** `depth-thin` up to `chip-height` (a checkbox, a radio, the switch, a slider thumb, a tag, a key), `depth` up to `control-height`. A checked box and a slider thumb now stand on the thin slab.
  - **The switch** rises on a thin primary slab when on, and its thumb is a surface face on a thin slab, like the slider's.
  - **A ladder of selection.** Hover is the neutral wash everywhere (a checkbox, radio or switch no longer previews the primary tint). Where you are is the pastel brand tint: `--e-primary-soft` is now built from `brand` and is the face of the selected tab, the current nav item, the current step and a calendar range. A value you set stays filled primary on its slab. Selecting a tab, segment or page no longer changes the label's weight, so it keeps its width.
  - **`ENavList`**: the current item is the place tint with a primary edge and no slab.
  - **`info-soft`** follows `primary-soft`, so an information notice, stamp or toast reads apart from a neutral one.
  - **The neutral slab**: `--e-slab-ink` is `border-strong` (4.5:1), so neutral slabs and sunk states (a toggled icon button) show in a dark theme, where the old value was about 1.1:1. Outline buttons, tags, keys, expandable rows and pressable avatars use it.
  - **Disabled** buttons, icon buttons, checkboxes, radios, the switch, tabs, segments and the slider draw their dashed edge as a `::before` over their own edge (text inputs keep their outline), so a page's focus or outline reset can no longer remove it.
  - **Motion**: every floating surface arrives with one shared pop-in (a short drop onto its slab over `duration-fade`); dialogs scale in over `duration-fade` too.
  - **Type**: `type-helper` and `type-count` put help text and counts on a 20px line; `h1` and `h2` take `tracking-tight`; the toast title is the `h4` style.
  - **Corners**: `--e-radius-row` is the 6px row corner (`radius-md` less `pad-inset`) and every nested row and small inset part uses it.
  - **`ETextarea`** takes `size` (`sm`, `md`, `lg`): its padding centres one line as a text field of that size does.
  - **`ECodeBlock`** shows overflow as a shade at the end edge (the left one in a right-to-left page), and draws no scrollbar on a touch screen.
  - **`EStamp`** has the same tinted space on both sides of its text, and in a column too narrow for it cuts its words with an ellipsis (the whole text stays for screen readers and shows on pointing) instead of running past its edge.
  - New tokens: `list-max-height`, `leading-helper`, `leading-chip`, `type-helper`, `type-count`. Removed tokens: `slab-edge` (unused), `tracking-snug` and `tracking-wide` (use `tracking-label`, or none). The layer order gains `e.state` after `e.page`, for the shared hover, press and disabled states.

- cc9e938: Printing. A page prints in its theme's light palette whatever the screen shows: every token a dark or high-contrast variant changes is set back under `@media print`, and `apply()` does the same with its own theme while the page prints. Colours print exactly, so a fill that carries meaning (a checked box, a switch that is on, a progress bar, a chosen day) is on the paper even where the browser leaves background graphics out. Headings stay with what follows them, paragraphs leave no lone line at a page edge, and cards, notices, fields, calendars, code blocks, images and table rows move to the next page rather than being cut. Open menus, list panels, date panels and tooltips are not printed.

  - `EDataGrid` prints as the table it shows: no search, filters, selection column, column tools, resizers or pager; only the sorted column keeps its arrow; the heading row repeats at the top of each page (a sort button there is laid out as text, since a repeated button is not painted).
  - `ETable` and `EDataGrid` headings are in the flow on paper, so they repeat on every page.
  - `ECodeBlock` wraps long lines instead of cutting them off.
  - `EDisclosure` and `EExpandableRow` print open, without the chevron.
  - `EUpload` leaves out an empty zone, the count and the files turned away.
  - `ELink` prints the address only of a link to another site (`http:`, `https:`); a path on the same site prints as its text.
  - `EAppHeader` prints as the brand alone: no actions, and a sticky header prints once.

- cc9e938: Theme application, the success tone and colour inputs.

  - `createEos()` without a `theme` applies nothing: `style.css` already carries the default theme, so a `:root { --e-primary: ... }` override in your own CSS wins, and the `prefers-contrast: more` variant of `style.css` applies. With a `theme`, the theme is added to the document as a stylesheet in the `e.tokens` layer (scoped to `themeTarget`) instead of inline custom properties, so your own CSS wins over it and its `scheme: "auto"` and `contrast: "auto"` variants follow the visitor. Unmounting the app removes the theme and stops the `lang` and `dir` watcher. `themeCss()` with no theme returns the theme `style.css` carries.
  - `success` and `success-soft` are their own colours, derived from a new `success` input of `defineTheme()`, instead of aliases of `secondary` and `secondary-soft`. `accent` now recolours only the secondary action. A theme that set `accent` to change success states: set `success` instead.
  - Colour inputs of `defineTheme()` accept 4 and 8 digit hex, `rgb()`, `rgba()` and `color-mix(in srgb, ...)`, besides 3 and 6 digit hex, `black` and `white`. Alpha is dropped. A colour it cannot read is ignored and listed in `warnings` instead of throwing.
  - `theme.apply()` returns a function that removes the inline tokens, `data-e-theme` and its media listeners, and works where `matchMedia` does not exist.
  - `defineTheme()` warnings are no longer printed in production builds: the check reads `process.env.NODE_ENV`, which bundlers replace.
  - New exports from `@eos-ui/tokens`: `darkVariant(input)` (the inputs of a theme's dark variant) and `themeVariant(theme, { dark, more })` (the tokens and `color-scheme` a visitor with those settings sees), with the `VariantQuery` type.
  - `EConfigProvider` renders menus, dialogs, tooltips and toasts inside itself only when it sets a `theme` or `scheme` (`portal` was `true` by default). It follows `prefers-contrast: more` for a theme with `contrast: "auto"`, and `scheme` picks the dark variant of a built `Theme` made with `scheme: "auto"`.
  - `tokens.json` no longer has the top-level `name` and `version`, `color.themes` or `type.fonts`, which nothing read.
  - Usage notes corrected for `stroke-edge`, `weight-strong`, `primary-soft`, `radius-pill`, `radius-sm`, `radius-lg`, `secondary`, `secondary-soft` and `space-5`, `space-10`, `space-16`.

- cc9e938: New export `themeInputs`: every input of `defineTheme()` as `{ name, doc, type }` (with the `ThemeInputDoc` type), generated from the `ThemeInput` interface and its doc comments at build time, so documentation and tooling can list the inputs without parsing the source. A preset type is spelled out as its values (`'"standard" | "high" | "auto"'`).
- cc9e938: A toast has no slab: its tone edge already marks it, so it floats on a plain `border` ring and the theme's drop. The slab under every other floating panel is now the colour of its ring (`border`), no longer the darker `slab-ink`.

  New token `shadow-drop`: the wide, faint drop under a floating panel, set by `elevation`. `shadow-float` is now its ring, its slab and `var(--e-shadow-drop)`, so a panel that draws its own edge (a toast) can keep the theme's lift.

- cc9e938: Token names follow one scheme, `<family>-<role>[-<step>]`, and a few magic numbers become tokens.

  Renamed (set the new name in your CSS and in `defineTheme({ tokens })`; the `defineTheme` inputs keep their names):

  | Old                               | New                                   |
  | --------------------------------- | ------------------------------------- |
  | `--e-text-link`                   | `--e-link`                            |
  | `--e-warning-strong`              | `--e-warning` (it was an alias of it) |
  | `--e-icon-size`                   | `--e-icon-size-md`                    |
  | `--e-icon-size-md` (1.75rem)      | `--e-icon-size-lg`                    |
  | `--e-icon-size-lg` (2.5rem)       | `--e-icon-size-xl`                    |
  | `--e-size-panel-sm`, `-md`, `-lg` | `--e-panel-width-sm`, `-md`, `-lg`    |
  | `--e-size-list-max`               | `--e-list-max-height`                 |
  | `--e-frame`                       | `--e-shadow-frame`                    |
  | `--e-well`                        | `--e-shadow-well`                     |
  | `--e-float`                       | `--e-shadow-float`                    |
  | `--e-paper`                       | `--e-shadow-paper`                    |
  | `--e-slab-sink`                   | `--e-shadow-sink`                     |
  | `--e-ring-hover`                  | `--e-shadow-ring-hover`               |
  | `--e-ring-press`                  | `--e-shadow-ring-press`               |
  | `--e-focus-gap-field`             | `--e-stroke-focus-gap-field`          |
  | `--e-underline-offset`            | `--e-stroke-underline-offset`         |
  | `--e-slab-thin`                   | `--e-depth-thin`                      |
  | `--e-slab-bold`                   | `--e-depth-bold`                      |

  The icon sizes moved by one step, so each `EIcon` `size` reads the token of its own name (`sm`, `md`, `lg`, `xl`). Mind the order when you replace them: `--e-icon-size-md` and `--e-icon-size-lg` still exist, with new values. `--e-depth`, `--e-depth-thin` and `--e-depth-bold` are their own `depth` group in `groups` and the DTCG output (they were under `stroke`), and the shadows are all `shadow-*`, so `--e-paper` no longer reads like the `--e-surface-paper` colour.

  New tokens: `z-header` (the sticky `EAppHeader`, which no longer computes its own layer), `avatar-size-md` (the default `EAvatar`, 2.75rem, in place of the 44px tap target, so it follows `textScale` like the other avatar sizes), `container-width-sm`, `-md` and `-lg` (the `EContainer` `width` steps, 40, 60 and 80rem) and `term-width` (the 8rem label column of `EDescriptionList`).

## 0.17.1

### Patch Changes

- e5fc23f: `surface-tint` in a dark theme carries the same light touch of the brand hue as in a light one (chroma 0.02, up from 0.01; never more than the brand has), and the hover and press fills follow.

## 0.17.0

### Minor Changes

- 337fcbb: `surface-tint`, the second ground (wells, table headers and stripes, footers, the ground beside the page column in `EAppShell`), is now deeper in a light theme (0.1 of lightness below the surface, `#dfdbea` by default) and carries a light touch of the brand hue: chroma 0.02 in a light theme and 0.01 in a dark one (never more than the brand has, so a grey brand stays grey). The default `border` darkens (`#7c8c93` to `#6d7d84`) to keep 3:1 on it, and a derived theme's border follows. `EAppShell` uses the token directly.

  `wash-hover` and `wash-press`, the hover and pressed fills that rows, menu items, tabs, quiet buttons, disclosures and the selected nav item share, are now made of the same tint instead of a wash of `ink`. They stay translucent (the pigment is the colour that is exactly `surface-tint` at 50% over `surface`): a hovered row on a plain ground is the tinted ground, and on one that is already tinted (a striped row, a segmented track) it goes one step deeper, so there is always something to see. Primary text is also checked against the selected-row fill in `fitFeedback`.

## 0.16.0

No changes in this release.

## 0.15.1

No changes in this release.

## 0.15.0

No changes in this release.

## 0.14.1

No changes in this release.

## 0.14.0

### Minor Changes

- 4db204d: The default theme is pastel lavender. `brand` is `#bfa8f5` and `brand-accent` a pastel mint, `#9ad9b4`. Everything derived from them follows:

  - `primary` is a deep violet, `#624b90`, with white text at 7.2:1.
  - `secondary` is `#266444`.
  - `surface-tint`, `secondary-soft`, `selection` and `scrim` take the new hues.
  - The default dark surface for `scheme: "auto"` is a violet near-black, `#15121b`. On it, the action colour is the lavender itself, with black text.

  A theme that sets its own `brand`, `accent` and `surface` looks the same as before.

  The logo in `brand/` is the lavender tile with a deep violet e.

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
