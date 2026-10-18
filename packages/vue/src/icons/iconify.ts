// The only file in Eos that imports @iconify/vue, which is an optional peer dependency.
import { defineComponent, h, type Component } from "vue";
import { Icon } from "@iconify/vue";
import { iconifyAliases, iconifyBoldSuffix } from "./aliases.js";
import type { IconsConfig } from "./types.js";

export interface IconifyOptions {
  /** Your own renames, merged over the table for the prefix: `{ card: "wallet" }`. Values are names without the prefix. */
  aliases?: Record<string, string>;
  /** Fall back to the built-in Phosphor icons. Default true. Iconify draws any name, so this only matters for names it cannot form. */
  builtin?: boolean;
  /** Suffix added to the name for small and bold icons (`"-bold"` for `ph`, which is the default there). `false` for none. */
  boldSuffix?: string | false;
}

// One component per full icon name, so a name resolves to the same component every time and Vue can patch it.
const components = new Map<string, Component>();

function iconComponent(icon: string): Component {
  let component = components.get(icon);
  if (!component) {
    component = defineComponent({
      name: "EIconifyIcon",
      inheritAttrs: false,
      setup:
        (_, { attrs }) =>
        () =>
          h(Icon, { ...attrs, icon }),
    });
    components.set(icon, component);
  }
  return component;
}

/**
 * Icons from Iconify. `iconify("lucide")` draws `lucide:<name>` for every Eos name (renamed through the table for
 * that prefix), and any name that already has a colon is used as given, so `icon="mdi:account"` works anywhere.
 * Known prefixes: lucide, tabler, heroicons, ph, mdi, material-symbols, carbon, fluent. Another prefix uses names as given.
 */
export function iconify(prefix: string, options: IconifyOptions = {}): IconsConfig {
  const boldSuffix = options.boldSuffix ?? iconifyBoldSuffix[prefix] ?? false;
  return {
    aliases: { ...iconifyAliases[prefix], ...options.aliases },
    builtin: options.builtin ?? true,
    resolve: (name, { bold }) =>
      iconComponent(name.includes(":") ? name : `${prefix}:${name}${bold && boldSuffix ? boldSuffix : ""}`),
  };
}
