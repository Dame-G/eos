---
"@eos-ui/vue": patch
---

Polish:

- `EAvatarGroup` is a stack with no gap: each avatar covers a quarter of the one before it, borders kept, and `+N` is an avatar of its own.
- `ECheckbox`, `ERadioGroup` items and `ESwitch`: "Required" and "Optional" sit at the end of the row, not against the label.
- `ENavList` items answer the pointer on their own edge and fill, so the hover wash no longer reaches past the border.
- `ESwitch`: the thumb keeps its neutral slab when on (drawn in ink, so it holds against the primary track), and sinks off it while pressed, on or off.
- `EStamp` and `ETag` no longer clip the top of tall letters in some fonts. `ETag` has a softer ground.
- `ETable` and `EDataGrid` headings are ink with a rule twice as heavy beneath them; a sort button answers the pointer with an underline.
- `EAppShell`: the ground beside the page column is a quiet near-neutral instead of the full brand tint.
- `EDisclosure`: a title with rich content (`Getting <em>there</em>`) stays one run of text instead of being spread across the summary.
