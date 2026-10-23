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
