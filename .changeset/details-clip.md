---
"@eos-ui/vue": patch
---

`EDisclosure`, `EExpandableRow` and `ENavList` groups: while the content slides open or shut it is clipped exactly at the moving edge, so text no longer shows below a closing panel. The clip gives way by `gap-snug` (for focus rings) only once the panel is open.
