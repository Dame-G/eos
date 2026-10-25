// The hand-written part of the package entry: everything that is not a component folder or a composable file. The
// generated src/index.ts re-exports it (`export * from "./core.js"`), then each composable's public names and each
// component folder. Every name here is public API (test/public-api.txt and test/public-types.txt list them).
export { createEos, themeCss } from "./plugin.js";
export type { Eos, EosOptions } from "./plugin.js";
export { useConfig, useMessages, useIconResolver, usePortalTarget, CONFIG_KEY } from "./config.js";
export type { EosConfig, MessageValue, PluralMessage, Translate, ResolvedIcon } from "./config.js";
export { defaultMessages } from "./messages.js";
export type { MessageKey } from "./messages.js";
export { phosphor } from "./icons/phosphor.js";
export type { IconName, IconMarkup } from "./icons/phosphor.js";
export { iconNames } from "./icons/types.js";
export type { IconProp, IconSource, IconsConfig, IconContext } from "./icons/types.js";
export { defineTheme } from "@eos-ui/tokens";
export type { Theme, ThemeInput } from "@eos-ui/tokens";
export type { Size, Tone, ElementTag } from "./types.js";
