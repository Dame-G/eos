---
"@eos-ui/vue": minor
"@eos-ui/tokens": minor
---

**Old spellings are removed.** Until 1.0 an old spelling goes outright instead of warning. Each line names what to write instead.

Components:

- `small` and `large` on `EAvatar`, `ESpinner`, `ESurface` and `EText`, `small` on `EIcon`, `EKbd` and `EStamp`, and `dense` on `ETable`: use `size` (`size="sm"`, `size="lg"`).
- `ESurface` `paper` and `raised`: use `variant="paper"` and `variant="raised"`. `ESurface` `pad`: use `size`, `padding` or `flush`. `ESurface` `variant="tone"`: use `variant="tinted"`.
- `EText` `muted` and `tone="muted"`: use `tone="neutral"`.
- `EAvatar` `status`: use `presence`.
- `EDescriptionList` item `badge` and `badgeTone`: use `stamp` and `stampTone`.
- `EDataGrid` `bare`: use `ETable` for a short static list. Every grid now has its foot.
- `EUpload` `@files`: use `v-model` or `@update:model-value`, which carry the same list.
- `EStamp` `tone="ink"`: use `tone="neutral"`.
- `EMenu` `side="left"` and `side="right"`: use `start` and `end`. `EDrawer` `side="left"` and `side="right"`: use `start` and `end`. `useLogicalSide()` and its `LogicalSide` type take `top`, `bottom`, `start` and `end` only.
- `EInline` `nowrap`: use `:wrap="false"`.
- `ESearchResults` `@edge`: use `@exit-top`.
- `ESearchBar` and `ECombobox` no longer show the clear button when `clearable` is left out: it defaults to `false`, as in every field, with no warning. Pass `clearable` to show it.

Messages:

- `dragHere`: use `dropFile` (with `{choose}` where the `chooseOne` link goes).
- `closeToast`: use `dismiss`. `EToast` no longer reads `closeToast`.

`defineTheme` inputs:

- `strokes.edge` and `strokes.card`: `strokes.hair` derives both. To pin one, set `tokens: { "stroke-edge": "2px" }` or `tokens: { "stroke-card": "2px" }`.
- `motion: "none"`: every theme already stops moving under `prefers-reduced-motion`. To zero the durations anyway, set `duration-tap`, `duration-fade` and `duration-move` in `tokens`.

CSS tokens (each `--e-*`):

- `slab`: use `depth`. `stroke-ring`: use `stroke-edge`. `surface-hover` and `surface-press`: use `wash-hover` and `wash-press`. `brand-blue` and `brand-green`: use `brand` and `brand-accent`. `easing-standard`: use `ease-in-out`.
- `leading-loose` and `space-7`: use another step of the scale (`leading-normal`, `space-6` or `space-8`). A gap or padding of `7` is no longer a space token.
- `on-info`, `on-success` and `on-warning`: use `on-primary`, `on-secondary` and `surface`, which they were aliases of.
- `shade-hover`, `shade-press` and `shade-slab`: use the `*-hover`, `*-press` and `*-slab` tokens of a fill, or `slab-ink`. Those carry the mix amounts inline now and resolve to the same colours on light and dark surfaces.
- `bp-narrow`, `bp-medium` and `bp-wide`: write the breakpoints as literals (`26rem`, `36rem`, `48rem`), since a custom property cannot be read in `@media` or `@container`.

The tokens package no longer exports `deprecated`. `explain()` and the DTCG export (`$deprecated`) no longer mark old tokens, and a removed token set in `tokens` is reported as not a known token.
