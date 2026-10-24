---
"@eos-ui/vue": minor
"@eos-ui/tokens": minor
---

`surface-tint`, the second ground (wells, table headers and stripes, footers, the ground beside the page column in `EAppShell`), is now deeper in a light theme (0.1 of lightness below the surface, `#dfdbea` by default) and carries a light touch of the brand hue: chroma 0.02 in a light theme and 0.01 in a dark one (never more than the brand has, so a grey brand stays grey). The default `border` darkens (`#7c8c93` to `#6d7d84`) to keep 3:1 on it, and a derived theme's border follows. `EAppShell` uses the token directly.

`wash-hover` and `wash-press`, the hover and pressed fills that rows, menu items, tabs, quiet buttons, disclosures and the selected nav item share, are now made of the same tint instead of a wash of `ink`. They stay translucent (the pigment is the colour that is exactly `surface-tint` at 50% over `surface`): a hovered row on a plain ground is the tinted ground, and on one that is already tinted (a striped row, a segmented track) it goes one step deeper, so there is always something to see. Primary text is also checked against the selected-row fill in `fitFeedback`.
