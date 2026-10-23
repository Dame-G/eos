# Third-party notices

- **Phosphor Icons** (https://phosphoricons.com), MIT License, Copyright (c) 2020 Phosphor Icons. The icon paths in `packages/vue/src/icons/phosphor.ts` are taken from this set.
- **Bricolage Grotesque** and **Geist Mono** are the default typefaces (SIL Open Font License 1.1). They are not bundled; `fonts.css` (opt-in; importing it makes visitors' browsers request the fonts from Google, which shares their IP addresses with Google) loads them from Google Fonts, and any other font can be set with `defineTheme({ fonts })`.
