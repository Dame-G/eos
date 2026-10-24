---
"@eos-ui/vue": minor
"@eos-ui/tokens": minor
---

`surface-tint`, the second ground (wells, table headers and stripes, footers, the ground beside the page column in `EAppShell`), is now a neutral zinc grey by default (`#e6e6ea` in a light theme, a step lighter than the surface in a dark one; chroma 0.006, hue 285) instead of a tint of the brand colour, and a touch deeper than before. The default `border` darkens slightly (`#76868d` to `#73838a`) to keep 3:1 on it, and a derived theme's border follows. A theme that wants a tinted ground sets `surface-tint` in `tokens`. `EAppShell` uses the token directly.
