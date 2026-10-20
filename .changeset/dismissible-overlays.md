---
"@eos-ui/vue": minor
---

`EDialog` and `EDrawer` take a `dismissible` prop that also closes them on a backdrop press (emitting `close`). It is off by default, so a stray press still cannot lose a half-filled form.
