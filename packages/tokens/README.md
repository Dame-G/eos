# @eos-ui/tokens

The design tokens behind Eos (colour, spacing, radius, shadow, type, size, motion, layering) as CSS custom properties, typed values, and `defineTheme()`, which builds a theme from a brand colour and checks every promised contrast pair.

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

All variables are prefixed `--e-` (`--e-primary`, `--e-space-4`). Documentation: https://eos.dame.gg. MIT licensed.

## Inputs

`defineTheme()` takes 15 inputs and emits every token. Any token can also be set by name in `tokens`, which wins over everything derived. `name` labels the theme (`data-e-theme`), and `strict` throws on a contrast failure instead of listing it in `issues`.

| Input                                                  | Derives                                                                                         |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `brand`, `accent`                                      | `primary`, `secondary`, their tints and `surface-tint`                                          |
| `danger`, `warning`                                    | `danger`, `on-danger`, `danger-soft`; `warning-strong`, `warning-soft`                          |
| `background`, `surface`, `foreground`                  | the grounds, `ink`, `muted`, `border`, `border-strong`; a dark surface lifts the action colours |
| `fonts`, `radius`                                      | `font-sans`, `font-mono`; `radius-sm` to `radius-lg`                                            |
| `textScale`, `spaceScale`                              | `text-xs` to `text-4xl`; `space-1` to `space-8` (1 is the default)                              |
| `strokes` `{ hair, focus }`                            | `stroke-hair`, `stroke-edge`, `stroke-focus`, `focus-gap`, `focus-gap-field`                    |
| `motion` `"default" \| "snappy" \| "gentle" \| "none"` | `duration-tap`, `duration-move`, `easing-out`                                                   |
| `elevation` `"outline" \| "lifted" \| "bold"`          | `edge`, `well`, `float`; shadow tint follows `background`                                       |
| `controlHeight`                                        | `control-height`, `chip-height`                                                                 |

`derivedFrom`, `constants` and `inputTokens` say which input drives each token and which tokens are fixed. Fixed tokens include `depth`, the thickness of a raised or pressed edge.
