---
"@eos-ui/vue": minor
---

`ETag` is a paper tag: a small square-cornered label with a thin slab edge, in place of the pill. A tag names a category, so its tones are quiet: they colour the text, and the tag keeps the neutral surface and edge. Use `EStamp` for a status.

`ECombobox` draws its chosen options with `ETag`, so they match tags everywhere else. Its own chip styles are gone.

The character counter under `ETextField` and `ETextarea` stays on one line at the right edge of the field. A long hint wraps beside it instead of squeezing it, and on a narrow field the counter drops below the hint, still at the right.

`EStamp` is a soft tint of its tone, as a Notice is: the word in the tone's colour, an edge in the same colour and a thick side on the inline-start edge, which flips in a right-to-left page. The `final` stamp, which is a ring, has none of this.

`EStamp`: the word and the detail share a line height, so their text sits on one line (the capitals no longer ride above the detail).
