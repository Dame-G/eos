---
"@eos-ui/vue": minor
"@eos-ui/tokens": minor
---

`surface-tint`, the second ground (wells, table headers and stripes, footers, the ground beside the page column in `EAppShell`), is now deeper in a light theme (0.1 of lightness below the surface, `#e3d3ff` by default) and carries more of the brand hue: chroma 0.08 in a light theme and 0.02 in a dark one (never more than the brand has, so a grey brand stays grey). The default `border` darkens (`#7c8c93` to `#6d7d84`) to keep 3:1 on it, and a derived theme's border follows. `EAppShell` uses the token directly.
