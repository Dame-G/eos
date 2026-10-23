# Contributing to EOS

EOS is a component library for Vue, with a token-based theming system. This page describes the repository layout and what a component needs before it is merged.

```
packages/tokens   @eos-ui/tokens   tokens.json -> CSS variables, defineTheme(), contrast checks
packages/vue      @eos-ui/vue      components, plugin, composables
```

## Setup

```bash
corepack enable           # or install pnpm 12
pnpm install
pnpm build                # builds tokens, then the Vue package
pnpm dev                  # watch-builds the library (see Developing against the docs site)
pnpm test                 # real-browser tests (Chromium in CI; Edge locally if installed, else Chromium)
pnpm check                # CSS rules, layers, props tables, README links (CI runs it)
pnpm lint                 # eslint and stylelint
pnpm format:check         # prettier (run `pnpm format` to fix)
pnpm knip                 # unused files, exports and dependencies
pnpm typecheck
pnpm check:built          # package exports and types, size budgets, built stylesheet (needs a build)
pnpm smoke                # builds, packs and installs both packages in a temporary app
```

Node 22 or later is required. CI runs the tests on Node 22 and 24.

### Developing against the docs site

There is no playground in this repository: the docs site (`Dame-G/eos-site`, checked out beside this repo, or anywhere with `EOS_DIR` set to this checkout) is the playground. It links `@eos-ui/vue` to `packages/vue`, so it reads the built `dist`. Run `pnpm dev` here (it builds the tokens, regenerates `src/index.ts` and runs `vite build --watch`), and run the site's dev server beside it. Edits to a component rebuild `dist` and the site reloads. After adding or removing a component folder, restart `pnpm dev` so `index.ts` is regenerated.

### Browsers

Tests run in Chromium. Locally the Chromium tests use the installed Microsoft Edge when there is one (no download) and Playwright's Chromium otherwise (`pnpm --filter @eos-ui/vue exec playwright install chromium`). Set `EOS_BROWSER_CHANNEL` to `chrome`, `msedge` or `chromium` to choose. `EOS_BROWSERS=chromium,firefox,webkit pnpm test` runs the suite in all three engines (install them with `playwright install firefox webkit`). CI runs that nightly and on demand in a job that does not block pull requests.

### Size

`pnpm check:size` compares the gzipped `style.css`, `index.js` and all JavaScript with the budgets in `scripts/size.mjs` and prints each one's headroom. A budget is the current size plus about 3%. All CSS ships as one file, so every component's CSS is paid for by every consumer: reuse tokens and shared rules, avoid repeating a rule set across components, and do not add a dependency for something small. If a deliberate change needs more, raise the limit in the same pull request and say why in its description. Per-component CSS files are not offered; consumers who need a smaller stylesheet are a reason to revisit that, not to loosen the budget.

While working on one component, run from `packages/vue` (these need `pnpm build` or `pnpm test` to have generated the tokens once):

| Command                                 | Use                                                                      |
| --------------------------------------- | ------------------------------------------------------------------------ |
| `npx vitest run src/components/Stamp`   | that component's tests                                                   |
| `node scripts/check-css.mjs`            | every rule is inside `@layer e.*`, no `!important`, no raw z-index       |
| `node scripts/check-layers.mjs`         | a component only uses components of its own layer or an earlier one      |
| `npx vue-tsc --noEmit -p tsconfig.json` | types, including `.vue` files                                            |
| `node scripts/gen-index.mjs`            | rewrites `src/index.ts` from what is on disk (never edit `src/index.ts`) |
| `node scripts/gen-props.mjs`            | rewrites every README's props table from the component source            |
| `node scripts/gen-props.mjs --check`    | fails if a props table is out of date (CI runs it as `check:props`)      |
| `node scripts/check-docs.mjs`           | README links, bare URLs, table pipes, icon names (CI: `check:docs`)      |

## A component

`src/components/<Name>/` holds:

```
EStamp.vue       script setup, template and the component's own <style>
EStamp.test.ts   Vitest browser tests
README.md        what the consumer provides, what it does, the rules
index.ts         export { default as EStamp } from "./EStamp.vue";   (plus exported types)
```

`EButton` is the model.

### Naming

- Components are `E` + a name: `EStamp`. One word where it reads well. `*Field` is a labelled input built on `EField`, `*Picker` chooses from a popup, `*Group` is a fieldset of choices, `*Row` is a compact line, `*Card` is a bordered summary, `*List` repeats items. The folder is the name without the prefix.
- Classes are `e-<block>`, `e-<block>-<part>`, `e-<block>--<modifier>`. Custom properties are `--e-*`. Layers are `e.*`.
- Composables are `src/composables/useThing.ts`, one per file.

### Props, events and slots

- Props use `defineProps<{ ... }>()` with a one-line doc comment each (it becomes the editor tooltip).
- The README's props table (between `<!-- props:start -->` and `<!-- props:end -->`) is generated from the source: edit the doc comment, the `withDefaults` value or the `defineModel` comment in the `.vue` file, never the table, then run `node scripts/gen-props.mjs` in `packages/vue`, which also formats the README with Prettier. A prop that has no default and is not required shows None. A flag is `false` unless it has a default. Write a default that the code applies elsewhere (a generated id, an i18n string) as `@default value` at the end of the doc comment. Do not start a doc comment with "Required." The table shows it.
- The main value is `defineModel()` (`v-model`). Two values use named models (`v-model:start`, `v-model:end`). Leaving `v-model` off gives local state, so there is no `defaultValue` prop.
- Other signals are emits declared with `defineEmits`, value first.
- Content goes in slots, declared with `defineSlots`. A render-prop is a scoped slot.
- Native attributes land where the consumer expects: on the `<input>` for inputs (`inheritAttrs: false`, `v-bind="$attrs"`), with `class` and `style` on the wrapper.

### Prop conventions

One name means one thing across the library. A component may have props of its own where it needs them. These are the shared ones.

| Prop                                                | Means                                                                                                                                              | Where                                                        |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `variant`                                           | Emphasis: how loudly an action speaks (`primary`, `secondary`, `outline`, `danger`, `quiet`). Nothing else uses it.                                | `EButton`, `EMenu`                                           |
| `tone`                                              | Meaning in a colour: `success`, `info`, `warning`, `danger`. Never a look.                                                                         | `EStamp`, `ENotice`, `EToast`                                |
| `status`                                            | A `StampStatus` preset (`paid`, `due`, `overdue`...). It sets the tone and the word.                                                               | `EStamp`                                                     |
| `badge*`                                            | On a composite, the props that feed its inner stamp get the prefix: `badge` and `badgeTone`. A bare `tone` or `label` on a composite is ambiguous. | `EDescriptionList`                                           |
| `small`, `large`                                    | Size, as booleans. There is no `size` enum. Medium is the default and has no prop.                                                                 | `EIcon`, `EAvatar`, `EKbd`, `EStamp`, `EText`                |
| `bare`                                              | Drops the component's own chrome (box, label, toolbar) so the parent supplies it.                                                                  | fields, `EFieldset`, `EEmptyState`, `EDataGrid`, `ECheckbox` |
| `raised`                                            | The lifted shadow of something floating above the page.                                                                                            | `ESurface`                                                   |
| `label`                                             | The name of the thing itself: the visible label of a field, or the accessible name of a control with no visible text.                              | fields, `EProgress`, `ESpinner`, `ETooltip`...               |
| `hideLabel`, `hideLegend`, `hideAction`             | Keep the text for screen readers and hide it. Always `hide` plus the part.                                                                         | fields, `EFieldset`, `ESearchBar`                            |
| `headingLevel`                                      | The level of the heading a component renders inside itself. `EHeading` is the heading, so its prop is `level`.                                     | cards, panels, dialogs, drawers                              |
| `mode`                                              | A change in what the component does (`single` or `range`, `current` or `new`). Keyboard hints are `inputmode` (as on `EOtpField`), never `type`.   | `ECalendar`, `EPasswordField`, `ESignatureField`             |
| `required`, `optional`, `disabled`, `error`, `hint` | Field state and help. `error` is one message.                                                                                                      | every field                                                  |
| `as`, `gap`, `align`, `justify`, `side`             | The element, spacing from the space scale, cross-axis and main-axis alignment, and which edge.                                                     | layout components                                            |

There are no look variants. A component has one good default. If two looks are both needed they are two components. Do not add `compact`, `plain`, `card`, `outlined` or similar switches. `ETable` has `dense` for row height and is the only one.

### Accessibility

- Real elements first: `button`, `input`, `fieldset`, `details`, `dialog`, `popover`. ARIA only where no element does the job. Complex widgets (select, combobox, menu, dialog, tooltip, tabs) use Reka UI parts.
- Label, hint and error wiring uses `useUid`. Never a module counter.
- Test every interactive state with the keyboard, and run `expectNoViolations` (axe) over each state: open, invalid, disabled, loading.
- Respect `prefers-reduced-motion`.

### Words, icons, numbers

- Every string a component writes goes through `useMessages()`, so consumers can translate or reword it. Money, dates and numbers use the configured locale and currency.
- Icons are `<EIcon name="..." />`.

### CSS

- Write the component's CSS in its own `<style>` block (not scoped) inside one `@layer e.<layer> { }`:

  | Layer          | For                                  |
  | -------------- | ------------------------------------ |
  | `e.primitives` | one job, no children of their own    |
  | `e.blocks`     | boxes and layout                     |
  | `e.controls`   | form controls                        |
  | `e.composites` | controls built from controls         |
  | `e.containers` | things that hold or announce content |
  | `e.page`       | navigation and the page frame        |

  A component uses only components of its own layer or an earlier one.

- `import "../../styles/base.css";` at the top of the script.
- Draw a stroke once. A `border`, or a `box-shadow` ring (`var(--e-frame)`, `var(--e-float)`, `inset 0 0 0 <width> <colour>`), is the whole stroke: do not lay an identical `outline` over it, because the antialiased pixels on the curve are then painted twice and every rounded corner looks heavier than its straight edges. Keep `--e-stroke-edge` a whole pixel so border and ring agree in every browser. A raised slab is the one construction in Design conventions (The slab).
- Values come from tokens (`var(--e-space-4)`). A raw colour, size or duration means a missing token, which you add to `packages/tokens/src/tokens.json` with a usage note. Logical properties only (`margin-inline-start`).
- Space belongs to the parent: a component sets no outer margin. Layout that depends on the component's own width uses container queries, not viewport media queries.
- **Private custom properties are `--_name`.** `--e-*` is the public contract: tokens from `tokens.json`, which a theme or a consumer may set. A property a component uses to pass a value between its own rules (a fill, a gap, a slab colour) starts with an underscore: `--_fill`, `--_slab`, `--_gap`. It is declared on the component's own selector, never on `:root`, and nothing outside the component reads it. Some older components still use `--e-gap`, `--e-min`, `--e-over`, `--e-chars`, `--e-swatch`, `--e-xrow-lead`, `--e-row-h`, `--e-grid-*`, `--e-table-max-h` and `--e-shell-*`; rename them to `--_*` when you touch the component.
- **Motion.** Use `--e-duration-tap`, `--e-duration-fade` and `--e-duration-move` for state changes: the theme CSS sets all three to 0.01ms under `prefers-reduced-motion`, so a transition needs no media query of its own. A looping animation (a skeleton pulse, a spinner, an indeterminate bar) uses `--e-duration-loop` or `--e-duration-spin` with `--e-easing-standard` or `--e-easing-linear`, and sets `animation: none` itself under `prefers-reduced-motion`, because a loop at 0.01ms would flicker.
- **Print.** The theme CSS makes `ink`, the borders and the grounds black and white under `@media print`. A component only hides what should not print and drops its shadow; it does not write print colours.
- **Weights and sizes.** `font-weight` is `var(--e-weight-regular | medium | strong)` (400, 500, 600; there is no 700). An icon, a checkbox or an avatar is sized with `--e-icon-size`, `--e-icon-size-sm`, `--e-icon-size-md`, `--e-icon-size-lg`, `--e-check-size`, `--e-avatar-size-sm` or `--e-avatar-size-lg`, so it grows with `textScale`.
- **A fill and its states** use the tone tokens, not a `color-mix()` of your own: `--e-<tone>`, `--e-<tone>-hover`, `--e-<tone>-press`, `--e-<tone>-slab` for `primary`, `secondary` and `danger`; `--e-<tone>-soft` for the backdrop of `success`, `info`, `warning` and `danger`; `--e-wash-hover`, `--e-wash-press` and `--e-wash-ring` for something without a fill; `--e-skeleton` for a loading placeholder; `--e-disabled-ink` and `--e-disabled-fill` for a disabled control. A raised face with no colour of its own uses the slab construction with `--e-slab-ink` (see Design conventions).
- **Breakpoints** are written as literals, because a custom property cannot be read inside `@media` or `@container`: `26rem` (a phone column), `36rem` (two columns) and `48rem` (the page frame shows its navigation). `--e-bp-narrow`, `--e-bp-medium` and `--e-bp-wide` record them for design tools. Query the component's own container (`@container`) except for the page frame.

### Documentation

A README says what the consumer provides, what the component does and the rules. It does not repeat what the props table, the types or the source already say.

- **Terse.** One sentence per fact, no history ("replaces the old...") and no restating a default: the table has a Default column, so a note never says "on by default". An accessibility bullet states a behaviour the consumer must know or act on, not one the prop note already gives or an implementation detail (percentages, colour washes).
- **Section order:** intro, example, Props, the line on where `class`, `style` and attributes land, Slots, Events, Accessibility. Drop a section that has nothing in it.
- **The intro** says what the component is for in one sentence, then names the sibling to use instead ("Use `EDrawer` to read a statement"). Link the first mention of each sibling: ``[`EDrawer`](../Drawer/README.md)``. Later mentions stay plain code.
- **Links.** Relative links between repo files. Named links for sites (`[Documentation](https://eos.dame.gg)`), never a bare URL. A package README may link other packages by path. Do not link a heading to itself.
- **Highlighting.** Code font for anything the reader types or the code names: components, props, events, slots, CSS properties, message keys, attribute values and key names in code (`aria-pressed`, `Escape` as `event.key`). Quotes for words a user sees or hears ("Copied", "Page 2"). Plain text for key names in a keyboard list (Arrow Left, Enter). Bold only for the **Required** marker the generator writes.
- **Examples** use only values that work: icon names from the built-in set (`iconNames`), real props, no `size` enum.
- **Tables.** Escape `|` inside a cell as `\|`. Props tables are generated, so edit the source comment (see above).

`pnpm check` (its `check:docs` part) checks links, bare URLs, table pipes, sibling links in the intro and icon names in examples. CI runs it.

### Definition of done

1. Tests pass, including keyboard and axe.
2. `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm knip`, `pnpm check` (CSS rules, layers, props tables, README links) and, after a build, `pnpm check:built` (package exports, size, built stylesheet) pass. CI runs all of them.
3. README (following Documentation above), `index.ts` and exported prop types exist.
4. The component works without the plugin installed and with a custom theme applied.

A pull request that changes `packages/**` also runs the `Site check` workflow, which builds the docs site (`Dame-G/eos-site`, `main`) against your branch. It is not a required check, but a failure means the change breaks the site. If the site needs a matching change, open the site pull request first or at the same time, link the two, and re-run the job once the site change is merged. The site repo is private, so the job needs a `SITE_REPO_TOKEN` secret (a fine-grained token with read access to the contents of `Dame-G/eos-site`). Without it, and on pull requests from forks, the job skips.

## Design conventions

What every component shares: spacing, type, the slab, how a control answers the pointer, how it shows it is selected or disabled, and its focus ring. Each is a token in `packages/tokens/src/tokens.json` (read its usage note) or a utility class in `packages/vue/src/styles/base.css`. A component uses them. A value that is missing is a token to add, not a number to write.

### Spacing

Spacing has a semantic layer on top of the `space-N` scale (4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64px; `space-5`, `-7`, `-10` and `-16` are public scale steps for one-off needs). Components read the semantic tokens, which are references to `space-N`, so `spaceScale` and `density: "compact"` reach them with no code in the component.

| Need                                                                                    | Token            | Value |
| --------------------------------------------------------------------------------------- | ---------------- | ----- |
| Icon and label, inside a chip, label and hint                                           | `gap-tight`      | 4     |
| Siblings in a row or cluster: toolbar controls, button groups, form actions             | `gap-snug`       | 8     |
| Blocks in a stack, a label and its control, a pager (the `EStack` default)              | `gap-base`       | 12    |
| Field to field in a form, cards in a grid, the parts of a dialog                        | `gap-loose`      | 16    |
| Groups of related blocks, sections of a page                                            | `gap-section`    | 24    |
| Inline padding of a text control (button, input, select, tab), less its border          | `pad-control`    | 16    |
| Inline padding of a quiet or compact control, a menu item, a list row                   | `pad-control-sm` | 12    |
| Chip, stamp, tag                                                                        | `pad-chip`       | 12    |
| Table and grid cells (block, then inline)                                               | `pad-cell`       | 12 16 |
| Card, summary, notice, any bordered container                                           | `pad-card`       | 16    |
| Dialog, drawer, popover section                                                         | `pad-panel`      | 24    |
| Side gutter of a page: `gutter-min` on a phone, growing with the viewport to `space-12` | `gutter`         | fluid |

- **The parent owns the space.** Siblings are separated by the parent's `gap`, never by a child's `margin-bottom`. Two blocks of the same kind that sit one after the other (two code blocks, two notices) are separated by `gap-base`, not by nothing. A component sets no outer margin and uses logical properties.
- **Block size is never padding.** A control is `control-height` tall. Padding is inline only (`padding: 0 calc(var(--e-pad-control) - var(--e-stroke-edge))`).
- **A toolbar is a wrapping cluster.** `display: flex; flex-wrap: wrap; gap: var(--e-gap-snug)`, row gap included. Below `26rem` of the component's own container, inputs and selects take the full row (`flex: 1 1 100%`) and a pager stacks above its range text, so nothing is squeezed and everything stays aligned to one left edge.
- **Tap spacing.** Every target is at least `--e-tap` (44px) square and at least `gap-snug` from the next one.
- **Phones.** The page gutter is `gutter-min`; a container keeps its `pad-card`. Never go below `pad-control-sm` to fit something in; wrap or stack it.
- **No literals.** `node scripts/check-css.mjs --spacing` (in `packages/vue`) lists raw lengths in `gap`, `padding` and `margin`.

### Type

A style is a token: `font: var(--e-type-kicker)` sets weight, size, line-height and family. `letter-spacing` is separate (`var(--e-tracking-label)` for uppercase labels, `var(--e-tracking-tight)` for large figures). `.e-kicker`, `.e-numeral` and `.e-numeral-l` in `base.css` are built from them. Styles: `type-h1`..`type-h6`, `type-deck`, `type-body`, `type-small`, `type-kicker`, `type-button`, `type-numeral`, `type-numeral-l`.

Sizes are rem (`text-xs` to `text-4xl`, `control-height`, `chip-height`, the icon, check and avatar boxes), so the visitor's browser font size scales text and the controls around it. `textScale` multiplies on top. Line heights are unitless: `leading-none` 1, `-tight` 1.15 (titles, kickers, buttons), `-snug` 1.3 (section titles, numerals), `-normal` 1.5 (copy), `-loose` 1.7. Never a line-height under 1, and never a pixel line-height.

### The slab

The slab is the raised bottom edge under a face. There is one construction, the Button's: a border on all four sides in the slab colour, the bottom one thicker by the lift.

```css
.e-thing {
  --_slab: var(--e-primary-slab); /* the edge colour */
  --_ring: var(--_slab); /* the other three sides; a state may set it apart */
  --_lift: var(--e-slab); /* how far the edge reaches */

  border: var(--e-stroke-edge) solid var(--_ring);
  border-bottom-width: calc(var(--e-stroke-edge) + var(--_lift));
}

.e-thing:active {
  --_lift: 0px; /* pressed: the face sinks over the edge */
}
```

The recipe comment in `base.css` is the reference; use `--e-slab-ink` for `--_slab` on a face with no colour of its own. Thickness comes from three tokens and nothing else (no `0.6 *`, `1.5 *`, `space-1`): `slab-thin` (a small part: a switch thumb, a key), `depth` (everything else; `slab` is its deprecated alias), and `slab-bold` for a side edge that marks a tone (Notice, Stamp, Toast), always `calc(var(--e-stroke-edge) + var(--e-slab-bold))` on the inline-start border. A tone's edge colour is its `*-slab` token. Do not draw the slab as a gradient band, a `::before` bar or an inset shadow. The one exception is a face that cannot grow a border: `--e-slab-edge` (the face is shorter by `--e-depth`), and `--e-slab-sink` for a quiet control toggled on.

### Corners

A rounded thing inside a rounded, bordered thing has a smaller radius, so the two curves share a centre: the child's radius is the container's radius less the distance between their outer edges. Never give both the same token, and never use `border-radius: inherit` to fill a parent that has a border.

```css
.e-thing-child {
  /* inside the container's border (stroke-edge, or stroke-card for a card, panel or table) and a gap-tight of padding */
  border-radius: max(0px, calc(var(--e-radius-md) - var(--e-stroke-edge) - var(--e-gap-tight)));
}
```

Write the sum where the child is styled, with the container's real border and padding: a custom property built from `var(--e-radius-md)` is resolved where it is declared, so a scoped theme that sets `--e-radius-md` on a container would not reach it. A component that needs the sum twice keeps the inset in a private `--_inset` and computes `max(0px, calc(var(--e-radius-md) - var(--_inset)))` on the element itself. Rows of a list panel, a menu or a stepper sit `gap-tight` inside an unbordered `radius-md` panel and use `--e-radius-row`, which is that sum; inside a bordered container take the border off too: `max(0px, calc(var(--e-radius-row) - var(--e-stroke-edge)))`. A theme from `defineTheme` sets `radius-row` with the other tokens, so a scoped theme reaches it. Use the real inset for a child that fills its container, such as a segment or the picture in an avatar ring. The maths follows every `radius` setting (`sharp`, `default`, `round`). A circle or pill (`radius-round`, `radius-pill`) is left alone.

### Hover, press and focus

One recipe for anything that can be pressed. The recipe comment and `.e-interact` in `base.css` are the reference; a component that needs its own selectors copies these declarations. A bordered item (a tab, a segment) recolours its own border instead of adding a ring, so its edge never thickens. A text link, a breadcrumb and a disclosure summary are the named exceptions and draw no ring.

| State      | Quiet item (no fill)                                                               | Filled control                          |
| ---------- | ---------------------------------------------------------------------------------- | --------------------------------------- |
| rest       | none                                                                               | its fill                                |
| hover      | `--e-wash-hover` and `box-shadow: var(--e-ring-hover)`                             | `--e-<tone>-hover` fill                 |
| press      | `--e-wash-press` and `box-shadow: var(--e-ring-press)`                             | `--e-<tone>-press` fill, `--_lift: 0px` |
| transition | `transition: var(--e-transition-state)`                                            | the same                                |
| focus      | solid `--e-stroke-focus` outline in `--e-focus-ring`, offset by `--e-stroke-focus` | the same                                |

- The ring is `--e-stroke-edge` wide, one value for every hover (not `stroke-card`, `stroke-hair` or `stroke-edge` as the case may be). Hover darkens the edge to `wash-ring`, press to `ink`, so a pressed item reads as sunk.
- Focus has three variants. **Default:** outline 2px, offset 2px (buttons, links, tabs, rows). **Inset** (`.e-interact--inset`): offset `-2px`, for rows that touch their neighbours or sit in a clipped list. **Field**: `--e-focus-field` (primary), offset `--e-focus-gap-field`, laid exactly over the border of a text input. An invalid input keeps `danger`.
- Never gate a state on colour alone: hover, press and disabled also change a ring, a slab or an outline.
- Hover styles are held back for devices that can hover by the build (`postcss-hover`); write `:hover` plainly.

### Selected

There are two voices, and a component uses one.

| Voice     | Means           | Look                                                                                   | Used by                                                                               |
| --------- | --------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Value** | a value you set | filled `--e-primary` with `--e-on-primary`, `primary-slab` edge                       | toggle button, checkbox, radio, switch, segmented control, current page, selected day |
| **Place** | where you are   | `wash-hover` face, `primary` text and a `primary` edge                                 | tab, nav item                                                                         |

Place is drawn two ways on purpose. A tab sits in a bordered strip next to its neighbours, so the selected one thickens all four of its edges evenly and the bottom one is primary; a nav item stands alone and takes a real slab, its bottom border thicker by `--e-depth`.

### Disabled

A control keeps its box, drops its lift, dims to `--e-disabled-ink` and draws a dashed `border-strong` outline inside its edge, so colour is never the only cue. A list row (menu item, option, nav item) only dims its text and stops answering the pointer: a dashed box on every unavailable row is noise. Both use `aria-disabled` or `disabled`, not just a class.

### Motion

`duration-tap` (80ms) for hover and press, `duration-fade` (140ms) for things that fade, `duration-move` (220ms) for things that move. Arriving uses `easing-enter`, leaving `easing-exit`, every state change `easing-out`. The theme CSS collapses the three durations under `prefers-reduced-motion`.

### Layers and theme

`e.reset` is declared in the layer order and has no rules in this package. It is public: a site puts its own resets (for example a documentation theme's defaults) in `@layer e.reset` and the library overrides them. Do not remove it.

`tokens.css` is the light theme with `prefers-contrast: more` handled. `tokens.auto.css` also follows `prefers-color-scheme`; use it only when the page ground follows the scheme too, otherwise dark components sit on a white page.

## Releases

Run `pnpm changeset` for each user-facing change: anything that changes behaviour, the API, the CSS a consumer receives, or the published README. CI fails a pull request that changes `packages/**` without a changeset. Docs-only wording changes, tests and internal refactors do not need one: add the `no-changeset` label to the pull request to skip the check. Do not delete or edit other people's pending changesets. Merging to `main` opens a version PR. Merging that PR publishes both packages to npm at one shared version, but only after CI has passed on `main`; the release also runs the built-package checks (`pnpm check:built`) before it publishes.
