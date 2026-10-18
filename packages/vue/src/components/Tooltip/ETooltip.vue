<script setup lang="ts">
import { TooltipContent, TooltipPortal, TooltipProvider, TooltipRoot, TooltipTrigger } from "reka-ui";
import { usePortalTarget } from "../../config.js";
import "../../styles/base.css";

// class, style and other attributes belong to the bubble; the trigger is the consumer's own element.
defineOptions({ inheritAttrs: false });

defineProps<{
  /** What the tooltip says: a name for the control, never anything you must read or click. */
  label: string;
}>();

defineSlots<{
  /** One focusable element: an icon button, a link. It becomes the trigger and is described by the bubble. */
  default(): unknown;
}>();

const portal = usePortalTarget();
/** Whether the tooltip is showing. */
const open = defineModel<boolean>("open", { default: false });

// The tooltip also shows while a finger is held on the control. It goes a moment after the finger lifts.
let hold: ReturnType<typeof setTimeout> | undefined;
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
  <TooltipProvider :delay-duration="400" :skip-delay-duration="300">
    <TooltipRoot v-model:open="open">
      <TooltipTrigger as-child @pointerdown="touchStart" @pointerup="touchEnd" @pointercancel="touchEnd">
        <slot />
      </TooltipTrigger>
      <TooltipPortal :to="portal">
        <TooltipContent class="e-tip-bubble e-root" side="top" align="center" :side-offset="8" v-bind="$attrs">
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
    padding: 6px 10px;
    border-radius: var(--e-radius-sm);
    background: var(--e-ink);
    color: var(--e-surface);
    font: 400 var(--e-text-sm) / 1.35 var(--e-font-sans);
    text-align: center;
  }
}
</style>
