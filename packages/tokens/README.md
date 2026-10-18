# @eos-ui/tokens

The design tokens behind Eos (colour, spacing, radius, shadow, type, size, motion, layering) as CSS custom properties, typed values, and `defineTheme()`, which builds a theme from a brand colour and checks every promised contrast pair.

```bash
npm install @eos-ui/tokens
```

```ts
import { defineTheme } from "@eos-ui/tokens";

const theme = defineTheme({ name: "clinic", brand: "#8a2be2", accent: "#2e7d32", radius: "round" });
theme.issues; // contrast pairs that fail (empty when sound)
theme.css(); // the theme as CSS custom properties, for the server
theme.apply(document.documentElement); // or set them in the browser
```

```css
/* the default tokens as a stylesheet */
@import "@eos-ui/tokens/tokens.css";
```

All variables are prefixed `--e-` (`--e-primary`, `--e-space-4`). Documentation: https://eos.dame.gg. MIT licensed.
