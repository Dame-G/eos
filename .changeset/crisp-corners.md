---
"@eos-ui/vue": patch
---

Rounded corners no longer show a fringe of the fill colour outside the curve. A fill painted under an inset-shadow edge leaks through the antialiased corner pixels (white bleeding past a dark outline on a dark page, or a lighter rim round a button's bottom corners). Buttons, inputs, the search bar, tabs, the current nav item, notices, switches, checkboxes and radios, avatars, the progress track, the signature pad and the stepper dot now draw their edge as a real border and stop the fill inside it, so the outermost pixels are the edge colour alone. Solid-colour faces (the filled button variants and checked switches, checkboxes and radios) run under their border instead, because they are the colour of their own edge and a gap between the two would let the page show through as a light speck.

The raised edge of buttons, selected tabs and the current nav item is now the border itself, thicker on the raised side, instead of a shadow over the face; it tapers up the corners the same way. Sizes and text positions are unchanged. As a side effect the edges survive forced-colors mode.

`npm run check:css` now fails on an inset-shadow edge over a strong fill, so the pattern cannot return.

`ESelect`: an open trigger now shows its focused look (focus ring colour and outline). Focus moves into the list when it opens, so the field only looked focused after a choice was made.

The table and data grid frames draw their outline outside the box, the way cards do, so the scrolling content never paints over the corner curve. The progress track keeps its fill under its border so no gap shows between the outline and the bar.
