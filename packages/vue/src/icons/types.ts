import type { Component } from "vue";
import { phosphor, type IconMarkup, type IconName } from "./phosphor.js";

/**
 * What an icon prop accepts: a name from the built-in list, any other name your icon set resolves
 * (`"credit-card"`, `"lucide:credit-card"`), or the icon component itself (`:icon="CreditCard"`).
 */
export type IconProp = IconName | (string & {}) | Component;

/**
 * What a resolver may return for a name:
 * - a Vue component (Lucide, Tabler, Heroicons, Iconify and the like),
 * - a complete `<svg>...</svg>` string,
 * - or a `[regular, bold]` pair of path markup in a 256 x 256 box (the built-in Phosphor format).
 */
export type IconSource = Component | string | IconMarkup;

export interface IconContext {
  /** True when the component asks for the heavier weight (small icons in chips and stamps). */
  bold: boolean;
}

/** How eos finds an icon for a name. All parts are optional and combine in the order below. */
export interface IconsConfig {
  /** Explicit icons by name. Checked first. */
  icons?: Record<string, IconSource>;
  /** Renames eos's own icon names to your set's: `{ alert: "triangle-alert", card: "credit-card" }`. Applied before `resolve`. */
  aliases?: Record<string, string>;
  /** Looks a name up in your icon set. Return `undefined` to fall through to the built-in icon. */
  resolve?: (name: string, context: IconContext) => IconSource | undefined;
  /** Falls back to the built-in Phosphor icons for any name the set does not provide. @default true */
  builtin?: boolean;
}

/** Every name the components ask for. Your icon set (or `aliases`) must cover these for a consistent look. */
export const iconNames = Object.keys(phosphor) as IconName[];
