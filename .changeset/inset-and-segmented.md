---
"@eos-ui/tokens": minor
"@eos-ui/vue": patch
---

New token `pad-inset` (half of `space-1`): how far a child sits inside the edge of the container it nests in. The rows of a list panel (`ESelect`, `ECombobox`, `ECommandPalette`, `ESearchResults`, `EMenu`) now sit 2px inside the panel instead of 4px, so a row's corner is the panel's radius less 2px and the two read as one shape. The `EColorField` swatch uses it too.

`ESegmented`: the hover and press ring is the piece's own border, so no strip of bare wash lies between it and the next piece. A chosen option in a disabled track is a flat tint with no edge of its own, inside the track's dashed edge.
