# @eos-ui/vue

Accessible Vue 3 components with a token-based theme system. Calm, high-contrast and consistent by default, and rebrandable with a few lines.

Documentation, live examples and a theme playground: https://eos.dame.gg

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

- One stylesheet (about 17 kB gzipped), imported once. The JavaScript has no CSS imports, so server rendering needs no bundler setup.
- Everything sits in the cascade layers `e.*`, so your own CSS wins without specificity fights.
- Words, locale, currency and icons are configuration, not code: see the plugin options.
- Bring your own icons: Lucide, Tabler, Heroicons, Phosphor, Iconify, or your own set (`@eos-ui/vue/icons`).

Source, issues and contributing: https://github.com/Dame-G/eos. MIT licensed.
