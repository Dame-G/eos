# @eos-ui/tokens

The design tokens behind EOS (colour, spacing, radius, shadow, type, size, motion, layering) as CSS custom properties, typed values, and `defineTheme()`, which builds a theme from a brand colour and checks every promised contrast pair.

```bash
npm install @eos-ui/tokens
```

```ts
import { defineTheme } from "@eos-ui/tokens";

const theme = defineTheme({ name: "clinic", brand: "#8a2be2", accent: "#2e7d32", radius: "round" });
theme.issues; // contrast pairs that fail (empty when sound)
theme.css(); // the theme as CSS custom properties, for the server
theme.apply(document.documentElement); // or set them in the browser
```

```css
/* the default tokens as a stylesheet: the light theme, with prefers-contrast: more handled */
@import "@eos-ui/tokens/tokens.css";

/* the same, and prefers-color-scheme: dark too */
@import "@eos-ui/tokens/tokens.auto.css";
```

Use `tokens.auto.css` only when your page ground follows the scheme as well: it makes every component dark under a dark operating system, so a hard-coded white page behind them would look broken. `tokens.css` stays light.

```ts
theme.dtcg(); // the same tokens as W3C Design Tokens JSON
```

All variables are prefixed `--e-` (`--e-primary`, `--e-space-4`). [Documentation](https://eos.dame.gg). MIT licensed.

## Inputs

`defineTheme()` takes the inputs below and emits every token. Any token can also be set by name in `tokens`, which wins over everything derived. `name` labels the theme (`data-e-theme`), and `strict` throws on a contrast failure instead of listing it in `issues`.

| Input                                                  | Derives                                                                                                                                                                                                                                                             |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `brand`, `accent`                                      | `brand`, `brand-accent`, `primary`, `secondary`, their tints, `surface-tint` and the `scrim`                                                                                                                                                                        |
| `danger`, `warning`                                    | `danger`, `on-danger`, `danger-soft`, `warning-strong`, `warning-soft`                                                                                                                                                                                              |
| `background`, `surface`, `foreground`                  | the grounds, `ink`, `muted`, `border`, `border-strong`. A dark surface lifts the action colours                                                                                                                                                                     |
| `preset` `"paper" \| "ink" \| "quiet"`                 | `elevation`, `strokes`, `radius` and `motion` together. Your own entries win. `paper` is the default look, `ink` is bold, sharp and snappy, `quiet` is lifted, round and gentle                                                                                     |
| `fonts`, `radius`                                      | `font-sans`, `font-mono`, `font-script`, `radius-sm` to `radius-lg`. `radius` is a preset, one base number in px (`md`; `sm` half, `lg` double) or `{ sm, md, lg }`                                                                                                 |
| `textScale`, `spaceScale`                              | `text-xs` to `text-4xl` and the icon, checkbox and avatar boxes (`textScale`, on top of the browser's own font size: these tokens are in rem); `space-1` to `space-16` and, by reference, the `gap-*`, `pad-*` and `gutter` tokens (`spaceScale`). 1 is the default |
| `strokes` `{ hair, focus }`                            | `stroke-hair`, `stroke-card`, `stroke-edge`, `stroke-focus` (also the focus gap), `focus-gap-field`. `edge` and `card` still work but are deprecated                                                                                                                |
| `contrast` `"standard" \| "high" \| "auto"`            | `high` sets `border` and `border-strong` to `ink`, `muted` at 15:1, a neutral `surface-tint` and a darker `scrim`. `auto` applies it under `prefers-contrast: more`                                                                                                 |
| `motion` `"default" \| "snappy" \| "gentle" \| "none"` | `duration-tap`, `duration-fade`, `duration-move`, `easing-out`. `none` is deprecated: reduced motion already stops everything                                                                                                                                       |
| `elevation` `"outline" \| "lifted" \| "bold"`          | `frame`, `well`, `float`, `paper`. The shadow tint follows `background`                                                                                                                                                                                             |
| `scheme` `"light" \| "dark" \| "auto"`, `dark`         | `auto` keeps the theme light and applies `dark` (default surface `#10151a`) under `prefers-color-scheme: dark`                                                                                                                                                      |
| `density` `"comfortable" \| "compact"`                 | `compact` scales `space-*` by 0.75 (so `gap-*`, `pad-*` and `gutter` follow) and sets `control-height` to the 44px tap target (`2.75rem`; `chip-height` 22px). A smaller `controlHeight` is raised and reported                                                     |
| `controlHeight`                                        | `control-height`, `chip-height`                                                                                                                                                                                                                                     |

`derivedFrom`, `constants` and `inputTokens` say which input drives each token and which tokens are fixed. `deprecated` lists the tokens that are still emitted but will be removed, with what to use instead; `explain()`, the DTCG export (`$deprecated`) and a `tokens` entry for one of them say so too. Fixed tokens include `depth`, the thickness of a raised or pressed edge.

## Token layers

- **Semantic spacing.** `gap-tight`, `gap-snug`, `gap-base`, `gap-loose`, `gap-section`, `pad-chip`, `pad-control`, `pad-control-sm`, `pad-cell`, `pad-card`, `pad-panel`, `gutter-min` and `gutter` name the roles of the `space-N` scale. Each is a reference to `space-N`, so `spaceScale` and `density` reach every component through them. [CONTRIBUTING](../../CONTRIBUTING.md) has the table of which to use when.
- **Type.** `text-*` sizes, `control-height`, `chip-height` and the icon, check and avatar boxes are in rem. `tap` stays 44px. `leading-none`, `-tight`, `-snug`, `-normal`, `-loose` and `tracking-label`, `-tight`, `-wide` are the line-heights and letter-spacings. Every documented style is a `font` shorthand token: `font: var(--e-type-kicker)` (`type-h1` to `type-h6`, `type-deck`, `type-body`, `type-small`, `type-button`, `type-kicker`, `type-meta`, `type-numeral`, `type-numeral-l`). `tracking-snug` is the button label.
- **Slab and interaction.** `depth`, `slab-thin` and `slab-bold` are the thicknesses of a raised edge. `ring-hover` and `ring-press` are the hairline ring of the hover and press states, drawn at `stroke-edge`, with `wash-hover`, `wash-press` (the one contrast-fitted hover pair) and `transition-state`. `underline-offset` is the gap under every underlined text.
- **Sizes.** `size-panel-sm`, `-md` and `-lg` (28, 32, 36rem) are the widths of dialogs, drawers, popovers and toasts; `shell-width` and `shell-rail` are the `EAppShell` column and its side lines; `radius-round` is a circle; `on-warning` is the label on a `warning` fill.
- **Motion.** `duration-fade` sits between `duration-tap` and `duration-move`; `easing-enter` and `easing-exit` are for arriving and leaving. All three durations collapse under `prefers-reduced-motion`.
- **Colour.** `shade-hover`, `shade-press` and `shade-slab` are in the colour group. `info`, `success`, `warning`, `text-link` and `focus-field` are aliases of other colours, kept so a theme can set them apart. `surface-raised` and `surface-sunken` are removed.
- **Deprecated, still emitted.** `slab` (use `depth`), `stroke-ring` (`stroke-edge`), `surface-hover` and `surface-press` (`wash-hover`, `wash-press`), `brand-blue` and `brand-green` (`brand`, `brand-accent`), `easing-standard`, `leading-loose`, `space-7`, `bp-*`, `on-info`, `on-success`, `on-warning` and `shade-*`.

## Checks, warnings and explain

`theme.issues` lists every promised contrast pair that fails. The pairs include `ink`, `muted` and `primary` on the hovered, pressed and selected fills, `muted` on the selection highlight and the hover ring against the surface. `color-mix()` of known tokens is evaluated, with `transparent` laid over the pair's ground. A pair that cannot be evaluated (an unknown token, another colour space) is not skipped silently: it is named in `theme.warnings`, which also lists inputs that were ignored or adjusted (a scale that is not a positive number, a `controlHeight` under the compact tap target, a `dark` without `scheme: "auto"`, an unknown name in `tokens`) and is printed with `console.warn` outside production. `theme.explain("primary")` says what a token resolves to, which inputs drive it and which of them you gave.

## Following the visitor

`scheme: "auto"` and `contrast: "auto"` are opt-in. The base tokens stay the light, standard theme. Each variant is derived like any other theme (so it is contrast-checked and listed in `issues`), and only the tokens that differ are emitted inside `@media (prefers-color-scheme: dark)`, `@media (prefers-contrast: more)` and both together. `color-scheme` is `light` at the root and `dark` inside the dark media query. `theme.alternates` lists them. `theme.apply()` evaluates the queries itself and repaints when they change.

```ts
defineTheme({ brand: "#8a2be2", scheme: "auto", contrast: "auto", dark: { surface: "#0e1117" } });
```

The grounds (`background`, `surface`, `foreground`) are never carried into the dark variant: give `dark` the ones it needs.

Every theme's CSS also carries two fixed overrides. Under `prefers-reduced-motion: reduce`, `duration-tap`, `duration-fade` and `duration-move` are 0.01ms (`!important`, so they beat the inline tokens `apply()` sets). Looping loaders must switch themselves off, since a loop at 0.01ms would flicker. When printing, `ink`, the borders and the grounds are black and white whatever the theme, so a component needs no print colours of its own.

## Design tools

`theme.dtcg()` returns the theme as [W3C Design Tokens](https://www.designtokens.org) JSON, grouped by kind (`color`, `spacing`, `radius`, `shadow`, `fontSize`, `size`, `stroke`, `duration`, `easing`, `zIndex`, `weight`, `font`). The default theme is also published as `@eos-ui/tokens/tokens.dtcg.json`, ready to import into Tokens Studio for Figma or to feed Style Dictionary.

- A token that references another token becomes an alias: `"focus-ring": { "$value": "{color.ink}" }`.
- Colours, dimensions, durations, cubic-bezier easings, z-indexes and font stacks carry a `$type`. A value no DTCG type can hold, such as a stacked shadow or a `color-mix()`, keeps its CSS string and has no `$type`.
- Each token's usage note is its `$description`.
