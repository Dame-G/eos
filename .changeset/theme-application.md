---
"@eos-ui/tokens": minor
"@eos-ui/vue": minor
---

Theme application, the success tone and colour inputs.

- `createEos()` without a `theme` applies nothing: `style.css` already carries the default theme, so a `:root { --e-primary: ... }` override in your own CSS wins, and the `prefers-contrast: more` variant of `style.css` applies. With a `theme`, the theme is added to the document as a stylesheet in the `e.tokens` layer (scoped to `themeTarget`) instead of inline custom properties, so your own CSS wins over it and its `scheme: "auto"` and `contrast: "auto"` variants follow the visitor. Unmounting the app removes the theme and stops the `lang` and `dir` watcher. `themeCss()` with no theme returns the theme `style.css` carries.
- `success` and `success-soft` are their own colours, derived from a new `success` input of `defineTheme()`, instead of aliases of `secondary` and `secondary-soft`. `accent` now recolours only the secondary action. A theme that set `accent` to change success states: set `success` instead.
- Colour inputs of `defineTheme()` accept 4 and 8 digit hex, `rgb()`, `rgba()` and `color-mix(in srgb, ...)`, besides 3 and 6 digit hex, `black` and `white`. Alpha is dropped. A colour it cannot read is ignored and listed in `warnings` instead of throwing.
- `theme.apply()` returns a function that removes the inline tokens, `data-e-theme` and its media listeners, and works where `matchMedia` does not exist.
- `defineTheme()` warnings are no longer printed in production builds: the check reads `process.env.NODE_ENV`, which bundlers replace.
- New exports from `@eos-ui/tokens`: `darkVariant(input)` (the inputs of a theme's dark variant) and `themeVariant(theme, { dark, more })` (the tokens and `color-scheme` a visitor with those settings sees), with the `VariantQuery` type.
- `EConfigProvider` renders menus, dialogs, tooltips and toasts inside itself only when it sets a `theme` or `scheme` (`portal` was `true` by default). It follows `prefers-contrast: more` for a theme with `contrast: "auto"`, and `scheme` picks the dark variant of a built `Theme` made with `scheme: "auto"`.
- `tokens.json` no longer has the top-level `name` and `version`, `color.themes` or `type.fonts`, which nothing read.
- Usage notes corrected for `stroke-edge`, `weight-strong`, `primary-soft`, `radius-pill`, `radius-sm`, `radius-lg`, `secondary`, `secondary-soft` and `space-5`, `space-10`, `space-16`.
