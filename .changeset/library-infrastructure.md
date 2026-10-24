---
"@eos-ui/vue": minor
---

**Development warnings no longer ship to production.** `isProduction()` guarded its lookup with `typeof process`, which bundlers leave in place, so it was false in every browser bundle. It now reads `process.env.NODE_ENV` alone, and `check:dist` bundles it both ways to prove it.

**Per-component paths.** `@eos-ui/vue/components/EButton` (any component), `@eos-ui/vue/plugin` (`createEos`, `themeCss`) and `@eos-ui/vue/icons/builtin`. They are the modules the root exports, so mixing them is safe. The built-in Phosphor set (about 9 kB gzipped) is now registered by the package root instead of imported by the config, so an app that imports only per-component paths does not bundle it; `import "@eos-ui/vue/icons/builtin"` brings it back. Importing the root behaves as before, with or without the plugin.

**Global component types are opt-in.** `createEos()` registers no components, so `GlobalComponents` moved to `@eos-ui/vue/globals` (`import type {} from "@eos-ui/vue/globals"` after `app.component(...)`). A component you forgot to import now fails `vue-tsc` instead of failing at run time. `$e` is still typed by the package.

**Internal composables are no longer exported:** `useSize`, `useDetails`, `useFieldControl`, `useFormField`, `FORM_KEY`, `isApple` and `localeDirection`. They were undocumented helpers for the components. `focusInside` still is, from one file.

**Icon components in `createEos({ icons: { icons } })` stay raw** instead of becoming reactive proxies.

**New:**

- `ELinkCard`: a card that is one link (`title`, `href`/`to`/`linkComponent`, `external`, `as`, `size`), the whole card the click target, with a border that hover recolours and never thickens.
- `EConfigProvider`: a scoped config for part of the page. Inherits the parent config and overrides `theme`, `scheme`, `locale`, `currency`, `dir`, `messages` and `icons`; the theme's tokens go on its element, and floating parts opened inside render inside it (`portal`).
- `EAppHeader` `brand`, `brandHref`, `brandTo`, `brandLabel`, `linkComponent` and a `brand` slot: a styled home link.
- `EDefinition` `inline`: the term in running text, without the info icon.
- `createEos({ applyTheme: false })`: leaves the theme to CSS the page ships itself.
- `EToast` and `ToastTone` take `neutral`. `EText` takes `tone="neutral"`. `ESurface` takes `variant="tinted"`. `EAvatar` takes `presence`. `EDescriptionList` items take `stamp` and `stampTone`.
- Shared `Size`, `Tone` and `ElementTag` types; each component narrows them with `Extract`, and every polymorphic `as` takes an `ElementTag`.

**Fixes:**

- `EInline` and `EGrid` with `as="ul"` or `"ol"` drop the bullets and padding and keep the list role, as `EStack` does.
- A sticky `EAppHeader` sits above anything the page raises (a sticky table head, a focused control) and below every overlay. It was level with a sticky table head.
- A dialog or select no longer shifts a page that sets `scrollbar-gutter: stable`: the scroll lock does not pad the body there.
- `EAvatar` capitalises its initials in the configured locale.

**EIcon sizes.** The default is now an explicit `md` = 20px, with `sm` 14px, `lg` 28px and `xl` 40px. `sm` and the default keep their size. An explicit `size="md"` was 28px and is now 20px: write `size="lg"` for 28px. `size="lg"` was 40px and is now 28px: write `size="xl"` for 40px.

**Repository:** the root build builds the tokens once, `pnpm ssr` renders every component on the server from the build (in `check:built` and the smoke test), the accessibility matrix covers every tone of Tag, Stamp, Text and Metric with Highlight and Kbd, and `check:icon-aliases` checks the Iconify aliases (needs the network).
