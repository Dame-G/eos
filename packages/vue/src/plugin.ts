import "./styles/base.css";
import { reactive, watchEffect, type App } from "vue";
import { defineTheme, type Theme, type ThemeInput } from "@eos-ui/tokens";
import { TOAST_KEY, createToasts } from "./composables/useToast.js";
import { CONFIG_KEY, type EosConfig } from "./config.js";

export interface EosOptions extends Partial<EosConfig> {
  /** A theme from `defineTheme()`, or the same options. Applied to `<html>` unless `themeTarget` says otherwise. */
  theme?: Theme | ThemeInput;
  /** Element the theme is applied to. Default `document.documentElement`. Pass an element to theme one part of the page. */
  themeTarget?: HTMLElement | null;
  /** Warn in the console when the theme fails a contrast pair. Default true outside production. */
  warnOnContrast?: boolean;
}

export interface Eos {
  install(app: App): void;
  /** The reactive config. Change `config.locale` or `config.messages` and the components follow. */
  config: EosConfig;
  theme: Theme;
}

const isTheme = (t: Theme | ThemeInput): t is Theme => typeof (t as Theme).css === "function";

/**
 * The theme as CSS for the server. `createEos().install()` only applies the theme in a browser, so a server-rendered
 * page paints unthemed until the client runs. Put this string in a `<style>` in the document head instead.
 *
 * ```ts
 * const html = `<style>${themeCss({ brand: "#2c95b4" })}</style>`
 * ```
 *
 * @param theme A theme from `defineTheme()`, or the same options. Default is the light theme.
 * @param selector Element the tokens apply to. Default `:root`. Use the same `themeTarget` scope you pass to `createEos`.
 */
export function themeCss(theme?: Theme | ThemeInput, selector?: string): string {
  const t = theme ? (isTheme(theme) ? theme : defineTheme(theme)) : defineTheme({ name: "light" });
  return t.css(selector ? { selector } : undefined);
}

/**
 * Installs the library: provides the config (language, currency, direction, words, icons) and applies the theme.
 *
 * ```ts
 * app.use(createEos({ locale: "en-CA", currency: "CAD", theme: { brand: "#2c95b4" } }))
 * ```
 */
export function createEos(options: EosOptions = {}): Eos {
  const config = reactive<EosConfig>({
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
      app.provide(TOAST_KEY, createToasts());
      app.config.globalProperties.$e = config;
      if (typeof document === "undefined") return;
      if (options.warnOnContrast !== false && theme.issues.length && !import.meta.env?.PROD) {
        console.warn(
          "[eos] The theme fails these contrast pairs:\n" +
            theme.issues.map((i) => `  ${i.role}: ${i.pair.join(" on ")} is ${i.ratio}:1, needs ${i.min}:1`).join("\n"),
        );
      }
      const target = options.themeTarget ?? document.documentElement;
      theme.apply(target);
      watchEffect(() => {
        if (config.dir) target.setAttribute("dir", config.dir);
      });
    },
  } as Eos;
}
