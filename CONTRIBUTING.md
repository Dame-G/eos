# Contributing to Eos

Eos is a set of accessible Vue 3 components and a token-based theming system. This page describes the repository layout and what a component needs before it is merged.

```
packages/tokens   @eos-ui/tokens   tokens.json -> CSS variables, defineTheme(), contrast checks
packages/vue      @eos-ui/vue      components, plugin, composables
```

## Setup

```bash
corepack enable           # or install pnpm 12
pnpm install
pnpm build                # builds tokens, then the Vue package
pnpm test                 # real-browser tests (Chromium in CI, Edge locally)
pnpm lint                 # eslint and stylelint
pnpm typecheck
pnpm check:package        # package exports and types (needs a build)
pnpm check:size           # stylesheet and JavaScript size budgets (needs a build)
pnpm smoke                # builds, packs and installs both packages in a temporary app
```

Node 22 or later is required.

While working on one component, run from `packages/vue` (these need `pnpm build` or `pnpm test` to have generated the tokens once):

| Command                                 | Use                                                                      |
| --------------------------------------- | ------------------------------------------------------------------------ |
| `npx vitest run src/components/Chip`    | that component's tests                                                   |
| `node scripts/check-css.mjs`            | every rule is inside `@layer e.*`, no `!important`, no raw z-index       |
| `node scripts/check-layers.mjs`         | a component only uses components of its own layer or an earlier one      |
| `npx vue-tsc --noEmit -p tsconfig.json` | types, including `.vue` files                                            |
| `node scripts/gen-index.mjs`            | rewrites `src/index.ts` from what is on disk (never edit `src/index.ts`) |

## A component

`src/components/<Name>/` holds:

```
EChip.vue        script setup, template and the component's own <style>
EChip.test.ts    Vitest browser tests
README.md        what the consumer provides, what it does, the rules
index.ts         export { default as EChip } from "./EChip.vue";   (plus exported types)
```

`EButton` is the model.

### Naming

- Components are `E` + a name: `EChip`. One word where it reads well. `*Field` is a labelled input built on `EField`, `*Picker` chooses from a popup, `*Group` is a fieldset of choices, `*Row` is a compact line, `*Card` is a bordered summary, `*List` repeats items. The folder is the name without the prefix.
- Classes are `e-<block>`, `e-<block>-<part>`, `e-<block>--<modifier>`. Custom properties are `--e-*`. Layers are `e.*`.
- Composables are `src/composables/useThing.ts`, one per file.

### Props, events and slots

- Props use `defineProps<{ ... }>()` with a one-line doc comment each (it becomes the editor tooltip).
- The main value is `defineModel()` (`v-model`). Two values use named models (`v-model:start`, `v-model:end`). Leaving `v-model` off gives local state, so there is no `defaultValue` prop.
- Other signals are emits declared with `defineEmits`, value first.
- Content goes in slots, declared with `defineSlots`. A render-prop is a scoped slot.
- Native attributes land where the consumer expects: on the `<input>` for inputs (`inheritAttrs: false`, `v-bind="$attrs"`), with `class` and `style` on the wrapper.

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
  | `e.account`    | statements, bookings, details        |
  | `e.page`       | navigation and the page frame        |

  A component uses only components of its own layer or an earlier one.

- `import "../../styles/base.css";` at the top of the script.
- Values come from tokens (`var(--e-space-4)`); a raw colour, size or duration means a missing token, which is added to `packages/tokens/src/tokens.json` with a usage note. Logical properties only (`margin-inline-start`).
- Space belongs to the parent: a component sets no outer margin. Layout that depends on the component's own width uses container queries, not viewport media queries.

### Definition of done

1. Tests pass, including keyboard and axe.
2. `check-css`, `check-layers`, `vue-tsc`, `eslint` and `stylelint` are clean.
3. README, `index.ts` and exported prop types exist.
4. The component works without the plugin installed and with a custom theme applied.

## Releases

Run `pnpm changeset` for each user-facing change. Merging to `main` opens a version PR. Merging that PR publishes both packages to npm at one shared version.
