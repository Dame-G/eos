<script setup lang="ts">
import { computed, markRaw, onBeforeUnmount, onMounted, provide, reactive, ref } from "vue";
import { darkVariant, defineTheme, themeVariant, type Theme, type ThemeInput } from "@eos-ui/tokens";
import { CONFIG_KEY, useConfig, type EosConfig, type MessageValue } from "../../config.js";
import type { IconsConfig } from "../../icons/types.js";
import { localeDirection } from "../../composables/useLocale.js";
import type { ElementTag } from "../../composables/useSize.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** A theme from `defineTheme()`, or the same options, for this part of the page. Its tokens are set on this element, so everything inside (and every menu, dialog and tooltip opened from inside) takes them. Left out, the page theme shows through. */
    theme?: Theme | ThemeInput;
    /** Shows the light or the dark variant of `theme` (of the default theme when there is none). For theme options the dark one is derived as `scheme: "auto"` derives it, from the `dark` options. A built `Theme` has a dark variant only if it was built with `scheme: "auto"`; otherwise it shows as built. Left out, a theme with `scheme: "auto"` follows the reader's setting. */
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
    /** Renders menus, dialogs, tooltips and toasts opened from inside into this element, so they keep its theme and direction. `false` leaves them where the parent puts them. Left out, they render here only when `theme` or `scheme` is set. */
    portal?: boolean;
  }>(),
  { as: "div", portal: undefined },
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
    const portal = props.portal ?? Boolean(props.theme || props.scheme);
    return portal && mounted.value && scope.value ? scope.value : parent.portalTarget;
  },
}) as EosConfig;
provide(CONFIG_KEY, config);

const direction = computed(() =>
  props.dir || props.locale ? (config.dir ?? localeDirection(config.locale)) : undefined,
);

// A theme with media-query variants (`scheme: "auto"`, `contrast: "auto"`) picks one in the browser, after hydration.
const prefersDark = ref(false);
const prefersMore = ref(false);
const queries: [MediaQueryList, () => void][] = [];
onMounted(() => {
  if (typeof matchMedia !== "function") return;
  for (const [query, flag] of [
    ["(prefers-color-scheme: dark)", prefersDark],
    ["(prefers-contrast: more)", prefersMore],
  ] as const) {
    const list = matchMedia(query);
    const update = () => (flag.value = list.matches);
    update();
    list.addEventListener("change", update);
    queries.push([list, update]);
  }
});
onBeforeUnmount(() => {
  for (const [list, update] of queries.splice(0)) list.removeEventListener("change", update);
});

const isTheme = (t: Theme | ThemeInput): t is Theme => typeof (t as Theme).css === "function";
/** The theme built once per `theme` and `scheme`: a fixed theme's dark variant is derived only when `scheme` asks for it. */
const theme = computed<Theme | null>(() => {
  const given = props.theme;
  if (!given && !props.scheme) return null;
  if (given && isTheme(given)) return given;
  const input: ThemeInput = { ...given };
  if (props.scheme === "dark" && input.scheme !== "auto") return defineTheme(darkVariant(input));
  return defineTheme(input);
});

/** The tokens as inline custom properties, so the server renders the themed part themed. */
const style = computed(() => {
  const t = theme.value;
  if (!t) return undefined;
  const { tokens, colorScheme } = themeVariant(t, {
    dark: props.scheme ? props.scheme === "dark" : prefersDark.value,
    more: prefersMore.value,
  });
  const out: Record<string, string> = { "color-scheme": colorScheme };
  for (const [name, value] of Object.entries(tokens)) out[`--e-${name}`] = value;
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
