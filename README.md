# Aegis

Accessible Vue 3 components with a token-based theme system. Calm, high-contrast and consistent by default, and rebrandable with a few lines.

| Package                            | What it is                                                              |
| ---------------------------------- | ----------------------------------------------------------------------- |
| [`@aegis/vue`](packages/vue)       | Components (`AeButton`, `AeTextField`, ...), plugin, composables        |
| [`@aegis/tokens`](packages/tokens) | Design tokens as CSS variables and `defineTheme()` with contrast checks |

Documentation and live examples: https://aegis.dame.gg

## Use

```bash
npm install @aegis/vue
```

```ts
import { createApp } from "vue";
import { createAegis } from "@aegis/vue";

createApp(App)
  .use(
    createAegis({
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
import { AeTextField, AeButton } from "@aegis/vue";
const email = ref("");
</script>

<template>
  <AeTextField v-model="email" label="Email" type="email" required />
  <AeButton>Continue</AeButton>
</template>
```

Each component imports its own styles, so only what you use ships. Everything sits in the cascade layers `ae.*`, so your own CSS wins without specificity fights. For template auto-import, use the resolver:

```ts
import { AegisResolver } from "@aegis/vue/resolver";
Components({ resolvers: [AegisResolver()] }); // unplugin-vue-components
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
  --ae-primary: #0b4f6c;
  --ae-radius-md: 12px;
}
```

The design rules (spacing rhythm, where depth is allowed, one control height) are not options. They are what makes every theme feel like the same system.

## Words and language

Every string a component writes can be replaced, and money, dates and numbers follow the configured locale:

```ts
createAegis({ locale: "fr-CA", currency: "CAD", messages: { required: "Obligatoire" } });
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). Licensed under MIT; icons are [Phosphor](https://phosphoricons.com) (MIT).
