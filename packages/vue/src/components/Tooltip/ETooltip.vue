<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from "vue";
import { TooltipContent, TooltipPortal, TooltipProvider, TooltipRoot, TooltipTrigger } from "reka-ui";
import { usePortalTarget } from "../../config.js";
import { useDir, useLogicalSide } from "../../composables/useDir.js";
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

const emit = defineEmits<{
  /** It hid, by blur, pointer leave or Escape. `open` is already false. */
  close: [];
}>();

defineSlots<{
  /** One focusable element: an icon button, a link. It becomes the trigger and is described by the bubble. */
  default(): unknown;
}>();

const portal = usePortalTarget();
const dir = useDir();
const group = useTooltipGroup();
/** Whether the bubble shows. Hover, focus and Escape update it. */
const open = defineModel<boolean>("open", { default: false });

const placement = useLogicalSide(() => props.side);
const delayNow = computed(() => (group.skipping.value ? 0 : props.delay));

watch(open, (now) => {
  if (now) group.opened();
  else {
    group.closed();
    emit("close");
  }
});

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
        <TooltipContent
          class="e-tip-bubble e-root"
          :side="placement"
          align="center"
          :side-offset="8"
          :collision-padding="8"
          v-bind="$attrs"
        >
          {{ label }}
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>

<style>
@layer e.primitives {
  .e-tip-bubble {
    z-index: var(--e-z-tooltip);
    width: max-content;
    max-width: 16rem;
    padding: var(--e-gap-snug) var(--e-pad-control-sm);
    border-radius: var(--e-radius-sm);
    background: var(--e-ink);
    color: var(--e-surface);
    font: var(--e-weight-regular) var(--e-text-sm) / 1.35 var(--e-font-sans);
    text-align: center;
  }
}
</style>
