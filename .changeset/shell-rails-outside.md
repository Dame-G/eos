---
"@eos-ui/vue": patch
---

`AppShell` no longer draws its side hairlines when the page column fills the screen. The lines now sit just outside the column's edges instead of on them, so they fall off the screen whenever the viewport is no wider than the shell (a narrow desktop window as well as a phone) and show only beside a column that is narrower than the screen.
