---
"@eos-ui/vue": patch
---

Buttons (and the nav item for the current page, the chosen calendar day and Kbd) no longer have a diagonal-looking bottom corner. With a slab thicker at the bottom than at the sides, one `border-radius` made the face's inner corner a flattened ellipse. The bottom corners are now as much taller than wide as the slab is thick, so the face has a true circular corner like the top ones.
