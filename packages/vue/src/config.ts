import { computed, inject, reactive, type ComputedRef, type InjectionKey } from "vue";
import { defaultMessages, type MessageKey } from "./messages.js";
import type { Component } from "vue";
import { phosphor, ICON_VIEWBOX, type IconMarkup } from "./icons/phosphor.js";
import type { IconSource, IconsConfig } from "./icons/types.js";

/** What the app tells the components: language, money, direction, words and icons. Set it once with `createEos()`. */
export interface EosConfig {
  /** BCP 47 tag. Drives month and weekday names, week start, date order and number formats. */
  locale: string;
  /** ISO 4217 code, for amounts. */
  currency: string;
  /** Text direction. `null` follows the document. */
  dir: "ltr" | "rtl" | null;
  /** Overrides for any message, by key. See `defaultMessages`. A message is a string, or a plural object when it takes a count `n`. */
  messages: Record<string, MessageValue>;
  /** Where icons come from: your own set, aliases onto it, individual icons. The built-in Phosphor set is the fallback. */
  icons: IconsConfig;
  /** Where floating parts (menus, dialogs, tooltips, toasts) render: a CSS selector or an element. Default `body`. Set it to a themed container when you scope a theme to part of the page, so floating parts inherit the theme. */
  portalTarget: string | HTMLElement;
}

export const CONFIG_KEY: InjectionKey<EosConfig> = Symbol("eos.config");

/** Used when a component is rendered without the plugin, so every component works on its own. */
const fallbackConfig: EosConfig = reactive({
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

/** Plural forms keyed by `Intl.PluralRules` category. `other` is required. */
export type PluralMessage = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

/** A message is a string, or a `PluralMessage` chosen by the `n` passed to `t()`. */
export type MessageValue = string | PluralMessage;

export type Translate = (key: MessageKey | (string & {}), vars?: Record<string, string | number>) => string;

function pluralForm(message: PluralMessage, locale: string, n: string | number | undefined): string {
  const count = Number(n);
  if (n == null || Number.isNaN(count)) return message.other;
  try {
    return message[new Intl.PluralRules(locale).select(count)] ?? message.other;
  } catch {
    return message.other;
  }
}

/**
 * The words the components say. Returns `t(key, vars)` and fills `{name}` placeholders from `vars`.
 * A plural message picks its form from `vars.n` using the locale's plural rules, and falls back to `other`.
 * Reads the reactive config, so changing the locale or messages re-renders every component that uses it.
 */
export function useMessages(): Translate {
  const config = useConfig();
  return (key, vars) => {
    const found = config.messages[key] ?? (defaultMessages as Record<string, MessageValue>)[key] ?? key;
    const raw = typeof found === "string" ? found : pluralForm(found, config.locale, vars?.n);
    return vars ? raw.replace(/\{(\w+)\}/g, (m, k: string) => (vars[k] != null ? String(vars[k]) : m)) : raw;
  };
}

/** An icon ready to render. */
export type ResolvedIcon =
  | { kind: "component"; component: Component }
  | { kind: "svg"; html: string }
  | { kind: "glyph"; html: string; viewBox: string }
  | { kind: "none" };

const warned = new Set<string>();

/**
 * Turns an icon name (or a component passed directly) into something renderable. Order: a component is used as given,
 * then `icons[name]`, then `resolve(alias ?? name)`, then the built-in Phosphor icon. Otherwise nothing is drawn
 * and a warning is logged once in development.
 */
export function useIconResolver(): (icon: string | Component, bold: boolean) => ResolvedIcon {
  const config = useConfig();
  const fromSource = (source: IconSource, bold: boolean): ResolvedIcon => {
    if (typeof source === "string") return { kind: "svg", html: source };
    if (Array.isArray(source))
      return { kind: "glyph", html: (source as unknown as IconMarkup)[bold ? 1 : 0], viewBox: ICON_VIEWBOX };
    return { kind: "component", component: source as Component };
  };
  return (icon, bold) => {
    if (typeof icon !== "string") return { kind: "component", component: icon };
    const set = config.icons;
    const explicit = set.icons?.[icon];
    if (explicit) return fromSource(explicit, bold);
    const found = set.resolve?.(set.aliases?.[icon] ?? icon, { bold });
    if (found) return fromSource(found, bold);
    const builtin = set.builtin === false ? undefined : (phosphor as Record<string, IconMarkup>)[icon];
    if (builtin) return fromSource(builtin, bold);
    if (import.meta.env?.DEV && !warned.has(icon)) {
      warned.add(icon);
      console.warn(`[eos] No icon named "${icon}". Add it to createEos({ icons }) or alias it to one your set has.`);
    }
    return { kind: "none" };
  };
}

/** The `to` for a Teleport or a Reka portal: pass it to every floating part so they inherit a scoped theme. */
export function usePortalTarget(): ComputedRef<string | HTMLElement> {
  const config = useConfig();
  return computed(() => config.portalTarget);
}
