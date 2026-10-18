# Eos

Accessible Vue 3 components with a token-based theme system. Calm, high-contrast and consistent by default, and rebrandable with a few lines.

| Package                             | What it is                                                              |
| ----------------------------------- | ----------------------------------------------------------------------- |
| [`@eos-ui/vue`](packages/vue)       | Components (`EButton`, `ETextField`, ...), plugin, composables          |
| [`@eos-ui/tokens`](packages/tokens) | Design tokens as CSS variables and `defineTheme()` with contrast checks |

Documentation and live examples: https://eos.dame.gg

## Use

```bash
npm install @eos-ui/vue
```

```ts
import { createApp } from "vue";
import { createEos } from "@eos-ui/vue";

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

Each component imports its own styles, so only what you use ships. Everything sits in the cascade layers `e.*`, so your own CSS wins without specificity fights. For template auto-import, use the resolver:

```ts
import { EosResolver } from "@eos-ui/vue/resolver";
Components({ resolvers: [EosResolver()] }); // unplugin-vue-components
```

## Theming

A theme is a set of CSS variables. Build one with `defineTheme()`, which derives the deep action colours from your brand colour and checks every promised contrast pair:

```ts
const clinic = defineTheme({ name: "clinic", brand: "#8a2be2", accent: "#2e7d32" });
clinic.issues; // [] when every contrast pair holds
```

Or override variables in plain CSS; it wins because the library is layered:

```css
:root {
  --e-primary: #0b4f6c;
  --e-radius-md: 12px;
}
```

The design rules (spacing rhythm, where depth is allowed, one control height) are not options. They are what makes every theme feel like the same system.

## Words and language

Every string a component writes can be replaced, and money, dates and numbers follow the configured locale:

```ts
createEos({ locale: "fr-CA", currency: "CAD", messages: { required: "Obligatoire" } });
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Licensed under MIT; icons are [Phosphor](https://phosphoricons.com) (MIT).
