---
"@eos-ui/tokens": minor
"@eos-ui/vue": patch
---

New token `pad-inset` (half of `space-1`): the distance the corner maths assumes between a nested child and its container's edge. The rows of a list panel (`ESelect`, `ECombobox`, `ECommandPalette`, `ESearchResults`, `EMenu`) and the `EColorField` swatch keep their padding, but their corners are the container's radius less this (and the border), so a row's corner is 6px in an 8px panel instead of 4px and the two read as one shape.

`ESegmented`: the hover and press ring is the piece's own border, so no strip of bare wash lies between it and the next piece. A chosen option in a disabled track is a flat tint with no edge of its own, inside the track's dashed edge.

The `well` shadow is lighter on every control that has one (checkbox, switch and slider tracks, text fields, segmented track): 6% black instead of 10% in the default look, and softer in the bold and dark looks.
