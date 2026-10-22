import { defineComponent, h, type Component } from "vue";
import { heroiconsAliases, lucideAliases, phosphorAliases, tablerAliases, type AliasTable } from "./aliases.js";
import type { IconContext, IconsConfig } from "./types.js";

/** The icon components of a library: its module namespace (`import * as lucide`) or a map you build (`{ Check, X }`). */
export type IconModule = object;

export interface AdapterOptions {
  /** Your own renames, merged over the built-in table: `{ card: "wallet-cards" }`. Values are the set's kebab-case names. */
  aliases?: Record<string, string>;
  /** Fall back to the built-in Phosphor icons for names the set does not have. Default true. */
  builtin?: boolean;
}

/** `credit-card` to `CreditCard`, `menu-2` to `Menu2`. A name that is already PascalCase is kept. */
function pascalCase(name: string): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function isComponent(value: unknown): value is Component {
  if (typeof value === "function") return true;
  if (typeof value !== "object" || value === null) return false;
  return "render" in value || "setup" in value || "template" in value;
}

function adapter(
  table: AliasTable,
  source: IconModule,
  componentName: (pascal: string) => string,
  options: AdapterOptions,
  wrap?: (component: Component, context: IconContext) => Component,
): IconsConfig {
  const lookup = source as Record<string, unknown>;
  return {
    aliases: { ...table, ...options.aliases },
    builtin: options.builtin ?? true,
    resolve(name, context) {
      const found = lookup[componentName(pascalCase(name))];
      if (!isComponent(found)) return undefined;
      return wrap ? wrap(found, context) : found;
    },
  };
}

/**
 * Lucide icons. Pass the module (`import * as lucide from "lucide-vue-next"`) or an explicit map
 * (`{ Check, X, CreditCard }`), which lets your bundler drop every icon you do not list.
 */
export function lucide(source: IconModule, options: AdapterOptions = {}): IconsConfig {
  return adapter(lucideAliases, source, (pascal) => pascal, options);
}

/** Tabler icons (`@tabler/icons-vue`, components named `IconCreditCard`). */
export function tabler(source: IconModule, options: AdapterOptions = {}): IconsConfig {
  return adapter(tablerAliases, source, (pascal) => `Icon${pascal}`, options);
}

/**
 * Heroicons (`@heroicons/vue`, components named `CreditCardIcon`). Pick the variant by where you import from:
 * `@heroicons/vue/24/outline`, `/24/solid` or `/20/solid`.
 */
export function heroicons(source: IconModule, options: AdapterOptions = {}): IconsConfig {
  return adapter(heroiconsAliases, source, (pascal) => `${pascal}Icon`, options);
}

export interface PhosphorVueOptions extends AdapterOptions {
  /** The weight used for normal icons. Default `"regular"`. Small icons and `bold` icons always use `"bold"`. */
  weight?: "thin" | "light" | "regular" | "fill" | "duotone";
}

const weighted = new WeakMap<Component, Map<string, Component>>();

function withWeight(base: Component, weight: string): Component {
  let byWeight = weighted.get(base);
  if (!byWeight) weighted.set(base, (byWeight = new Map()));
  let wrapper = byWeight.get(weight);
  if (!wrapper) {
    wrapper = defineComponent({
      name: "EPhosphorIcon",
      inheritAttrs: false,
      setup:
        (_, { attrs }) =>
        () =>
          h(base, { ...attrs, weight }),
    });
    byWeight.set(weight, wrapper);
  }
  return wrapper;
}

/** Phosphor icons for Vue (`@phosphor-icons/vue`, components named `PhCreditCard`). The `bold` flag selects the bold weight. */
export function phosphorVue(source: IconModule, options: PhosphorVueOptions = {}): IconsConfig {
  const weight = options.weight ?? "regular";
  return adapter(
    phosphorAliases,
    source,
    (pascal) => `Ph${pascal}`,
    options,
    (component, { bold }) => withWeight(component, bold ? "bold" : weight),
  );
}
