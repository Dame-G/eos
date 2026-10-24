import { computed, type ComputedRef } from "vue";
import { useConfig } from "../config.js";
import { localeDirection } from "./useLocale.js";

/**
 * The text direction every part should use: `createEos({ dir })` when set, otherwise the one the locale is written in
 * (`ar`, `he`, `fa` and `ur` are right to left). Reka UI falls back to left to right when it is not told, so give this to
 * every Reka root that takes `dir`, or wrap the component in Reka's `ConfigProvider`:
 *
 * ```vue
 * <ConfigProvider :dir="dir"><SelectRoot>...</SelectRoot></ConfigProvider>
 * ```
 */
export function useDir(): ComputedRef<"ltr" | "rtl"> {
  const config = useConfig();
  return computed(() => config.dir ?? localeDirection(config.locale));
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
