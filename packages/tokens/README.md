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
/* the default tokens as a stylesheet */
@import "@eos-ui/tokens/tokens.css";
```

```ts
theme.dtcg(); // the same tokens as W3C Design Tokens JSON
```

All variables are prefixed `--e-` (`--e-primary`, `--e-space-4`). [Documentation](https://eos.dame.gg). MIT licensed.

## Inputs

`defineTheme()` takes 18 inputs and emits every token. Any token can also be set by name in `tokens`, which wins over everything derived. `name` labels the theme (`data-e-theme`), and `strict` throws on a contrast failure instead of listing it in `issues`.

| Input                                                  | Derives                                                                                                                                                             |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `brand`, `accent`                                      | `primary`, `secondary`, their tints and `surface-tint`                                                                                                              |
| `danger`, `warning`                                    | `danger`, `on-danger`, `danger-soft`, `warning-strong`, `warning-soft`                                                                                              |
| `background`, `surface`, `foreground`                  | the grounds, `ink`, `muted`, `border`, `border-strong`. A dark surface lifts the action colours                                                                     |
| `fonts`, `radius`                                      | `font-sans`, `font-mono`, `font-script`, `radius-sm` to `radius-lg`                                                                                                 |
| `textScale`, `spaceScale`                              | `text-xs` to `text-4xl` and the icon, checkbox and avatar boxes (`textScale`); `space-1` to `space-16` (`spaceScale`). 1 is the default                             |
| `strokes` `{ hair, focus, edge, card }`                | `stroke-hair`, `stroke-card`, `stroke-edge`, `stroke-focus` (also the focus gap), `focus-gap-field`                                                                 |
| `contrast` `"standard" \| "high" \| "auto"`            | `high` sets `border` and `border-strong` to `ink`, `muted` at 15:1, a neutral `surface-tint` and a darker `scrim`. `auto` applies it under `prefers-contrast: more` |
| `motion` `"default" \| "snappy" \| "gentle" \| "none"` | `duration-tap`, `duration-move`, `easing-out`                                                                                                                       |
| `elevation` `"outline" \| "lifted" \| "bold"`          | `frame`, `well`, `float`, `paper`. The shadow tint follows `background`                                                                                             |
| `scheme` `"light" \| "dark" \| "auto"`, `dark`         | `auto` keeps the theme light and applies `dark` (default surface `#10151a`) under `prefers-color-scheme: dark`                                                      |
| `density` `"comfortable" \| "compact"`                 | `compact` scales `space-*` by 0.75 and sets `control-height` to the 44px tap target (`chip-height` 22px)                                                            |
| `controlHeight`                                        | `control-height`, `chip-height`                                                                                                                                     |

`derivedFrom`, `constants` and `inputTokens` say which input drives each token and which tokens are fixed. Fixed tokens include `depth`, the thickness of a raised or pressed edge.

## Following the visitor

`scheme: "auto"` and `contrast: "auto"` are opt-in. The base tokens stay the light, standard theme. Each variant is derived like any other theme (so it is contrast-checked and listed in `issues`), and only the tokens that differ are emitted inside `@media (prefers-color-scheme: dark)`, `@media (prefers-contrast: more)` and both together. `color-scheme` is `light` at the root and `dark` inside the dark media query. `theme.alternates` lists them. `theme.apply()` evaluates the queries itself and repaints when they change.

```ts
defineTheme({ brand: "#8a2be2", scheme: "auto", contrast: "auto", dark: { surface: "#0e1117" } });
```

The grounds (`background`, `surface`, `foreground`) are never carried into the dark variant: give `dark` the ones it needs.

Every theme's CSS also carries two fixed overrides. Under `prefers-reduced-motion: reduce`, `duration-tap` and `duration-move` are 0.01ms (`!important`, so they beat the inline tokens `apply()` sets). Looping loaders must switch themselves off, since a loop at 0.01ms would flicker. When printing, `ink`, the borders and the grounds are black and white whatever the theme, so a component needs no print colours of its own.

## Design tools

`theme.dtcg()` returns the theme as [W3C Design Tokens](https://www.designtokens.org) JSON, grouped by kind (`color`, `spacing`, `radius`, `shadow`, `fontSize`, `size`, `stroke`, `duration`, `easing`, `zIndex`, `weight`, `font`). The default theme is also published as `@eos-ui/tokens/tokens.dtcg.json`, ready to import into Tokens Studio for Figma or to feed Style Dictionary.

- A token that references another token becomes an alias: `"focus-ring": { "$value": "{color.ink}" }`.
- Colours, dimensions, durations, cubic-bezier easings, z-indexes and font stacks carry a `$type`. A value no DTCG type can hold, such as a stacked shadow or a `color-mix()`, keeps its CSS string and has no `$type`.
- Each token's usage note is its `$description`.
