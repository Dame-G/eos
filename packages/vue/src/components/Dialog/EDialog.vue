<script setup lang="ts">
import DialogFrame from "./DialogFrame.vue";

defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    /** The question or task, shown as the heading and used as the accessible name. It reads best as a question. */
    title: string;
    /** A sentence under the title that says what the dialog is for. It is shown, and read out as the description. */
    description?: string;
    /** `alertdialog` for a confirmation that needs an answer, such as a delete. Every other dialog uses `dialog`. */
    role?: "dialog" | "alertdialog";
    /** The level of the title's heading element, 1 to 6. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Closes the dialog when the backdrop is pressed as well. A form should leave it off, since a stray press would discard the work. */
    dismissible?: boolean;
    /** Shows the dialog in the page, without the backdrop or the focus trap, for a preview. */
    inline?: boolean;
  }>(),
  { role: "dialog", headingLevel: 2 },
);

const emit = defineEmits<{
  /** Fires when the person closes it with the Close button, Escape, or the backdrop when `dismissible`. `open` is already false. */
  close: [];
}>();

defineSlots<{
  /** The content: a sentence or two, or a short form. */
  default?(): unknown;
  /** Buttons for the foot bar, with the main action first. The danger button is named for what it does. */
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
    :content-class="['e-dialog', inline && 'e-dialog--inline']"
    @close="emit('close')"
  >
    <div class="e-dialog-body"><slot /></div>
    <template v-if="$slots.actions" #actions><slot name="actions" /></template>
  </DialogFrame>
</template>

<style>
@layer e.containers {
  .e-dialog {
    position: fixed;
    inset: 0;
    width: min(32rem, calc(100dvw - var(--e-space-8)));
    height: fit-content;
    max-height: calc(100dvh - var(--e-space-8));
    margin: auto;
    border-radius: var(--e-radius-md);
    overflow: auto;
    overscroll-behavior: contain;
  }

  /* A short scale and fade in, the counterpart of the drawer's slide. The motion tokens go to ~0 under reduced motion. */
  .e-dialog[data-state="open"] {
    animation: e-dialog-in var(--e-duration-move) var(--e-easing-out);
  }

  .e-dialog[data-state="closed"] {
    animation: e-dialog-out var(--e-duration-move) var(--e-easing-out) forwards;
  }

  @keyframes e-dialog-in {
    from {
      opacity: 0;
      transform: scale(0.96);
    }
  }

  @keyframes e-dialog-out {
    to {
      opacity: 0;
      transform: scale(0.96);
    }
  }

  .e-dialog--inline,
  .e-dialog--inline[data-state] {
    animation: none;
    position: static;
    margin: 0;
    width: 100%;
    max-width: 32rem;
  }
}
</style>
