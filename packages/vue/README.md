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

- One stylesheet (about 19 kB gzipped), imported once. The JavaScript has no CSS imports, so server rendering needs no bundler setup.
- Everything sits in the cascade layers `e.*`, so your own CSS wins without specificity fights.
- Words, locale, currency, text direction and icons are plugin options.
- `defineTheme()` (re-exported from [`@eos-ui/tokens`](../tokens)) builds a theme from `brand`, `accent` and other inputs and checks its contrast.
- Icons: a built-in Phosphor set, or Lucide, Tabler, Heroicons, Phosphor (Vue), Iconify or your own set (`@eos-ui/vue/icons`; see [Bring your own icons](src/icons/README.md)).
- `EosResolver` from `@eos-ui/vue/resolver` auto-imports components for `unplugin-vue-components`.
- Composables for common needs: `useAnnouncer` (screen reader announcements), `useShortcuts` (keyboard shortcuts), `useCopy`, `useToast`. See [Composables](src/composables/README.md).
- `@eos-ui/vue/llms.txt` and `llms-full.txt` give AI coding assistants an index and the complete docs.
- Components work without the plugin, in English and US dollars.

[Source, issues and contributing](https://github.com/Dame-G/eos). MIT licensed.
