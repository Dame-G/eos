<script setup lang="ts">
import { computed, markRaw, onBeforeUnmount, onMounted, provide, reactive, ref } from "vue";
import { defineTheme, type Theme, type ThemeInput } from "@eos-ui/tokens";
import { CONFIG_KEY, useConfig, type EosConfig, type MessageValue } from "../../config.js";
import type { IconsConfig } from "../../icons/types.js";
import { localeDirection } from "../../composables/useLocale.js";
import type { ElementTag } from "../../composables/useSize.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** A theme from `defineTheme()`, or the same options, for this part of the page. Its tokens are set on this element, so everything inside (and every menu, dialog and tooltip opened from inside) takes them. Left out, the page theme shows through. */
    theme?: Theme | ThemeInput;
    /** Shows the light or the dark variant of `theme` (of the default theme when there is none). The dark one is derived as `scheme: "auto"` derives it on a dark page, from the theme's `dark` options. Left out, a theme with `scheme: "auto"` follows the reader's setting. */
    scheme?: "light" | "dark";
    /** The language for this part (BCP 47). Sets `lang` on the element, and `dir` from the language unless `dir` is given. Left out, the parent's. */
    locale?: string;
    /** The currency for amounts in this part (ISO 4217). Left out, the parent's. */
    currency?: string;
    /** The text direction for this part. Left out, the one `locale` is written in, or the parent's. */
    dir?: "ltr" | "rtl";
    /** Words for this part, laid over the parent's (and the plugin's) messages. */
    messages?: Record<string, MessageValue>;
    /** Icons for this part, laid over the parent's: `icons` and `aliases` are merged, `resolve` and `builtin` replace. */
    icons?: IconsConfig;
    /** The element to render. */
    as?: ElementTag;
    /** Renders menus, dialogs, tooltips and toasts opened from inside into this element, so they keep its theme and direction. `false` leaves them where the parent puts them. */
    portal?: boolean;
  }>(),
  { as: "div", portal: true },
);

defineSlots<{
  /** The part of the page the config applies to. */
  default(): unknown;
}>();

const parent = useConfig();
const scope = ref<HTMLElement | null>(null);
const mounted = ref(false);
onMounted(() => (mounted.value = true));
onBeforeUnmount(() => (mounted.value = false));

const icons = computed<IconsConfig>(() => {
  const own = props.icons;
  if (!own) return parent.icons;
  return {
    ...parent.icons,
    ...own,
    icons: markRaw({ ...parent.icons.icons, ...own.icons }),
    aliases: { ...parent.icons.aliases, ...own.aliases },
  };
});

// Every field reads the parent when this provider leaves it out, so a change to the plugin's config reaches inside.
const config = reactive({
  get locale() {
    return props.locale ?? parent.locale;
  },
  get currency() {
    return props.currency ?? parent.currency;
  },
  get dir() {
    return props.dir ?? (props.locale ? null : parent.dir);
  },
  get messages() {
    return props.messages ? { ...parent.messages, ...props.messages } : parent.messages;
  },
  get icons() {
    return icons.value;
  },
  get portalTarget() {
    return props.portal && mounted.value && scope.value ? scope.value : parent.portalTarget;
  },
}) as EosConfig;
provide(CONFIG_KEY, config);

const direction = computed(() =>
  props.dir || props.locale ? (config.dir ?? localeDirection(config.locale)) : undefined,
);

// A theme that follows the reader (`scheme: "auto"`) picks its variant in the browser, after hydration.
const prefersDark = ref(false);
let media: MediaQueryList | undefined;
const onScheme = () => (prefersDark.value = !!media?.matches);
onMounted(() => {
  if (typeof matchMedia !== "function") return;
  media = matchMedia("(prefers-color-scheme: dark)");
  onScheme();
  media.addEventListener("change", onScheme);
});
onBeforeUnmount(() => media?.removeEventListener("change", onScheme));

const GROUNDS = ["background", "surface", "foreground"] as const;
/** The dark variant of a theme's options, as `defineTheme` derives it for `scheme: "auto"`. */
function darkOf(input: ThemeInput): ThemeInput {
  const { dark, ...rest } = input;
  const own: ThemeInput = { ...rest };
  for (const key of GROUNDS) delete own[key];
  return { surface: "#10151a", ...own, ...dark, scheme: "dark", tokens: { ...own.tokens, ...dark?.tokens } };
}

const isTheme = (t: Theme | ThemeInput): t is Theme => typeof (t as Theme).css === "function";
const theme = computed<Theme | null>(() => {
  const given = props.theme;
  if (!given && !props.scheme) return null;
  if (given && isTheme(given)) return given;
  const input: ThemeInput = { ...given };
  const dark = props.scheme ? props.scheme === "dark" : input.scheme === "auto" && prefersDark.value;
  if (dark) return defineTheme(darkOf(input));
  return defineTheme({ ...input, scheme: props.scheme ?? (input.scheme === "auto" ? "light" : input.scheme) });
});

/** The tokens as inline custom properties, so the server renders the themed part themed. */
const style = computed(() => {
  const t = theme.value;
  if (!t) return undefined;
  const out: Record<string, string> = {};
  for (const [name, value] of Object.entries(t.tokens)) out[`--e-${name}`] = value;
  const scheme = /color-scheme:\s*([^;]+);/.exec(t.css({ layer: false }))?.[1]?.trim();
  if (scheme) out["color-scheme"] = scheme;
  return out;
});
</script>

<template>
  <component
    :is="as"
    ref="scope"
    class="e-config"
    :class="theme && 'e-root'"
    :data-e-theme="theme?.name"
    :lang="locale"
    :dir="direction"
    :style="style"
  >
    <slot />
  </component>
</template>

<style>
@layer e.blocks {
  /* Block flow, not a flex or grid box: a menu or dialog that renders in here leaves a wrapper behind, and a gap would
     space it like an item. */
  .e-config {
    display: flow-root;
    min-width: 0;
  }
}
</style>
