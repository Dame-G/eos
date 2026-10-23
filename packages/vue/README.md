# @eos-ui/vue

A component library for Vue. High contrast and consistent by default, rebrandable with a few lines.

[Documentation, live examples and a theme playground](https://eos.dame.gg)

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
      theme: { brand: "#2c95b4", radius: "round" },
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

- One stylesheet (about 21 kB gzipped), imported once: `@eos-ui/vue/style.css` is required even without the plugin. All CSS ships in that file (no per-component CSS). The JavaScript has no CSS imports, so server rendering needs no bundler setup.
- Requirements: ESM only, Node 22 or later, Vue 3.5 or later. Tree-shaking is done by your bundler. Your bundler must replace `process.env.NODE_ENV` with a literal, as Vite, webpack, Rollup, esbuild and Nuxt do by default. The library reads it to keep development warnings (a theme that fails contrast) out of production builds; with a bundler that does not define it, the warnings stay on, and you can turn the contrast one off with `warnOnContrast: false`.
- `@eos-ui/vue/fonts.css` is opt-in: it loads the default typefaces from Google Fonts, which shares visitors' IP addresses with Google. Skip it to self-host or use system fonts.
- Everything sits in the cascade layers `e.*`, so your own CSS wins without specificity fights.
- Plugin options: `locale`, `currency`, `dir`, `messages`, `icons`, `theme`, `themeTarget`, `portalTarget` and `warnOnContrast`.
- A message can be a plural object (`{ one, other }` and the locale's other categories) when it takes a count `n`. `resultsCount`, `rows`, `rowsAnnounce` and `rangeDone` do.
- `defineTheme()` (re-exported from [`@eos-ui/tokens`](../tokens)) builds a theme from `brand`, `accent` and other inputs and checks its contrast.
- Icons: a built-in Phosphor set, or Lucide, Tabler, Heroicons, Phosphor (Vue), Iconify or your own set (`@eos-ui/vue/icons`, see [Bring your own icons](src/icons/README.md)).
- `EosResolver` from `@eos-ui/vue/resolver` auto-imports components for `unplugin-vue-components`. It does not import the stylesheet unless you pass `{ css: true }`.
- Importing the package types `$e` (the config) in templates. `createEos()` registers no components, so their global types are opt-in: after `app.component("EButton", EButton)`, add `import type {} from "@eos-ui/vue/globals"` (or `"types": ["@eos-ui/vue/globals"]` in `tsconfig.json`). With `unplugin-vue-components` you do not need it: the plugin writes its own `components.d.ts`.
- Composables for common needs: `useAnnouncer` (screen reader announcements), `useShortcuts` (keyboard shortcuts), `useCopy`, `useToast`. See [Composables](src/composables/README.md).
- `@eos-ui/vue/llms.txt` and `llms-full.txt` give AI coding assistants an index and the complete docs.
- Components work without the plugin, in English and US dollars.

## Nuxt

Import the stylesheet in `nuxt.config.ts`, install the plugin in a Nuxt plugin, and put the theme into the server-rendered `<head>` with `themeCss()`. The plugin applies the theme only in a browser, so without the `<style>` the first paint is unthemed.

```ts
// nuxt.config.ts
export default defineNuxtConfig({ css: ["@eos-ui/vue/style.css"] });
```

```ts
// plugins/eos.ts
import { createEos, themeCss } from "@eos-ui/vue";

const theme = { brand: "#2c95b4", radius: "round" } as const;

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(createEos({ locale: "en-CA", currency: "CAD", theme }));
  useHead({ style: [{ id: "eos-theme", innerHTML: themeCss(theme) }] });
});
```

Components render on the server without a `document`. Pass the same `theme` to `createEos` and `themeCss` so the server and the client agree.

[Source, issues and contributing](https://github.com/Dame-G/eos). MIT licensed.
