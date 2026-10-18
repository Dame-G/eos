import { inject, reactive, type InjectionKey } from "vue";
import { defaultMessages, type MessageKey } from "./messages.js";
import { phosphor, type IconMarkup } from "./icons/phosphor.js";

/** What the app tells the components: language, money, direction, words and icons. Set it once with `createEos()`. */
export interface EosConfig {
  /** BCP 47 tag. Drives month and weekday names, week start, date order and number formats. */
  locale: string;
  /** ISO 4217 code, for amounts. */
  currency: string;
  /** Text direction. `null` follows the document. */
  dir: "ltr" | "rtl" | null;
  /** Overrides for any message, by key. See `defaultMessages`. */
  messages: Record<string, string>;
  /** Extra or replacement icons, by name: `[regular, bold]` SVG markup in a 256 x 256 box. */
  icons: Record<string, IconMarkup>;
  /** Where floating parts (menus, dialogs, tooltips, toasts) render: a CSS selector or an element. Default `body`. Set it to a themed container when you scope a theme to part of the page, so floating parts inherit the theme. */
  portalTarget: string | HTMLElement;
}

export const CONFIG_KEY: InjectionKey<EosConfig> = Symbol("eos.config");

/** Used when a component is rendered without the plugin, so every component works on its own. */
export const fallbackConfig: EosConfig = reactive({
  locale: "en-US",
  currency: "USD",
  dir: null,
  messages: {},
  icons: {},
  portalTarget: "body",
});

export function useConfig(): EosConfig {
  return inject(CONFIG_KEY, fallbackConfig);
}

export type Translate = (key: MessageKey | (string & {}), vars?: Record<string, string | number>) => string;

/**
 * The words the components say. Returns `t(key, vars)`; `{name}` placeholders are filled from `vars`.
 * Reads the reactive config, so changing the locale or messages re-renders every component that uses it.
 */
export function useMessages(): Translate {
  const config = useConfig();
  return (key, vars) => {
    const raw = config.messages[key] ?? (defaultMessages as Record<string, string>)[key] ?? key;
    return vars ? raw.replace(/\{(\w+)\}/g, (m, k: string) => (vars[k] != null ? String(vars[k]) : m)) : raw;
  };
}

/** Markup for an icon: the app's own icons first, then the built-in Phosphor set. */
export function useIconMarkup(): (name: string, bold: boolean) => string {
  const config = useConfig();
  return (name, bold) => {
    const entry = config.icons[name] ?? (phosphor as Record<string, IconMarkup>)[name] ?? phosphor.info;
    return entry[bold ? 1 : 0];
  };
}

/** The `to` for a Teleport or a Reka portal: pass it to every floating part so they inherit a scoped theme. */
export function usePortalTarget(): string | HTMLElement {
  return useConfig().portalTarget;
}
