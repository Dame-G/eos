---
"@eos-ui/vue": patch
---

`NumberField` with a prefix or suffix no longer clips its value in a narrow column (under 10rem, as on a phone in the playground's spacing and control-height fields). The narrow-column side padding was also being applied to the fixed-width input and squeezed the digits out.
