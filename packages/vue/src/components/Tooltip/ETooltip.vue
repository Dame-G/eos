<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { TooltipContent, TooltipPortal, TooltipProvider, TooltipRoot, TooltipTrigger } from "reka-ui";
import { useConfig, usePortalTarget } from "../../config.js";
import { useTooltipGroup } from "./group.js";
import "../../styles/base.css";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** What the tooltip says: a name for the control, never anything you must read or click. */
    label: string;
    /** Which edge of the control it sits on. `start` and `end` follow the reading direction. */
    side?: "top" | "bottom" | "start" | "end";
    /** Milliseconds of hovering before it shows. Keyboard focus shows it at once, and so does moving from one tooltip to the next. */
    delay?: number;
  }>(),
  { side: "top", delay: 400 },
);

defineSlots<{
  /** One focusable element: an icon button, a link. It becomes the trigger and is described by the bubble. */
  default(): unknown;
}>();

const portal = usePortalTarget();
const config = useConfig();
const group = useTooltipGroup();
/** Whether the bubble shows. Hover, focus and Escape update it. */
const open = defineModel<boolean>("open", { default: false });

// The direction is only read once mounted, so the server and the first client render agree.
const rtl = ref(config.dir === "rtl");
onMounted(() => {
  if (!config.dir) rtl.value = getComputedStyle(document.documentElement).direction === "rtl";
});
const placement = computed(() => {
  if (props.side === "start") return rtl.value ? "right" : "left";
  if (props.side === "end") return rtl.value ? "left" : "right";
  return props.side;
});
const delayNow = computed(() => (group.skipping.value ? 0 : props.delay));

watch(open, (now) => (now ? group.opened() : group.closed()));

let hold: ReturnType<typeof setTimeout> | undefined;
onBeforeUnmount(() => clearTimeout(hold));
function touchStart(e: PointerEvent) {
  if (e.pointerType !== "touch") return;
  clearTimeout(hold);
  requestAnimationFrame(() => (open.value = true));
}
function touchEnd(e: PointerEvent) {
  if (e.pointerType !== "touch") return;
  clearTimeout(hold);
  hold = setTimeout(() => (open.value = false), 1500);
}
</script>

<template>
  <TooltipProvider :delay-duration="delay">
    <TooltipRoot v-model:open="open" :delay-duration="delayNow">
      <TooltipTrigger as-child @pointerdown="touchStart" @pointerup="touchEnd" @pointercancel="touchEnd">
        <slot />
      </TooltipTrigger>
      <TooltipPortal :to="portal">
        <TooltipContent class="e-tip-bubble e-root" :side="placement" align="center" :side-offset="8" v-bind="$attrs">
          {{ label }}
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>

<style>
@layer e.containers {
  .e-tip-bubble {
    z-index: var(--e-z-tooltip);
    width: max-content;
    max-width: 16rem;
    padding: var(--e-space-2) var(--e-space-3);
    border-radius: var(--e-radius-sm);
    background: var(--e-ink);
    color: var(--e-surface);
    font: var(--e-weight-regular) var(--e-text-sm) / 1.35 var(--e-font-sans);
    text-align: center;
  }
}
</style>
