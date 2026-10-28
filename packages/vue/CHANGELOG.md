# @eos-ui/vue

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

### Patch Changes

- Updated dependencies [77958d0]
  - @eos-ui/tokens@0.20.0

## 0.19.0

### Minor Changes

- 2dcf295: Patterns for dense app workspaces: a side sheet, a popover, list rows, a tree, a virtual list and a stat link.

  - `ESheet`: a panel docked over one side of its positioned container (or the window with `viewport`) that leaves the content beside it usable. Focus moves to its title on open and back to the opener on close; Escape closes it from anywhere unless a menu, popover or dialog is open over it. `modalBelow` (such as `48rem`) makes it a full-window modal on narrower screens. Slots: `default`, `leading` (a Back button), `actions`.
  - `EPopover`: a non-modal panel anchored to a trigger you provide in the `trigger` slot, which receives `aria-haspopup`, `aria-expanded` and `aria-controls`. It flips when there is no room, closes on Escape or an outside press, and Up, Down, Home and End move between its controls. `side` and `align` place it.
  - `EList` and `EListRow`: a keyboard-navigable list with one tab stop (Up, Down, Home, End), either a list of buttons or links with one `aria-current` row (`mode="current"`) or a listbox with one `aria-selected` row (`mode="select"`). `followFocus` chooses the row focus moves to. A row has a `title`, a muted `subtitle`, `leading` and `trailing` slots and a `live` mark.
  - `ETree`: nested rows drawn as list rows, on Reka's tree: `v-model` (the selected `id`), `v-model:expanded`, Right and Left to open, close and move between levels.
  - `EVirtualList`: renders only the rows in view, with a fixed `rowHeight` or `measure`d rows. Inside an `EList`, the list's keys reach rows that are not rendered yet.
  - `EStatLink`: a compact link showing a label and one figure in mono ("You 1,840"), with `href`, or `to` and a `linkComponent`, and `current`.
  - New message `live` ("Live").

### Patch Changes

- 2dcf295: `EAppShell`: its one column is `minmax(0, 1fr)`, so a long line in the header, the page or the footer no longer widens the page past a phone's screen.
- @eos-ui/tokens@0.19.0

## 0.18.0

### Minor Changes

- cc9e938: Follow-ups to the audit: forced colours, private properties, file names and plugin cleanup.

  Breaking (rename or remove, then update every use):

  - `ESegmented` shows its `label` above the control by default, as a field does. `showLabel` is removed; pass `hideLabel` to keep the label for screen readers only (the old default).
  - `useLocale()` no longer returns `dir`; use `useDir()`.
  - `createEos({ themeTarget: null })` applies nothing to the document: no theme stylesheet, `lang` or `dir`. It used to fall back to `<html>`.
  - The private `--e-ring` property of text inputs, selects and `EOtpField` is now `--_ring`. Only tokens and the documented hooks `--e-header-height` and `--e-xrow-lead` use the `--e-` prefix.

  Fixed:

  - Forced colours (Windows High Contrast): the rules moved from `base.css` into each component's own layer, where the components' rules no longer override them. An invalid field draws a heavier edge, a disabled button, icon button, checkbox, radio or switch a GrayText dashed edge, a checked switch a Highlight track edge and a HighlightText thumb, and a selected tab a Highlight edge; checks, switches, tabs and the buttons inside a field ring in Highlight when focused; a dialog, drawer or surface draws its outline. A count inside a selected tab is no longer painted in theme colours.
  - Unmounting the app puts back the `lang` and `dir` that `createEos` wrote on the theme target.
  - `ECommandPalette` shows Ctrl in its keycaps on the server and the first render, then the platform's keys once mounted, so a server-rendered palette hydrates without a mismatch. `formatShortcut` documents passing `apple` for server-rendered markup.
  - The Nuxt recipe in the README builds the theme once with `defineTheme` and sets `lang` and `dir` for the server.

- cc9e938: The default theme is blue again. `brand` is the logo blue, `#2c95b4`, and `brand-accent` the logo green, `#72c451`. Everything derived from them follows:

  - `primary` is a deep teal, `#005f7c`, with white text at 7.2:1.
  - `secondary` is a deep green, `#0d6600`, and `secondary-soft` is `#e5f9df`. `success` keeps its own green.
  - `primary-soft`, the tint of where you are, is the brand at 16% on `surface`: the tint now sits no further than 1.2:1 from the surface, so a saturated brand gives a soft tint rather than a fill.
  - `surface-tint`, `wash-hover`, `wash-press`, `selection` and `scrim` take the blue hue.
  - The default dark surface for `scheme: "auto"` is a blue-tinted near-black, `#10151a`. On it, `primary` is `#3ca1c1`, with black text.

  A theme that sets its own `brand`, `accent` and `surface` looks the same as before.

  The logo in `brand/` is the primary tile with a white e, and the word in the primary.

- cc9e938: Display and data components: renames, a faster `EDataGrid`, and fixes.

  Breaking (rename or remove, then update every use):

  - `EDefinition` is renamed `EToggletip` (folder `Toggletip`, class `e-definition-term` is now `e-toggletip-term`). The name `EDefinition` is gone: import `EToggletip`.
  - `ETable` `size="sm"` is now the boolean `dense`. `EDataGrid` takes `dense` too.
  - `EContainer` `size` is renamed `width` (`sm`, `md`, `lg`, `full`).
  - `ESurface` `size` is removed. Set `padding` to a gap name, a space number or a CSS length (`size="lg"` was `padding="section"`; `size="sm"` was `padding="var(--e-gap-base) var(--e-pad-card)"`). Left out, the padding is `pad-card` as before. `flush` is padding 0 and wins over `padding`. The classes `e-surface--pad-sm|md|lg` are gone.
  - `EAvatar` `as="button"` is now the boolean `interactive`.
  - `EDataGrid` `cards` is opt-in, as on `ETable`: pass `cards` to keep rows turning into cards below 40rem.
  - The message `codeCopied` is renamed `copied`.
  - The table classes `e-table-wrap--striped` and `e-table-wrap--dense` are now `e-table--striped` and `e-table--dense` on the `table`, and `e-gridtable--busy` is `e-table--busy`. The `ETable` and `EDataGrid` frame is drawn in `--e-border` (the grid used `--e-border-strong`).
  - `EText` and `EMetric` `tone="neutral"` is renamed `tone="muted"`, the quieter colour; `neutral` is no longer a value of either. Leave `tone` out for the default ink. Across the library `neutral` means no tone, the default look.

  Added:

  - `EDataGrid`: `striped`, `dense`, an `#empty` slot (with `{ filtered, clearFilters }`), `virtual.height` as any CSS length, and virtual rows that are measured, so a larger text size keeps them in step with the scroll.
  - `EActions` `stack="narrow" | "always"` stacks its buttons full width, by its own width.
  - `ECopyButton` declares `variant` and `size`.
  - `ECodeBlock` `label`; `ts`, `vue`, `sh` and other common languages are read by name.
  - `EDescriptionList` `as="dl" | "ul"` chooses the list.
  - `useLocale()` returns `formatNumber` and `formatList`, cached per locale and safe with an unknown locale.
  - `EHighlight`'s markup (`<code class="e-highlight e-highlight--code">`, `<mark class="e-highlight">`) is documented as a public static form.
  - The popover title row and body rules (`e-pop-head`, `e-pop-title`, `e-pop-body`) move to `styles/popover.css`.

  Fixed:

  - `EDataGrid` searches an index built once per rows and columns, sorts with a cached collator, and only formats a cell when a filter needs it; `searchDebounce` holds back client-side filtering too. A failed load is announced assertively and its empty state uses the danger tone. `manual` without `total` warns in development. The cards Sort by menu lists only shown columns, and the Columns menu title is no longer a heading.
  - `EMetric` and `EAvatarGroup` no longer throw on an invalid `locale`. `EAvatarGroup` never shows a "+1" tile.
  - Money in `EDataGrid` currency cells and `formatMoney` uses the currency's own decimals (¥1,000, not ¥1,000.00).
  - The quiet `EIconButton` shows its busy style while `loading`.
  - `ETable` and `ECodeBlock` are a tab stop only while they scroll (`maxHeight` alone, or `wrap`, no longer makes one). As cards, an `ETable` row heading (`th scope="row"`) is the card's title.
  - `ESearchResults` selects a button result on a modified click; only links are left to the browser.
  - `EEmptyState` wraps its text in a `div`, so the slot may hold paragraphs.
  - `EText` warns when `truncate` and `lines` are both set; `lines` wins.

- cc9e938: Form controls: consistent names, one field button, quieter errors and a round of fixes.

  Breaking renames (update your templates):

  - `ESlider`: `format` is now `valueText`.
  - `EPhoneField`: `format` is now `display`, and `valueFormat` is now `modelAs`.
  - `EOtpField`: `inputmode` is now `charset`, with `"text"` now `"alphanumeric"`; `autoFocus` is now `autofocus`.
  - `EFieldset`: `bare` is now `variant="plain"` and `section` is now `variant="section"` (`variant` defaults to `"box"`).
  - `ECheckbox`: `bare` is now `hideLabel`, which keeps the hint or error visible.
  - `ETextField`: the internal `submitValue` prop is gone.
  - Types: `RadioOption` and `CheckboxOption` are now one `ChoiceOption`. `ECombobox` is generic in its option values, as `ESelect` is, so a `v-model` typed `string` still works and literal options narrow it.
  - CSS: `.e-combo-btn` is gone; every button inside a field box is `.e-input-btn`. The shared stylesheets moved to `styles/controls/`; the source files `TextField/input.css` and `Select/panel.css` are gone (the built `style.css` is unchanged). `.e-choice--bare` is now `.e-choice--label-hidden`.

  Behaviour:

  - A field's error is no longer an assertive alert on first render. One that appears or changes later is announced once; inside an `EForm`, a failed submit is announced by the summary alone.
  - `ESelect` with a bare `multiple` attribute works (it was read as off), and its clear button emits `clear`. `EPhoneField` declares `clear` too.
  - `ESegmented` with no `v-model` shows its first option as active without checking its radio, so a form posts nothing and `required` can fail until the person chooses.
  - `EDatePicker`, `ERangePicker` and `EColorField` emit `invalid` (text, message) when typed text cannot be used; the model keeps its value. The date pickers' `min` and `max` take a `YYYY-MM-DD` string. `ERangePicker` reads the span when focus leaves both boxes, shows no presets row for `presets: []`, and gains `footer` (Today and Clear, on by default as in `EDatePicker`).
  - `ENumberField` and `ECurrencyField`: the stepper buttons leave the tab order (the arrow keys step); a step lands on `min` plus a whole number of steps; a step such as `1e-7` keeps its decimals.
  - `ECombobox` shows the loading spinner in the box with `aria-busy` on the input, folds options once per change, takes `limit`, and a `bare` one joins the `EForm` around it.
  - `ESlider` spreads `marks: true` over the whole track (about a hundred ticks at most), drops `aria-required`, and a click on its label focuses the first thumb.
  - `ESignaturePad` shows read-only and disabled as fields do, and takes `label`, `hideLabel`, `optional`, `name` and a CSS length for `height`. `ESignatureField`'s `required` also requires the agreement, and says "Required" once.
  - `EPasswordField` is described by a count of the rules met, and `mode` defaults to `new` when it has `rules`.
  - `EUpload`'s hint shows `maxSize` and `maxFiles`, and names MIME types by kind ("PNG", "image/*").
  - A disabled checkbox or radio uses `--e-disabled-fill`, like other controls.

  New:

  - `useFormField` is exported, for a custom control that joins an `EForm`.
  - `ESegmented`: `id` and `size` (`sm` is compact). `ESearchBar`: `id` and `readonly`. `ESwitch`: `hideLabel`.
  - Messages: `fileSizeLimit`, `fileCountLimit`, `passwordRulesMet`.

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

- cc9e938: Overlays, navigation and feedback: behaviour, accessibility and API fixes.

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
  - `ENavList`: `size="sm"` for short rows with no rule between them. Development warns when two navigations are left on the default "Main".
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

- cc9e938: Printing. A page prints in its theme's light palette whatever the screen shows: every token a dark or high-contrast variant changes is set back under `@media print`, and `apply()` does the same with its own theme while the page prints. Colours print exactly, so a fill that carries meaning (a checked box, a switch that is on, a progress bar, a chosen day) is on the paper even where the browser leaves background graphics out. Headings stay with what follows them, paragraphs leave no lone line at a page edge, and cards, notices, fields, calendars, code blocks, images and table rows move to the next page rather than being cut. Open menus, list panels, date panels and tooltips are not printed.

  - `EDataGrid` prints as the table it shows: no search, filters, selection column, column tools, resizers or pager; only the sorted column keeps its arrow; the heading row repeats at the top of each page (a sort button there is laid out as text, since a repeated button is not painted).
  - `ETable` and `EDataGrid` headings are in the flow on paper, so they repeat on every page.
  - `ECodeBlock` wraps long lines instead of cutting them off.
  - `EDisclosure` and `EExpandableRow` print open, without the chevron.
  - `EUpload` leaves out an empty zone, the count and the files turned away.
  - `ELink` prints the address only of a link to another site (`http:`, `https:`); a path on the same site prints as its text.
  - `EAppHeader` prints as the brand alone: no actions, and a sticky header prints once.

- cc9e938: New opt-in font entries: `@eos-ui/vue/fonts-self-hosted.css` serves Bricolage Grotesque (with its optical-size axis) and Geist Mono from woff2 files in the package, so no request goes to Google, and `@eos-ui/vue/fonts-fallback.css` has only the metric-matched fallback faces, for an app that serves the fonts itself. The JavaScript in `dist` is no longer minified and ships without source maps: your bundler minifies it, and the modules read like the source. The README now says the package root has one side effect besides the CSS (it registers the built-in icons).
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

- cc9e938: `EUpload` in the eos materials. The dropzone is a well pressed into the page; its edge turns dashed in the primary colour while a file is dragged anywhere over the page, and over the zone it takes the brand tint and sinks a step deeper (no longer the success green). Each chosen file is a raised tile with the icon of its kind (new icons `file-image` and `file-pdf`) and its size. Files left out are listed under the zone with why ("Not an accepted type", "Larger than 5 MB", "Only 3 files can be added") until dismissed or the next choice. Without `multiple` the chosen file takes the zone's place as one large raised tile (an image file as itself, any other as a large icon of its kind) with its name and size beneath and Remove in the corner, and the tile takes the zone's hover, dragging and invalid states; choosing or dropping again replaces it. With `multiple` and `maxFiles` the corner shows "2 of 3". Image files show as themselves, as thumbnails in the list; new prop `preview` (default `true`) turns that off. New messages `fileCount`, `fileRejectedType` and `fileRejectedSize`.

### Patch Changes

- cc9e938: `ECalendar`: the days sit with no gap between them, so a range reads as one band. Its ends, today and the day hovered as the end meet the band flush: their corners are square on every side that touches it, beside them or across a week, and the band rounds its own outer corners. A day inside the band takes the band's corners for its hover and press. Days answer the pointer at once, in step with the band.

  `ESwitch`: the thumb sits at one height on and off.

  Hover fills on text fields, `EUpload` and outline buttons fade in place instead of sweeping in from the edges.

- cc9e938: Polish:

  - `EAvatarGroup` is a stack with no gap: each avatar covers a quarter of the one before it, borders kept, and `+N` is an avatar of its own.
  - `ECheckbox`, `ERadioGroup` items and `ESwitch`: "Required" and "Optional" sit at the end of the row, not against the label.
  - `ENavList` items answer the pointer on their own edge and fill, so the hover wash no longer reaches past the border.
  - `ESwitch`: the thumb keeps its neutral slab when on (drawn in ink, so it holds against the primary track), and sinks off it while pressed, on or off.
  - `EStamp` and `ETag` no longer clip the top of tall letters in some fonts. `ETag` has a softer ground.
  - `ETable` and `EDataGrid` headings are ink with a rule twice as heavy beneath them; a sort button answers the pointer with an underline.
  - `EAppShell`: the ground beside the page column is a quiet near-neutral instead of the full brand tint.
  - `EDisclosure`: a title with rich content (`Getting <em>there</em>`) stays one run of text instead of being spread across the summary.

- cc9e938: `EProgress`: the stripes on what is left to do move until the bar is full, whether the length is known or not (they stood still at a known value). With reduced motion they stand still. `ECodeBlock`: stacked blocks keep an unbroken seam; the overflow shade no longer cuts it at the end edge.
- Updated dependencies [cc9e938]
- Updated dependencies [cc9e938]
- Updated dependencies [cc9e938]
- Updated dependencies [cc9e938]
- Updated dependencies [cc9e938]
- Updated dependencies [cc9e938]
- Updated dependencies [cc9e938]
  - @eos-ui/tokens@0.18.0

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
