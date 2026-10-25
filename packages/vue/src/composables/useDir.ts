import { computed, getCurrentInstance, onMounted, ref, type ComputedRef } from "vue";
import { useConfig } from "../config.js";
import { localeDirection } from "./useLocale.js";

type Dir = "ltr" | "rtl";

/** The direction the browser gives a node: its own or an inherited `dir`, or a CSS `direction`. */
function domDirection(node: Node | null | undefined): Dir {
  const own = node instanceof Element ? node : node?.parentElement;
  const el = own?.isConnected ? own : document.documentElement;
  return getComputedStyle(el).direction === "rtl" ? "rtl" : "ltr";
}

/** Counts changes of any `dir` attribute in the page (the plugin sets one when the locale changes), so a mounted part reads its direction again. One observer serves the whole page. */
const dirChanges = ref(0);
let observer: MutationObserver | undefined;
function watchDirChanges() {
  if (observer || typeof MutationObserver === "undefined") return;
  observer = new MutationObserver(() => dirChanges.value++);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["dir"], subtree: true });
}

/**
 * The text direction every part should use: `createEos({ dir })` (or an `EConfigProvider`'s) when set, otherwise the
 * direction of the page around the component once it is mounted, so the script agrees with CSS `:dir()`. On the
 * server, and before mounting, it is the one the locale is written in (`ar`, `he`, `fa` and `ur` are right to left).
 * Reka UI falls back to left to right when it is not told, so give this to every Reka root that takes `dir`, or wrap the
 * component in Reka's `ConfigProvider`:
 *
 * ```vue
 * <ConfigProvider :dir="dir"><SelectRoot>...</SelectRoot></ConfigProvider>
 * ```
 */
export function useDir(): ComputedRef<Dir> {
  const config = useConfig();
  const mounted = ref(false);
  const instance = getCurrentInstance();
  if (instance)
    onMounted(() => {
      watchDirChanges();
      mounted.value = true;
    });
  return computed(() => {
    if (config.dir) return config.dir;
    if (!mounted.value) return localeDirection(config.locale);
    void dirChanges.value;
    return domDirection(instance?.proxy?.$el as Node | undefined);
  });
}

/** A side that follows the reading direction (`start`, `end`), or `top` or `bottom`. */
export type LogicalSide = "top" | "bottom" | "start" | "end";

/**
 * The physical side for a floating part (Reka's `side`): `start` and `end` become `left` and `right` in a left-to-right
 * page, and the other way round in a right-to-left one. `top` and `bottom` are kept as they are.
 */
export function useLogicalSide(side: () => LogicalSide): ComputedRef<"top" | "bottom" | "left" | "right"> {
  const dir = useDir();
  return computed(() => {
    const s = side();
    const rtl = dir.value === "rtl";
    if (s === "start") return rtl ? "right" : "left";
    if (s === "end") return rtl ? "left" : "right";
    return s;
  });
}

/** Pixels between a floating panel (a menu, a tooltip) and the control that opened it. @internal */
export const FLOAT_OFFSET = 8;
/** Pixels between a submenu and the row that opened it: closer, so it reads as part of the same menu. @internal */
export const SUBMENU_OFFSET = 4;
/** Pixels a menu keeps from the edge of the screen. @internal */
export const EDGE_PADDING = 16;
/** Pixels a small floating part (a tooltip, a submenu) keeps from the edge of the screen. @internal */
export const EDGE_PADDING_TIGHT = 8;
