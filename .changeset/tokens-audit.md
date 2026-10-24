---
"@eos-ui/tokens": minor
"@eos-ui/vue": patch
---

Tokens and CSS values audit.

- The `frame`, `float` and `paper` shadows draw their ring as `0 0 0 var(--e-stroke-card) var(--e-border)`, so a `border` or `stroke-card` override (from `defineTheme` or plain CSS on `:root`) reaches cards, popovers and paper. Only the drop layers are literal. `paper` is the ring plus `var(--e-well)`.
- The `scrim` is a deep shade of the brand colour, so a custom `brand` no longer dims dialogs with the default teal.
- New tokens: `brand` and `brand-accent` (the new names of `brand-blue` and `brand-green`), `type-meta` (one line of small mono metadata), `underline-offset` (0.25em, the gap under every underlined text), `tracking-snug` (the button label), `shell-width` and `shell-rail` (the `EAppShell` column, now in `tokens.json`). `type-button` is listed with the sans styles. `easing-linear` is `linear`. `defineTheme` exports `deprecated`, `explain()` and the DTCG export (`$deprecated`) name deprecated tokens, and setting one in `tokens` adds a warning.
- Deprecated, still emitted, to be removed in a later major: `slab` (use `depth`), `stroke-ring` (use `stroke-edge`; the hover and press rings are drawn at it), `surface-hover` and `surface-press` (now aliases of `wash-hover` and `wash-press`, the one contrast-fitted hover pair), `brand-blue` and `brand-green` (aliases of `brand` and `brand-accent`), `easing-standard` (use `ease-in-out`), and the tokens nothing uses: `leading-loose`, `space-7`, `bp-narrow`, `bp-medium`, `bp-wide`, `on-info`, `on-success`, `on-warning`, `shade-hover`, `shade-press` and `shade-slab`.
- `defineTheme`: `radius` also takes one base number in px (`radius-md`; `sm` is half, `lg` double). `strokes` needs only `{ hair, focus }`; `edge` and `card` still work and report that they are deprecated. `motion: "none"` still works and is deprecated, since every theme already stops moving under `prefers-reduced-motion`. The success and warning notice pairs are checked once each.
- `base.css`: the unused recipe classes `.e-slab` (and `--thin`, `--bold`, `--shadow`, `--sink`), `.e-selected--value`, `.e-selected--place`, `.e-disabled`, `.e-disabled-row` and `.e-interact--field` are removed. They were never documented as API; the rules they stood for are now a comment in `base.css`, including the named hover exceptions (link, breadcrumb, disclosure summary) and the two ways "place" is drawn (a tab thickens its edges in a bordered strip, a nav item takes a slab).
- Dialogs, drawers and the command palette arrive on `easing-enter` and leave on `easing-exit`; the scrim fades over `duration-fade`.
- The selected calendar day stands on the standard slab. Notice, Stamp and Toast share one tone edge: `stroke-edge` plus `slab-bold` on the inline-start side, so the stamp's and the toast's are 1px heavier.
- Raw line heights and letter spacing in component CSS are type, leading and tracking tokens. Calendar titles use `type-h4`, so they are medium weight, not strong; navigation group headings use `type-kicker`, like menu group labels. `ECodeBlock` sets code at the mono weight `fonts.css` loads (500).
- Rows in a menu or list panel and the `EColorField` swatch take the real `gap-tight` inset off the panel's radius, so the corners are concentric (4px in an 8px panel).
- Popovers and plain toasts are `size-panel-sm` wide (28rem, from 24rem), the menu grows to `size-panel-sm`, and the tooltip is half of `size-panel-md` (16rem, as before).
