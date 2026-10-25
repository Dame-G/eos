---
"@eos-ui/tokens": minor
"@eos-ui/vue": minor
---

The default theme is blue again. `brand` is the logo blue, `#2c95b4`, and `brand-accent` the logo green, `#72c451`. Everything derived from them follows:

- `primary` is a deep teal, `#005f7c`, with white text at 7.2:1.
- `secondary` is a deep green, `#0d6600`, and `secondary-soft` is `#e5f9df`. `success` keeps its own green.
- `primary-soft`, the tint of where you are, is the brand at 26% on `surface`: the tint now sits no further than 1.35:1 from the surface, so a saturated brand gives a soft tint rather than a fill.
- `surface-tint`, `wash-hover`, `wash-press`, `selection` and `scrim` take the blue hue.
- The default dark surface for `scheme: "auto"` is a blue-tinted near-black, `#10151a`. On it, `primary` is `#3ca1c1`, with black text.

A theme that sets its own `brand`, `accent` and `surface` looks the same as before.

The logo in `brand/` is the primary tile with a white e, and the word in the primary.
