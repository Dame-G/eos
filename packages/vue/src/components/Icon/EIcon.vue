<script setup lang="ts">
import { computed } from "vue";
import { useIconResolver } from "../../config.js";
import type { Size } from "../../types.js";
import type { IconProp } from "../../icons/types.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** A name (from the built-in list or your icon set, such as `"credit-card"` or `"lucide:credit-card"`), or an icon component. */
    name: IconProp;
    /** `sm` is 14px (drawn in the bold weight) for chips and stamps, `md` 20px, `lg` 28px and `xl` 40px. */
    size?: Size;
    /** The bold weight at the normal 20px size, where the icon set has one. */
    bold?: boolean;
    /** Makes the icon informative: it becomes an image with this name. Without it the icon is decoration and hidden from screen readers. */
    label?: string;
    /** Turns the icon around in right-to-left text, for a component icon that points one way. A name with a `left` or `right` part (`chevron-left`) does so without it; `:flip="false"` stops that. */
    flip?: boolean;
  }>(),
  { size: "md", flip: undefined },
);

const resolve = useIconResolver();
const resolved = computed(() => resolve(props.name as string, props.size === "sm" || !!props.bold));
/** An arrow or chevron that points left or right turns around in a right-to-left page. A physical alignment (`text-align-left`) does not. */
const directional = computed(
  () =>
    props.flip ??
    (typeof props.name === "string" && /(^|[-:])(left|right)(-|$)/.test(props.name) && !/align/.test(props.name)),
);
const common = computed(() => ({
  class: ["e-icon", { "e-icon--s": props.size === "sm", "e-icon--dir": directional.value }],
  // Each size reads the token of its name. `md` is the icon size every component uses, so it sets nothing and a component can still change it.
  style: props.size === "md" ? undefined : { "--_size": `var(--e-icon-size-${props.size})` },
  role: props.label ? "img" : undefined,
  "aria-label": props.label || undefined,
  "aria-hidden": props.label ? undefined : (true as const),
}));
</script>

<template>
  <component :is="resolved.component" v-if="resolved.kind === 'component'" v-bind="common" focusable="false" />
  <span v-else-if="resolved.kind === 'svg'" v-bind="common" class="e-icon--svg" v-html="resolved.html" />
  <svg
    v-else-if="resolved.kind === 'glyph'"
    v-bind="common"
    class="e-icon--glyph"
    :viewBox="resolved.viewBox"
    focusable="false"
    v-html="resolved.html"
  />
</template>

<style>
@layer e.primitives {
  .e-icon {
    flex: none;
    width: var(--_size, var(--e-icon-size-md));
    height: var(--_size, var(--e-icon-size-md));
  }

  .e-icon--glyph {
    fill: currentcolor;
    stroke: none;
  }

  .e-icon--svg {
    display: inline-flex;
  }

  .e-icon--svg > svg {
    width: 100%;
    height: 100%;
  }

  :dir(rtl) .e-icon--dir {
    transform: scaleX(-1);
  }
}
</style>
