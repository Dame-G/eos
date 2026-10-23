---
"@eos-ui/vue": patch
---

Corners are concentric: a rounded element inside a rounded, bordered one now has the container's radius less the distance between their edges, so the curves share a centre (a thumb on a track, a picture in an avatar ring, an option in a panel). It holds under every `radius` setting and in a scoped theme. The rule is in `CONTRIBUTING.md`, "Corners".
