// Registers the built-in Phosphor set (about 9 kB gzipped) as the fallback for icon names. `@eos-ui/vue` imports this
// file, so the set is there with or without the plugin. An app that imports components from their own paths
// (`@eos-ui/vue/components/EButton`) leaves it out, and imports `@eos-ui/vue/icons/builtin` once if it wants it back.
import { registerBuiltinIcons } from "../config.js";
import { phosphor } from "./phosphor.js";

registerBuiltinIcons(phosphor);
