<script setup lang="ts">
import DialogFrame from "../Dialog/DialogFrame.vue";
import DialogBody from "../Dialog/DialogBody.vue";

defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    /** The panel's heading and accessible name, such as the statement being read. */
    title: string;
    /** A sentence under the title that says what the drawer is for. It is shown, and read out as the description. */
    description?: string;
    /** `alertdialog` for a confirmation that needs an answer, such as a delete. Every other drawer uses `dialog`. */
    role?: "dialog" | "alertdialog";
    /** The level of the title's heading element, 1 to 6. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    /** The edge it slides in from. `end` is the right in a left-to-right page, `start` the left, and both flip in a right-to-left page. `bottom` gives a sheet that suits phones. */
    side?: "end" | "start" | "bottom";
    /** The width of a side drawer: `sm`, `md` or `lg`. A `bottom` sheet is always full width. */
    size?: "sm" | "md" | "lg";
    /** A CSS selector for the element that takes focus when it opens. Without it, an element marked `data-autofocus` does; an `alertdialog` falls back to its least destructive action and any other drawer to its first control. */
    initialFocus?: string;
    /** Closes the drawer when the backdrop is pressed as well. A form should leave it off, since a stray press would discard the work. A press on a toast does not count. */
    dismissible?: boolean;
    /** Shows the drawer in the page, without the backdrop or the focus trap, for a preview. Escape and presses outside leave it open. */
    inline?: boolean;
  }>(),
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
</script>

<template>
  <DialogFrame
    v-bind="$attrs"
    v-model:open="open"
    :title="title"
    :heading-level="headingLevel"
    :description="description"
    :role="role"
    :inline="inline"
    :dismissible="dismissible"
    :initial-focus="initialFocus"
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

    position: fixed;
    inset: 0;
    width: min(var(--_w), 100dvw);
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
    max-height: min(32rem, 85dvh);
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
    height: 26rem;
    margin: 0;
    transform: none;
  }

  .e-drawer--inline.e-drawer--bottom {
    max-width: var(--_w);
    height: auto;
    max-height: 18rem;
    border-radius: var(--e-radius-md);
  }
}
</style>
