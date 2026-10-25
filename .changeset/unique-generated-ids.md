---
"@eos-ui/vue": patch
---

Generated ids can no longer collide with the ids a component derives from another generated id. The path Vue builds (`v-0-0`) had its dashes turned into underscores in `useUid`: one component's first option was `e-v-0-0` plus `-0`, and a component in a later async boundary of the same page was `e-v-0-0-0` itself, so a label's `for` pointed at the wrong control (on the docs site, clicking the Masonry switch of the Grid demo selected the Light option of the preview colour scheme instead).
