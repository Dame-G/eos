---
"@eos-ui/tokens": minor
---

New export `themeInputs`: every input of `defineTheme()` as `{ name, doc, type }` (with the `ThemeInputDoc` type), generated from the `ThemeInput` interface and its doc comments at build time, so documentation and tooling can list the inputs without parsing the source. A preset type is spelled out as its values (`'"standard" | "high" | "auto"'`).
