import "./styles/base.css";
import { reactive, watchEffect, type App } from "vue";
import { defineTheme, type Theme, type ThemeInput } from "@aegis/tokens";
import { CONFIG_KEY, type AegisConfig } from "./config.js";

export interface AegisOptions extends Partial<AegisConfig> {
  /** A theme from `defineTheme()`, or the same options. Applied to `<html>` unless `themeTarget` says otherwise. */
  theme?: Theme | ThemeInput;
  /** Element the theme is applied to. Default `document.documentElement`. Pass an element to theme one part of the page. */
  themeTarget?: HTMLElement | null;
  /** Warn in the console when the theme fails a contrast pair. Default true outside production. */
  warnOnContrast?: boolean;
}

export interface Aegis {
  install(app: App): void;
  /** The reactive config. Change `config.locale` or `config.messages` and the components follow. */
  config: AegisConfig;
  theme: Theme;
}

const isTheme = (t: Theme | ThemeInput): t is Theme => typeof (t as Theme).css === "function";

/**
 * Installs the library: provides the config (language, currency, direction, words, icons) and applies the theme.
 *
 * ```ts
 * app.use(createAegis({ locale: "en-CA", currency: "CAD", theme: { brand: "#2c95b4" } }))
 * ```
 */
export function createAegis(options: AegisOptions = {}): Aegis {
  const config = reactive<AegisConfig>({
    locale: options.locale ?? "en-US",
    currency: options.currency ?? "USD",
    dir: options.dir ?? null,
    messages: { ...options.messages },
    icons: { ...options.icons },
    portalTarget: options.portalTarget ?? "body",
  });
  const theme = options.theme
    ? isTheme(options.theme)
      ? options.theme
      : defineTheme(options.theme)
    : defineTheme({ name: "light" });

  return {
    config,
    theme,
    install(app: App) {
      app.provide(CONFIG_KEY, config);
      app.config.globalProperties.$ae = config;
      if (typeof document === "undefined") return;
      if (options.warnOnContrast !== false && theme.issues.length && !import.meta.env?.PROD) {
        console.warn(
          "[aegis] The theme fails these contrast pairs:\n" +
            theme.issues.map((i) => `  ${i.role}: ${i.pair.join(" on ")} is ${i.ratio}:1, needs ${i.min}:1`).join("\n"),
        );
      }
      const target = options.themeTarget ?? document.documentElement;
      theme.apply(target);
      // The app owns `lang`; direction is only set when the app asks for it.
      watchEffect(() => {
        if (config.dir) target.setAttribute("dir", config.dir);
      });
    },
  } as Aegis;
}
