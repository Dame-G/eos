<script setup lang="ts">
import { computed, useAttrs } from "vue";
import EKicker from "../Kicker/EKicker.vue";
import "../../styles/base.css";
import "./scale.css";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** 1 to 6. The step of the type scale and, unless `as` is set, the element (`h1` to `h6`). The sizes are 36, 24, 20, 18, 16 and 14px, and `textScale` rescales them. Use one level 1 per page and do not skip levels. */
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    /** The element, when it should differ from the level: `as="h3"` with `level` 2 is an `h3` drawn at the size of an `h2`. Use `p`, `div` or `span` for text that looks like a heading but is not part of the outline. @default the heading for `level` */
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "div" | "span";
    /** A label above the heading. It renders an `EKicker`, which is not itself a heading. */
    kicker?: string;
  }>(),
  { level: 2 },
);

defineSlots<{
  /** The heading text. */
  default(): unknown;
}>();

const attrs = useAttrs();
const tag = computed(() => props.as ?? `h${props.level}`);
/** With a kicker there is a wrapper: it takes `class` and `style`, the heading takes the rest. Without one everything lands on the heading. */
const outer = computed(() => ({ class: attrs.class, style: attrs.style }));
const inner = computed(() => {
  if (!props.kicker) return attrs;
  const rest = { ...attrs };
  delete rest.class;
  delete rest.style;
  return rest;
});
</script>

<template>
  <div v-if="kicker" class="e-heading" v-bind="outer">
    <EKicker>{{ kicker }}</EKicker>
    <component :is="tag" class="e-h" :class="`e-h${level}`" v-bind="inner"><slot /></component>
  </div>
  <component :is="tag" v-else class="e-h" :class="`e-h${level}`" v-bind="inner"><slot /></component>
</template>

<style>
@layer e.primitives {
  .e-heading {
    display: grid;
    gap: var(--e-space-1);
  }

  .e-heading > .e-kicker {
    margin: 0;
  }
}
</style>
