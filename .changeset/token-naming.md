---
"@eos-ui/tokens": minor
"@eos-ui/vue": minor
---

Token names follow one scheme, `<family>-<role>[-<step>]`, and a few magic numbers become tokens.

Renamed (set the new name in your CSS and in `defineTheme({ tokens })`; the `defineTheme` inputs keep their names):

| Old                              | New                                        |
| -------------------------------- | ------------------------------------------ |
| `--e-text-link`                  | `--e-link`                                 |
| `--e-warning-strong`             | `--e-warning` (it was an alias of it)      |
| `--e-icon-size`                  | `--e-icon-size-md`                         |
| `--e-icon-size-md` (1.75rem)     | `--e-icon-size-lg`                         |
| `--e-icon-size-lg` (2.5rem)      | `--e-icon-size-xl`                         |
| `--e-size-panel-sm`, `-md`, `-lg` | `--e-panel-width-sm`, `-md`, `-lg`        |
| `--e-size-list-max`              | `--e-list-max-height`                      |
| `--e-frame`                      | `--e-shadow-frame`                         |
| `--e-well`                       | `--e-shadow-well`                          |
| `--e-float`                      | `--e-shadow-float`                         |
| `--e-paper`                      | `--e-shadow-paper`                         |
| `--e-slab-sink`                  | `--e-shadow-sink`                          |
| `--e-ring-hover`                 | `--e-shadow-ring-hover`                    |
| `--e-ring-press`                 | `--e-shadow-ring-press`                    |
| `--e-focus-gap-field`            | `--e-stroke-focus-gap-field`               |
| `--e-underline-offset`           | `--e-stroke-underline-offset`              |
| `--e-slab-thin`                  | `--e-depth-thin`                           |
| `--e-slab-bold`                  | `--e-depth-bold`                           |

The icon sizes moved by one step, so each `EIcon` `size` reads the token of its own name (`sm`, `md`, `lg`, `xl`). Mind the order when you replace them: `--e-icon-size-md` and `--e-icon-size-lg` still exist, with new values. `--e-depth`, `--e-depth-thin` and `--e-depth-bold` are their own `depth` group in `groups` and the DTCG output (they were under `stroke`), and the shadows are all `shadow-*`, so `--e-paper` no longer reads like the `--e-surface-paper` colour.

New tokens: `z-header` (the sticky `EAppHeader`, which no longer computes its own layer), `avatar-size-md` (the default `EAvatar`, 2.75rem, in place of the 44px tap target, so it follows `textScale` like the other avatar sizes), `container-width-sm`, `-md` and `-lg` (the `EContainer` `width` steps, 40, 60 and 80rem) and `term-width` (the 8rem label column of `EDescriptionList`).
