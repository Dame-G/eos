# EOS

A component library for Vue. High contrast and consistent by default, rebrandable with a few lines.

| Package                             | What it is                                                              |
| ----------------------------------- | ----------------------------------------------------------------------- |
| [`@eos-ui/vue`](packages/vue)       | Components (`EButton`, `ETextField`, ...), plugin, composables          |
| [`@eos-ui/tokens`](packages/tokens) | Design tokens as CSS variables and `defineTheme()` with contrast checks |

[Documentation and live examples](https://eos.dame.gg)

## Use

```bash
npm install @eos-ui/vue
```

```ts
import { createApp } from "vue";
import { createEos } from "@eos-ui/vue";
import "@eos-ui/vue/style.css"; // once, in your entry file

createApp(App)
  .use(
    createEos({
      locale: "en-CA",
      currency: "CAD",
      theme: { brand: "#2c95b4", fonts: { sans: "Inter, system-ui, sans-serif" }, radius: "round" },
    }),
  )
  .mount("#app");
```

```vue
<script setup lang="ts">
import { ref } from "vue";
import { ETextField, EButton } from "@eos-ui/vue";
const email = ref("");
</script>

<template>
  <ETextField v-model="email" label="Email" type="email" required />
  <EButton>Continue</EButton>
</template>
```

The stylesheet is mandatory: import `@eos-ui/vue/style.css` once in your entry file, even if you skip the plugin and register components yourself. The JavaScript has no CSS imports, so server rendering works in plain Node without bundler setup, and the stylesheet is the only thing you have to wire. Everything sits in the cascade layers `e.*`, so your own CSS wins without specificity fights. Components also work without the plugin, in English and US dollars.

`createEos()` takes `locale`, `currency`, `dir`, `messages`, `icons`, `theme`, `themeTarget` (theme one element instead of `<html>`), `portalTarget` (where menus, dialogs and toasts render) and `warnOnContrast`.

## Requirements and packaging

- **ESM only.** There is no CommonJS build. Use a bundler (Vite, Nuxt, webpack, Rollup) or Node ESM (`import`, or `require()` of ESM on Node 22 and later).
- **Node 22 or later** for tooling and server rendering. Vue 3.5 or later.
- **One stylesheet, about 21 kB gzipped.** All component CSS ships in `style.css`: there are no per-component CSS files, so importing one component still needs the whole file. It is cached across pages and sits in cascade layers, so it costs one request. Keep it small in your app by using the tokens instead of adding your own rules for the same thing.
- **Tree-shaking is your bundler's job.** The package is marked side-effect free apart from CSS and exports each component by name, so `import { EButton } from "@eos-ui/vue"` keeps only what you use in a production build. Import from the package root, not from `dist` paths.
- **Per-component paths.** Each component also has a path of its own, `@eos-ui/vue/components/<Name>` (`import { EButton } from "@eos-ui/vue/components/EButton"`), with `createEos` and `themeCss` at `@eos-ui/vue/plugin`. They are the same modules the root exports, so mixing the two is safe. Use them when a bundler cannot tree-shake the root, or to leave out the built-in Phosphor icons (about 9 kB gzipped): the root registers that set when it is imported, the per-component paths do not. Add `import "@eos-ui/vue/icons/builtin"` once to have it back, or give `createEos({ icons })` a set of your own. `icons: { builtin: false }` turns the fallback off either way.
- **Fonts are opt-in.** `@eos-ui/vue/fonts.css` loads Bricolage Grotesque and Geist Mono from Google Fonts. That sends visitors' IP addresses to Google, so leave it out if that matters (self-host the fonts, or set `defineTheme({ fonts })` to fonts you already load). Without it the theme falls back to system fonts.
- **Editor types.** Importing `@eos-ui/vue` gives Volar and `vue-tsc` the type of `$e` (the config) in templates. `createEos()` registers no components, so the types of globally registered ones are opt-in: after `app.component("EButton", EButton)`, add `import type {} from "@eos-ui/vue/globals"` once (or `"types": ["@eos-ui/vue/globals"]` in `tsconfig.json`). Without it, a component you forgot to import fails the type check instead of failing at run time. The resolver below needs no extra types: `unplugin-vue-components` writes its own `components.d.ts`.

For template auto-import, use the resolver:

```ts
import { EosResolver } from "@eos-ui/vue/resolver";
Components({ resolvers: [EosResolver()] }); // unplugin-vue-components
```

The resolver imports components only, not the stylesheet. Pass `EosResolver({ css: true })` to have it add `import "@eos-ui/vue/style.css"` along with the first auto-imported component, or import the stylesheet in your entry file.

## Theming

A theme is a set of CSS variables. `defineTheme()` derives the deep action colours from your brand colour and checks every contrast pair the system promises. It takes 18 design inputs: `brand`, `accent`, `danger`, `warning`, `background`, `surface`, `foreground`, `fonts`, `radius`, `elevation`, `strokes`, `contrast`, `textScale`, `spaceScale`, `controlHeight`, `motion`, `density` and `scheme` (with its `dark` variant).

```ts
import { defineTheme } from "@eos-ui/vue";

const clinic = defineTheme({ name: "clinic", brand: "#8a2be2", accent: "#2e7d32" });
clinic.issues; // [] when every contrast pair holds
```

Or override variables in plain CSS. Your CSS wins because the library is layered:

```css
:root {
  --e-primary: #0b4f6c;
  --e-radius-md: 12px;
}
```

The design rules (spacing rhythm, where depth is allowed, one control height) are not options. They keep every theme the same system.

## Words and language

Every string a component writes can be replaced, and money, dates and numbers follow the configured locale:

```ts
createEos({ locale: "fr-CA", currency: "CAD", messages: { required: "Obligatoire" } });
```

A message that takes a count has one form per plural category, picked with the locale's plural rules. A plain string works too and is used for every count. `other` is required.

```ts
createEos({
  locale: "pl",
  messages: { rows: { one: "{n} wiersz", few: "{n} wiersze", many: "{n} wierszy", other: "{n} wiersza" } },
});
```

`resultsCount`, `rows`, `rowsAnnounce` and `rangeDone` are plural messages.

## Bring your own icons

EOS draws its built-in Phosphor icons until you give it your own. Adapters take the icon library you already use, so EOS adds no dependency:

```ts
import { createEos } from "@eos-ui/vue";
import { lucide } from "@eos-ui/vue/icons";
import { Check, X, CreditCard, TriangleAlert } from "lucide-vue-next";

createEos({ icons: lucide({ Check, X, CreditCard, TriangleAlert }) }); // an explicit map tree-shakes; `import *` keeps every icon
```

Other sets work the same way, each given its module:

```ts
import * as tablerIcons from "@tabler/icons-vue";
import * as outline from "@heroicons/vue/24/outline"; // the path picks the variant
import * as ph from "@phosphor-icons/vue";
import { tabler, heroicons, phosphorVue } from "@eos-ui/vue/icons";
import { iconify } from "@eos-ui/vue/icons/iconify"; // needs the optional peer @iconify/vue

tabler(tablerIcons);
heroicons(outline);
phosphorVue(ph);
iconify("lucide");
```

`<EButton icon="credit-card">` then finds the icon in your set. The names EOS uses itself (`card`, `alert`, `home`) map to your set's names. Anything your set lacks falls back to the built-in icon. `builtin: false` turns that off. An `icon` prop also takes a component (`:icon="CreditCard"`). All 41 names, the options and the custom resolver are in [packages/vue/src/icons/README.md](packages/vue/src/icons/README.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Licensed under MIT. Icons are [Phosphor](https://phosphoricons.com) (MIT).
