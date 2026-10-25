<script setup lang="ts">
import { computed } from "vue";
import DialogFrame from "../Dialog/DialogFrame.vue";
import DialogBody from "../Dialog/DialogBody.vue";
import type { DialogFrameProps } from "../Dialog/frame.js";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    DialogFrameProps & {
      /** The edge it slides in from. `end` is the right in a left-to-right page, `start` the left, and both flip in a right-to-left page. `bottom` gives a sheet that suits phones. */
      side?: "end" | "start" | "bottom";
      /** The width of a side drawer: `sm` (28rem), `md` (32rem) or `lg` (36rem), never wider than the screen. A `bottom` sheet is always full width. */
      size?: "sm" | "md" | "lg";
    }
  >(),
  { role: "dialog", headingLevel: 2, side: "end", size: "sm" },
);

const emit = defineEmits<{
  /** Fires when the person closes it with the Close button, Escape, or the backdrop when `dismissible`. `open` is already false. */
  close: [];
}>();

defineSlots<{
  /** The content, such as a statement or receipt. It scrolls inside the drawer. */
  default?(): unknown;
  /** Buttons for the foot bar, with the main action first. */
  actions?(): unknown;
}>();

/** Whether it is open. Without a binding it keeps its own state. */
const open = defineModel<boolean>("open");

/** Everything but the side and the size goes to the frame as it is. */
const frame = computed<DialogFrameProps>(() => {
  const shared: Record<string, unknown> = { ...props };
  delete shared.side;
  delete shared.size;
  return shared as unknown as DialogFrameProps;
});
</script>

<template>
  <DialogFrame
    v-bind="{ ...$attrs, ...frame }"
    v-model:open="open"
    :content-class="[
      'e-drawer',
      `e-drawer--${size}`,
      side !== 'end' && `e-drawer--${side}`,
      inline && 'e-drawer--inline',
    ]"
    @close="emit('close')"
  >
    <DialogBody class="e-drawer-body"><slot /></DialogBody>
    <template v-if="$slots.actions" #actions><slot name="actions" /></template>
  </DialogFrame>
</template>

<style>
@layer e.containers {
  /* The panel sits against the inline-end edge. `--_slide` is 1 in a left-to-right page and -1 in a right-to-left one, so the slide and the side both flip. */
  .e-drawer {
    --_slide: 1;

    /* The height of an inline preview: a side drawer, and a bottom sheet at most. */
    --_preview-h: 26rem;
    --_preview-sheet-h: 18rem;

    position: fixed;
    inset: 0;
    width: min(var(--_w), 100vw);
    height: 100dvh;
    max-height: none;
    margin-block: 0;
    margin-inline: auto 0;
    border-radius: 0;
  }

  .e-drawer:dir(rtl) {
    --_slide: -1;
  }

  .e-drawer--start {
    margin-inline: 0 auto;
  }

  .e-drawer--bottom {
    inset: auto 0 0;
    width: 100%;
    height: auto;
    max-height: min(var(--e-size-panel-md), 85dvh);
    margin: 0;
    border-start-start-radius: var(--e-radius-md);
    border-start-end-radius: var(--e-radius-md);
  }

  .e-drawer[data-state="open"] {
    animation: e-drawer-in var(--e-duration-move) var(--e-easing-enter);
  }

  .e-drawer[data-state="closed"] {
    animation: e-drawer-out var(--e-duration-move) var(--e-easing-exit) forwards;
  }

  .e-drawer--start[data-state="open"] {
    animation-name: e-drawer-in-start;
  }

  .e-drawer--start[data-state="closed"] {
    animation-name: e-drawer-out-start;
  }

  .e-drawer--bottom[data-state="open"] {
    animation-name: e-drawer-in-bottom;
  }

  .e-drawer--bottom[data-state="closed"] {
    animation-name: e-drawer-out-bottom;
  }

  @keyframes e-drawer-in-bottom {
    from {
      transform: translateY(100%);
    }
  }

  @keyframes e-drawer-out-bottom {
    to {
      transform: translateY(100%);
    }
  }

  @keyframes e-drawer-in {
    from {
      transform: translateX(calc(100% * var(--_slide)));
    }
  }

  @keyframes e-drawer-out {
    to {
      transform: translateX(calc(100% * var(--_slide)));
    }
  }

  @keyframes e-drawer-in-start {
    from {
      transform: translateX(calc(-100% * var(--_slide)));
    }
  }

  @keyframes e-drawer-out-start {
    to {
      transform: translateX(calc(-100% * var(--_slide)));
    }
  }

  .e-drawer--inline,
  .e-drawer--inline[data-state] {
    animation: none;
    position: static;
    width: 100%;
    max-width: var(--_w);
    height: var(--_preview-h);
    margin: 0;
    transform: none;
  }

  .e-drawer--inline.e-drawer--bottom {
    max-width: var(--_w);
    height: auto;
    max-height: var(--_preview-sheet-h);
    border-radius: var(--e-radius-md);
  }
}
</style>
