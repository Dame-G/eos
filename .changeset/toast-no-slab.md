---
"@eos-ui/tokens": minor
"@eos-ui/vue": minor
---

A toast has no slab: its tone edge already marks it, so it floats on a plain `border` ring and the theme's drop. The slab under every other floating panel is now the colour of its ring (`border`), no longer the darker `slab-ink`.

New token `shadow-drop`: the wide, faint drop under a floating panel, set by `elevation`. `shadow-float` is now its ring, its slab and `var(--e-shadow-drop)`, so a panel that draws its own edge (a toast) can keep the theme's lift.
