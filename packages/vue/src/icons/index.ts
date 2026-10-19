import type { IconsConfig } from "./types.js";

export { iconNames } from "./types.js";
export type { IconProp, IconSource, IconsConfig, IconContext } from "./types.js";
export type { IconName } from "./phosphor.js";
export { lucide, tabler, heroicons, phosphorVue } from "./adapters.js";
export type { AdapterOptions, PhosphorVueOptions, IconModule } from "./adapters.js";

/** Returns the config unchanged. It exists so your editor checks the shape: `createEos({ icons: defineIcons({ ... }) })`. */
export function defineIcons<T extends IconsConfig>(config: T): T {
  return config;
}
