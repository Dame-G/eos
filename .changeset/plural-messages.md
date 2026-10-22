---
"@eos-ui/vue": minor
---

A message can now be a plural object (`{ one, other }` and the other `Intl.PluralRules` categories). `t()` picks the form from `n` using the configured locale, and a plain string still works. `resultsCount`, `rows` and `rowsAnnounce` use it, so the command palette and data grid no longer read "1 results" or "1 rows". `messages` in `createEos()` accepts either form. The unused `you`, `team`, `automatic` and `activity` messages are removed, and the month and year button label now reads "Change month or year, currently {month} {year}". Docs: "EOS" spelling, accurate bundle size and plugin option lists, no semicolons in prose.
