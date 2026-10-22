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

The stylesheet is one file (about 24 kB gzipped). The JavaScript has no CSS imports, so server rendering works in plain Node without bundler setup. Everything sits in the cascade layers `e.*`, so your own CSS wins without specificity fights. Components also work without the plugin, in English and US dollars.

`createEos()` takes `locale`, `currency`, `dir`, `messages`, `icons`, `theme`, `themeTarget` (theme one element instead of `<html>`), `portalTarget` (where menus, dialogs and toasts render) and `warnOnContrast`.

For template auto-import, use the resolver:

```ts
import { EosResolver } from "@eos-ui/vue/resolver";
Components({ resolvers: [EosResolver()] }); // unplugin-vue-components
```

## Theming

A theme is a set of CSS variables. `defineTheme()` derives the deep action colours from your brand colour and checks every contrast pair the system promises. It takes 16 design inputs: `brand`, `accent`, `danger`, `warning`, `background`, `surface`, `foreground`, `fonts`, `radius`, `elevation`, `strokes`, `contrast`, `textScale`, `spaceScale`, `controlHeight` and `motion`.

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
