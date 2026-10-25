# @eos-ui/tokens

The design tokens behind eos (colour, spacing, radius, shadow, type, size, motion, layering) as CSS custom properties, typed values, and `defineTheme()`, which builds a theme from a brand colour and checks every promised contrast pair.

```bash
npm install @eos-ui/tokens
```

```ts
import { defineTheme } from "@eos-ui/tokens";

const theme = defineTheme({ name: "clinic", brand: "#8a2be2", accent: "#2e7d32", radius: "round" });
theme.issues; // contrast pairs that fail (empty when sound)
theme.css(); // the theme as CSS custom properties, for the server
const remove = theme.apply(document.documentElement); // or set them in the browser; remove() takes them off
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

`defineTheme()` takes the inputs below and emits every token. Any token can also be set by name in `tokens`, which wins over everything derived. A colour input takes a hex (3, 4, 6 or 8 digits), `rgb()`, `color-mix(in srgb, ...)`, `black` or `white`; alpha is dropped, and a colour it cannot read is ignored and listed in `warnings`. `name` labels the theme (`data-e-theme`), and `strict` throws on a contrast failure instead of listing it in `issues`.

| Input                                          | Derives                                                                                                                                                                                                                                                                          |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `brand`, `accent`                              | `brand`, `brand-accent`, `primary`, `secondary`, `secondary-soft`, `surface-tint` and the `scrim`. `accent` is the secondary action only, never the success tone                                                                                                                 |
| `danger`, `warning`, `success`                 | `danger`, `on-danger`, `danger-soft`, `warning`, `warning-soft`, `success`, `success-soft`                                                                                                                                                                                       |
| `background`, `surface`, `foreground`          | the grounds, `ink`, `muted`, `border`, `border-strong`. A dark surface lifts the action colours                                                                                                                                                                                  |
| `preset` `"paper" \| "ink" \| "quiet"`         | `elevation`, `strokes`, `radius`, `depth` and `motion` together. Your own entries win. `paper` is the default look, `ink` is bold, sharp and snappy on a 3px slab, `quiet` is round and gentle on a 1px slab                                                                     |
| `fonts`, `radius`                              | `font-sans`, `font-mono`, `font-script`, `radius-sm` to `radius-lg`. `radius` is a preset, one base number in px (`md`; `sm` half, `lg` double) or `{ sm, md, lg }`                                                                                                              |
| `textScale`, `spaceScale`                      | `text-xs` to `text-4xl` and the icon, checkbox and avatar boxes (`textScale`, on top of the browser's own font size: these tokens are in rem); `space-1` to `space-16` and, by reference, the `gap-*`, `pad-*` and `gutter` tokens (`spaceScale`). 1 is the default              |
| `strokes` `{ hair, focus }`                    | `stroke-hair`, `stroke-card`, `stroke-edge`, `stroke-focus` (also the focus gap), `stroke-focus-gap-field`. Pin `stroke-edge` or `stroke-card` through `tokens`                                                                                                                  |
| `contrast` `"standard" \| "high" \| "auto"`    | `high` sets `border` and `border-strong` to `ink`, `muted` at 15:1, a neutral `surface-tint` and a darker `scrim`. `auto` applies it under `prefers-contrast: more`                                                                                                              |
| `motion` `"default" \| "snappy" \| "gentle"`   | `duration-tap`, `duration-fade`, `duration-move`, `easing-out`. Reduced motion already stops everything                                                                                                                                                                          |
| `elevation` `"outline" \| "lifted" \| "bold"`  | `shadow-frame`, `shadow-well`, `shadow-float`, `shadow-paper`. A frame is a flush ring and a floating panel a slab lifted off the page: `lifted` also stands cards on a slab and widens the drop, `bold` draws 2px rings and deeper wells. The shadow shade follows `background` |
| `scheme` `"light" \| "dark" \| "auto"`, `dark` | `auto` keeps the theme light and applies `dark` (default surface `#10151a`) under `prefers-color-scheme: dark`                                                                                                                                                                   |
| `density` `"comfortable" \| "compact"`         | `compact` scales `space-*` by 0.75 (so `gap-*`, `pad-*` and `gutter` follow) and sets `control-height` to the 44px tap target (`2.75rem`; `chip-height` 22px). A smaller `controlHeight` is raised and reported                                                                  |
| `depth`                                        | `depth` in px, and from it `depth-thin` (half, at least 1px) and `depth-bold` (double)                                                                                                                                                                                           |
| `controlHeight`                                | `control-height`, `chip-height`                                                                                                                                                                                                                                                  |

`derivedFrom`, `constants` and `inputTokens` say which input drives each token and which tokens are fixed. `themeInputs` lists every input with its doc comment and its type, generated from `ThemeInput`, for documentation and tooling.

## Token layers

A token is named `<family>-<role>[-<step>]`: `space-4`, `gap-tight`, `stroke-edge`, `shadow-float`, `depth-thin`, `z-modal`, `text-sm`. A size is the thing it measures, then the dimension and the step: `control-height`, `icon-size-md`, `panel-width-sm`. A colour is its role, then its state or step: `primary`, `primary-hover`, `danger-soft`, `surface-tint`. The steps run `sm`, `md`, `lg`, `xl`, and a component `size` reads the token of its own name.

- **Semantic spacing.** `gap-tight`, `gap-snug`, `gap-base`, `gap-loose`, `gap-section`, `pad-chip`, `pad-control`, `pad-control-sm`, `pad-cell`, `pad-card`, `pad-panel`, `gutter-min` and `gutter` name the roles of the `space-N` scale. Each is a reference to `space-N`, so `spaceScale` and `density` reach every component through them. [CONTRIBUTING](../../CONTRIBUTING.md) has the table of which to use when.
- **Type.** `text-*` sizes, `control-height`, `chip-height` and the icon, check and avatar boxes are in rem. `tap` stays 44px. `leading-none`, `-tight`, `-snug`, `-normal`, and `leading-helper` and `leading-chip` (a 20px line for `text-sm` and `text-xs`, on the 4px grid), are the line-heights; `tracking-label` (uppercase labels) and `tracking-tight` (display type and large figures) the letter-spacings. Every documented style is a `font` shorthand token: `font: var(--e-type-kicker)` (`type-h1` to `type-h6`, `type-deck`, `type-body`, `type-small`, `type-helper`, `type-button`, `type-kicker`, `type-meta`, `type-count`, `type-numeral`, `type-numeral-l`).
- **Slab and interaction.** `depth`, `depth-thin` and `depth-bold` are the thicknesses of a raised edge (the `depth` group); `slab-ink` (the same as `border-strong`) is the colour of a neutral one. `shadow-sink` is the slab drawn inside a quiet control toggled on. `shadow-ring-hover` and `shadow-ring-press` are the hairline ring of the hover and press states, drawn at `stroke-edge`, with `wash-hover`, `wash-press` (the one contrast-fitted hover pair) and `transition-state`. `stroke-underline-offset` is the gap under every underlined text.
- **Sizes.** `icon-size-sm` to `icon-size-xl` are the boxes of `EIcon` `size` `sm` to `xl`, and `avatar-size-sm` to `avatar-size-lg` those of `EAvatar`. `panel-width-sm`, `-md` and `-lg` (28, 32, 36rem) are the widths of dialogs, drawers, popovers and toasts; `container-width-sm`, `-md` and `-lg` (40, 60, 80rem) the page columns of `EContainer`; `term-width` the label column of `EDescriptionList`; `list-max-height` is the most height a list of options takes; `shell-width` and `shell-rail` are the `EAppShell` column and its side lines; `radius-round` is a circle.
- **Motion.** `duration-fade` sits between `duration-tap` and `duration-move`; `easing-enter` and `easing-exit` are for arriving and leaving. All three durations collapse under `prefers-reduced-motion`.
- **Layers.** `z-raised`, `z-sticky` and `z-focus` order the parts inside one component; `z-header` keeps a sticky app header above them; `z-modal`, `z-popover`, `z-toast`, `z-tooltip` and `z-skip` are above the page.
- **Colour.** `info`, `info-soft`, `link`, `focus-field` and `slab-ink` are aliases of other colours, kept so a theme can set them apart. `primary-soft` is the pastel brand tint of where you are (a selected tab, the current nav item). `success` is its own colour, so a brand `accent` never turns a success state another hue.
- **Spacing scale.** `space-5`, `space-10` and `space-16` are steps of the scale that no component uses, kept for layouts of your own.

## Checks, warnings and explain

`theme.issues` lists every promised contrast pair that fails. The pairs include `ink`, `muted` and `primary` on the hovered, pressed and selected fills, `muted` on the selection highlight and the hover ring against the surface. `color-mix()` of known tokens is evaluated, with `transparent` laid over the pair's ground. A pair that cannot be evaluated (an unknown token, another colour space) is not skipped silently: it is named in `theme.warnings`, which also lists inputs that were ignored or adjusted (a scale that is not a positive number, a `controlHeight` under the compact tap target, a `dark` without `scheme: "auto"`, an unknown name in `tokens`) and is printed with `console.warn` outside production. `theme.explain("primary")` says what a token resolves to, which inputs drive it and which of them you gave.

## Following the visitor

`scheme: "auto"` and `contrast: "auto"` are opt-in. The base tokens stay the light, standard theme. Each variant is derived like any other theme (so it is contrast-checked and listed in `issues`), and only the tokens that differ are emitted inside `@media (prefers-color-scheme: dark)`, `@media (prefers-contrast: more)` and both together. `color-scheme` is `light` at the root and `dark` inside the dark media query. `theme.alternates` lists them. `theme.apply()` evaluates the queries itself and repaints when they change, until the function it returns is called. `themeVariant(theme, { dark, more })` gives the tokens and `color-scheme` a visitor with those settings sees, for a renderer that sets the tokens itself, and `darkVariant(input)` gives the inputs the dark variant is derived from.

```ts
defineTheme({ brand: "#8a2be2", scheme: "auto", contrast: "auto", dark: { surface: "#0e1117" } });
```

The grounds (`background`, `surface`, `foreground`) are never carried into the dark variant: give `dark` the ones it needs.

Every theme's CSS also carries two fixed overrides. Under `prefers-reduced-motion: reduce`, `duration-tap`, `duration-fade` and `duration-move` are 0.01ms (`!important`, so they beat the inline tokens `apply()` sets). Looping loaders must switch themselves off, since a loop at 0.01ms would flicker. When printing, the page takes the theme's light palette whatever the screen shows (every token a dark or high-contrast variant changes is set back), with `ink`, the borders and the grounds black and white, so a component needs no print colours of its own. `apply()` does the same while the page prints, with its own theme's palette.

## Design tools

`theme.dtcg()` returns the theme as [W3C Design Tokens](https://www.designtokens.org) JSON, grouped by kind (`color`, `spacing`, `layout`, `radius`, `shadow`, `fontSize`, `tracking`, `leading`, `size`, `stroke`, `depth`, `duration`, `easing`, `zIndex`, `weight`, `type`, `font`). The default theme is also published as `@eos-ui/tokens/tokens.dtcg.json`, ready to import into Tokens Studio for Figma or to feed Style Dictionary.

- A token that references another token becomes an alias: `"focus-ring": { "$value": "{color.ink}" }`.
- Colours, dimensions, durations, cubic-bezier easings, z-indexes and font stacks carry a `$type`. A value no DTCG type can hold, such as a stacked shadow or a `color-mix()`, keeps its CSS string and has no `$type`.
- Each token's usage note is its `$description`.
