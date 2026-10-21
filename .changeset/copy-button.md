---
"@eos-ui/vue": minor
---

New `ECopyButton` and `useCopy()`: copy text, show a check mark, announce "Copied" or "Couldn't copy", and fall back to a hidden textarea where the async clipboard is missing. `ECodeBlock` now uses them, so its copy announcement comes from the shared announcer.
