# Bring your own icons

eos ships a small built-in set (Phosphor, 42 icons) so every component works with no setup. To use your own set instead, tell `createEos` where to find icons. Anything it cannot find falls back to the built-in icon, so a partial set never leaves a blank.

Adapters live in `@eos-ui/vue/icons`. They import nothing: you pass the icon library in, so eos never depends on it.

## Which source wins

An icon name is looked up in this order, and the first hit is drawn:

1. A component passed straight to the `icon` prop.
2. `icons[name]`: an explicit map of names to sources.
3. `resolve(aliases[name] ?? name, { bold })`: your function, after `aliases` has renamed the eos name.
4. The built-in Phosphor icon of that name, unless `builtin: false`.

Nothing found draws nothing and warns once in development. Adapters (`lucide()`, `tabler()`...) fill `resolve` and `aliases` for you, so an `icons` map you spread after them still wins.

## Lucide

Install `lucide-vue-next` or `@lucide/vue`, then:

```ts
import { createEos } from "@eos-ui/vue";
import { lucide } from "@eos-ui/vue/icons";
import { Check, X, CreditCard, TriangleAlert /* ...the names below */ } from "lucide-vue-next";

createEos({ icons: lucide({ Check, X, CreditCard, TriangleAlert }) });
```

An explicit map tree-shakes: only the icons you list ship. `import * as lucide from "lucide-vue-next"` is shorter and works too, but it keeps the whole library in your bundle because eos looks icons up by name at run time. Icons you leave out of the map fall back to the built-in set.

## Tabler

```ts
import * as tablerIcons from "@tabler/icons-vue";
import { tabler } from "@eos-ui/vue/icons";

createEos({ icons: tabler(tablerIcons) });
```

Components are named `Icon<Pascal>` (`IconCreditCard`). A `{ IconCheck, IconX }` map tree-shakes, as with Lucide.

## Heroicons

Pick the variant with the import path. eos does not choose for you:

```ts
import * as outline from "@heroicons/vue/24/outline"; // or /24/solid, /20/solid
import { heroicons } from "@eos-ui/vue/icons";

createEos({ icons: heroicons(outline) });
```

## Phosphor (Vue)

```ts
import * as ph from "@phosphor-icons/vue";
import { phosphorVue } from "@eos-ui/vue/icons";

createEos({ icons: phosphorVue(ph) }); // regular weight; small and bold icons use "bold"
createEos({ icons: phosphorVue(ph, { weight: "light" }) });
```

## Iconify

```ts
import { iconify } from "@eos-ui/vue/icons/iconify"; // needs the optional peer: npm i @iconify/vue

createEos({ icons: iconify("lucide") });
```

Known prefixes, with every eos name already mapped: `lucide`, `tabler`, `heroicons`, `ph` (bold weight for small icons), `mdi`, `material-symbols`, `carbon`, `fluent`. Another prefix uses names as given. A name with a colon is used as given everywhere, so `icon="mdi:account"` works with any setup built on this adapter. Iconify fetches icons from its API unless you register them offline (see the `@iconify/vue` docs). Because Iconify can draw any name, the built-in fallback never triggers with this adapter.

## Options for every adapter

```ts
lucide(icons, {
  aliases: { card: "wallet-cards" }, // your renames win over the table
  builtin: false, // never fall back to the built-in set
});
```

Aliases map an eos name to the set's kebab-case name. The tables are in `aliases.ts` and are checked against the live sets with `node scripts/validate-icon-aliases.mjs` (needs the network).

## A custom resolver

```ts
import { defineIcons } from "@eos-ui/vue/icons";
import MyIcon from "./MyIcon.vue";

createEos({
  icons: defineIcons({
    icons: { card: "<svg viewBox='0 0 24 24'>...</svg>" }, // explicit, by name; a full svg string
    aliases: { alert: "warning" }, // rename eos's names before resolving
    resolve: (name, { bold }) => (name === "logo" ? MyIcon : undefined), // return undefined to fall through
    builtin: true,
  }),
});
```

A source is a Vue component, a complete `<svg>` string, or a `[regular, bold]` pair of path markup in a 256 by 256 box.

## Security: markup sources are trusted

A source that is a string, whether from `icons` or returned by `resolve`, is drawn with `v-html`, and so are `[regular, bold]` path pairs. It is markup your app ships, not user input. Never return SVG built from user data, a request, or a database a user can write to: a `<script>` or an `onload` attribute in it would run. Components are not injected as markup, so prefer them when the icon name could come from outside.

## One icon at a time

Every `icon` prop also takes a component:

```vue
<script setup>
import { CreditCard } from "lucide-vue-next";
</script>

<template>
  <EButton :icon="CreditCard">Pay now</EButton>
</template>
```

## Semantic names

These are the 42 names the components ask for. `iconNames` exports the list.

`eye`, `eye-slash`, `arrow-left`, `arrow-up`, `arrow-down`, `chevron-left`, `chevron-right`, `chevron-down`, `menu`, `sign-out`, `eraser`, `card`, `receipt`, `signature`, `form`, `download`, `upload`, `print`, `lock`, `pin`, `edit`, `mail`, `phone`, `wallet`, `bell`, `shield`, `trash`, `sort`, `minus`, `plus`, `filter`, `search`, `check`, `x`, `alert`, `info`, `user`, `file`, `clock`, `calendar`, `home`, `copy`.

Sets with no close match use the nearest icon: Heroicons has no eraser, signature or pushpin (it uses `backspace`, `pencil` and `map-pin`), and Carbon has no payment card or signature (it uses `money` and `pen`). Change any of them with `aliases`.

## Turn the built-in fallback off

```ts
createEos({ icons: { ...lucide({ Check, X }), builtin: false } });
```

With `builtin: false`, a name your set lacks draws nothing and logs one warning in development.

`builtin: false` stops the lookup, but the set still ships when your app imports from `@eos-ui/vue`, which registers it. To leave its bytes (about 9 kB gzipped) out of the bundle, import components from their own paths and the plugin from `@eos-ui/vue/plugin`:

```ts
import { createEos } from "@eos-ui/vue/plugin";
import { EButton } from "@eos-ui/vue/components/EButton";
import { lucide } from "@eos-ui/vue/icons";
```

Those paths never import the set. `import "@eos-ui/vue/icons/builtin"` registers it again.
