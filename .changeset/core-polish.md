---
"@eos-ui/tokens": minor
"@eos-ui/vue": minor
---

Second audit pass: a spacing and interaction vocabulary, forms that behave like forms, and a long list of accessibility and robustness fixes. Pre-1.0, so the breaking changes are in a minor.

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
