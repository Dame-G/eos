import "./styles/base.css";
import { markRaw, reactive, watchEffect, type App } from "vue";
import { defineTheme, type Theme, type ThemeInput } from "@eos-ui/tokens";
import { TOAST_KEY, createToasts } from "./composables/useToast.js";
import { TOOLTIP_KEY, createTooltipGroup } from "./components/Tooltip/group.js";
import { CONFIG_KEY, type EosConfig } from "./config.js";
import type { IconsConfig } from "./icons/types.js";
import { localeDirection } from "./composables/useLocale.js";
import { isProduction } from "./env.js";

/**
 * Options for `createEos()`.
 *
 * **Scoped theme.** To theme one part of the page, set two options together: `themeTarget` is the element that gets the
 * tokens, `portalTarget` is where menus, dialogs, tooltips and toasts render. Point `portalTarget` at `themeTarget` (or inside
 * it) or floating parts leave the scope and fall back to the page theme. For server rendering, pass `themeCss(theme, selector)`
 * the same scope.
 *
 * ```ts
 * const root = document.getElementById("widget")!
 * createEos({ theme, themeTarget: root, portalTarget: root })
 * ```
 */
export interface EosOptions extends Partial<EosConfig> {
  /** A theme from `defineTheme()`, or the same options. Applied to `<html>` unless `themeTarget` says otherwise. Left out, nothing is applied: `style.css` already carries the default theme. */
  theme?: Theme | ThemeInput;
  /**
   * Element the theme (and `lang` and `dir`) is applied to. Default `document.documentElement`. Pair it with
   * `portalTarget`: see "scoped theme" above. `null` applies nothing to the document: no theme stylesheet, `lang` or
   * `dir` (the components still read `dir` and `locale` from the config).
   */
  themeTarget?: HTMLElement | null;
  /** Warn in the console when the theme fails a contrast pair. Default true unless `NODE_ENV` is `production`. */
  warnOnContrast?: boolean;
  /**
   * Add the theme to the document as a stylesheet scoped to `themeTarget` (in the `e.tokens` layer, so your own CSS still
   * wins and the theme's `prefers-color-scheme` and `prefers-contrast` variants still apply). Default true. Turn it off
   * when the page ships the theme as CSS itself (`themeCss()` in a `<style>`, or a stylesheet of its own). `lang` and
   * `dir` are still set, and `theme` still names the theme for `themeCss`.
   */
  applyTheme?: boolean;
}

declare module "vue" {
  interface ComponentCustomProperties {
    /** The eos config (locale, currency, messages, icons). Set by `createEos()`. */
    $e: EosConfig;
  }
}

export interface Eos {
  install(app: App): void;
  /** The reactive config. Change `config.locale` or `config.messages` and the components follow. */
  config: EosConfig;
  /** The theme passed to `createEos()`, built. Without one, the default theme that `style.css` carries. */
  theme: Theme;
}

const isTheme = (t: Theme | ThemeInput): t is Theme => typeof (t as Theme).css === "function";

let fallback: Theme | undefined;
/** A theme, or the options of one, built. Left out, the default theme: the one `style.css` carries, light, following `prefers-contrast: more`. */
function toTheme(theme?: Theme | ThemeInput): Theme {
  if (theme) return isTheme(theme) ? theme : defineTheme(theme);
  return (fallback ??= defineTheme({ name: "light", contrast: "auto" }));
}

/**
 * Adds the theme to the document as a stylesheet scoped to `target`, and marks `target` with `data-e-theme`. A stylesheet,
 * not inline custom properties, so the theme's media-query variants apply and the page's own CSS wins over it. On `<html>`
 * the selector is `:root[data-e-theme]`, which outranks the default `:root` tokens of `style.css` in the same layer.
 * Returns a function that removes the stylesheet and the mark.
 */
function mountTheme(theme: Theme, target: HTMLElement): () => void {
  const doc = target.ownerDocument;
  const scope = target === doc.documentElement ? ":root" : "";
  const css = theme.css({ selector: `${scope}[data-e-theme="${theme.name.replace(/["\\]/g, "\\$&")}"]` });
  target.setAttribute("data-e-theme", theme.name);
  let remove: () => void;
  // A constructed sheet is CSSOM, so a Content-Security-Policy without unsafe-inline styles allows it.
  if ("adoptedStyleSheets" in doc && typeof CSSStyleSheet === "function" && "replaceSync" in CSSStyleSheet.prototype) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    doc.adoptedStyleSheets = [...doc.adoptedStyleSheets, sheet];
    remove = () => (doc.adoptedStyleSheets = doc.adoptedStyleSheets.filter((s) => s !== sheet));
  } else {
    const style = doc.createElement("style");
    style.textContent = css;
    doc.head.append(style);
    remove = () => style.remove();
  }
  return () => {
    remove();
    if (target.getAttribute("data-e-theme") === theme.name) target.removeAttribute("data-e-theme");
  };
}

/** The icons map stays raw inside the reactive config, so an icon component is rendered as given, never as a reactive proxy. */
function rawIcons(icons: IconsConfig | undefined): IconsConfig {
  const out = { ...icons };
  if (out.icons) out.icons = markRaw({ ...out.icons });
  return out;
}

/**
 * The theme as CSS for the server. `createEos().install()` only applies the theme in a browser, so a server-rendered
 * page paints unthemed until the client runs. Put this string in a `<style>` in the document head instead.
 *
 * ```ts
 * const html = `<style>${themeCss({ brand: "#2c95b4" })}</style>`
 * ```
 *
 * @param theme A theme from `defineTheme()`, or the same options. Default is the theme `style.css` carries.
 * @param selector Element the tokens apply to. Default `:root`. Use the same `themeTarget` scope you pass to `createEos`.
 */
export function themeCss(theme?: Theme | ThemeInput, selector?: string): string {
  return toTheme(theme).css(selector ? { selector } : undefined);
}

/**
 * Installs the library: provides the config (language, currency, direction, words, icons) and applies the theme, if one is
 * given. Unmounting the app removes the theme again, and puts back the `lang` and `dir` the target had before.
 * In a browser it also sets `lang` on the theme target when you pass a `locale`, and `dir` from `dir` or from that locale
 * (`ar` gives `rtl`), so teleported menus and dialogs inherit the direction. On the server set both on `<html>` yourself.
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
    icons: rawIcons(options.icons),
    portalTarget: options.portalTarget ?? "body",
  });
  const explicitLocale = options.locale != null;
  const theme = toTheme(options.theme);

  return {
    config,
    theme,
    install(app: App) {
      app.provide(CONFIG_KEY, config);
      app.provide(TOAST_KEY, createToasts());
      app.provide(TOOLTIP_KEY, createTooltipGroup());
      app.config.globalProperties.$e = config;
      if (typeof document === "undefined") return;
      if (options.warnOnContrast !== false && theme.issues.length && !isProduction()) {
        console.warn(
          "[eos] The theme fails these contrast pairs:\n" +
            theme.issues.map((i) => `  ${i.role}: ${i.pair.join(" on ")} is ${i.ratio}:1, needs ${i.min}:1`).join("\n"),
        );
      }
      // `null` is no target; only a left-out option means the page root.
      const target = options.themeTarget === undefined ? document.documentElement : options.themeTarget;
      if (!target) return;
      const unmountTheme = options.theme && options.applyTheme !== false ? mountTheme(theme, target) : undefined;
      const before = { lang: target.getAttribute("lang"), dir: target.getAttribute("dir") };
      const written = new Set<"lang" | "dir">();
      const write = (name: "lang" | "dir", value: string) => {
        target.setAttribute(name, value);
        written.add(name);
      };
      const stop = watchEffect(() => {
        if (explicitLocale) write("lang", config.locale);
        const dir = config.dir ?? (explicitLocale ? localeDirection(config.locale) : null);
        if (dir) write("dir", dir);
      });
      app.onUnmount(() => {
        stop();
        unmountTheme?.();
        for (const name of written) {
          const value = before[name];
          if (value == null) target.removeAttribute(name);
          else target.setAttribute(name, value);
        }
      });
    },
  } as Eos;
}
