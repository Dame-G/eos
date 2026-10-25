---
"@eos-ui/tokens": minor
"@eos-ui/vue": minor
---

One material language: Raised, Flush and Sunk.

- **Floating surfaces are slabs.** `--e-shadow-float` (`--e-float` before the renames in this release) is the ring, a hard bottom edge twice `--e-depth` deep in `--e-slab-ink`, and one faint drop, in place of four soft shadows. Popovers, menus, list panels, the date panel, toasts, dialogs and the command palette read as slabs lifted off the page. `elevation: "lifted"` stands cards on a slab of `depth` and widens the drop instead of adding soft card shadows; `"bold"` keeps 2px rings and deeper wells. Every shadow of a theme, the well included, is drawn in one shade.
- **The slab is a dimension.** `defineTheme({ depth })` sets `depth` in px and derives `depth-thin` (half, at least 1px) and `depth-bold` (double). The `ink` preset stands on a 3px slab; `quiet` is a quiet slab (1px) on the outline elevation instead of soft lifted shadows.
- **Round slab corners everywhere.** Every raised face (the current page, the chosen segment, a checked box, the switch, a tag, an expandable row, a pressable avatar) has bottom corners taller by its lift, so the face inside stays round; the tone edge of a notice, stamp and toast has start corners wider by `depth-bold`.
- **The slab follows the face's height.** `depth-thin` up to `chip-height` (a checkbox, a radio, the switch, a slider thumb, a tag, a key), `depth` up to `control-height`. A checked box and a slider thumb now stand on the thin slab.
- **The switch** rises on a thin primary slab when on, and its thumb is a surface face on a thin slab, like the slider's.
- **A ladder of selection.** Hover is the neutral wash everywhere (a checkbox, radio or switch no longer previews the primary tint). Where you are is the pastel brand tint: `--e-primary-soft` is now built from `brand` and is the face of the selected tab, the current nav item, the current step and a calendar range. A value you set stays filled primary on its slab. Selecting a tab, segment or page no longer changes the label's weight, so it keeps its width.
- **`ENavList`**: the current item is the place tint with a primary edge and no slab.
- **`info-soft`** follows `primary-soft`, so an information notice, stamp or toast reads apart from a neutral one.
- **The neutral slab**: `--e-slab-ink` is `border-strong` (4.5:1), so neutral slabs and sunk states (a toggled icon button) show in a dark theme, where the old value was about 1.1:1. Outline buttons, tags, keys, expandable rows and pressable avatars use it.
- **Disabled** buttons, icon buttons, checkboxes, radios, the switch, tabs, segments and the slider draw their dashed edge as a `::before` over their own edge (text inputs keep their outline), so a page's focus or outline reset can no longer remove it.
- **Motion**: every floating surface arrives with one shared pop-in (a short drop onto its slab over `duration-fade`); dialogs scale in over `duration-fade` too.
- **Type**: `type-helper` and `type-count` put help text and counts on a 20px line; `h1` and `h2` take `tracking-tight`; the toast title is the `h4` style.
- **Corners**: `--e-radius-row` is the 6px row corner (`radius-md` less `pad-inset`) and every nested row and small inset part uses it.
- **`ETextarea`** takes `size` (`sm`, `md`, `lg`): its padding centres one line as a text field of that size does.
- **`ECodeBlock`** shows overflow as a shade at the end edge (the left one in a right-to-left page), and draws no scrollbar on a touch screen.
- **`EStamp`** has the same tinted space on both sides of its text, and in a column too narrow for it cuts its words with an ellipsis (the whole text stays for screen readers and shows on pointing) instead of running past its edge.
- New tokens: `list-max-height`, `leading-helper`, `leading-chip`, `type-helper`, `type-count`. Removed tokens: `slab-edge` (unused), `tracking-snug` and `tracking-wide` (use `tracking-label`, or none). The layer order gains `e.state` after `e.page`, for the shared hover, press and disabled states.
