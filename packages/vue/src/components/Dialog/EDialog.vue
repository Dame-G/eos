<script setup lang="ts">
import DialogFrame from "./DialogFrame.vue";
import EDrawerBody from "../Drawer/EDrawerBody.vue";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The question or task, shown as the heading and used as the accessible name. It reads best as a question. */
    title: string;
    /** A sentence under the title that says what the dialog is for. It is shown, and read out as the description. */
    description?: string;
    /** `alertdialog` for a confirmation that needs an answer, such as a delete. Every other dialog uses `dialog`. */
    role?: "dialog" | "alertdialog";
    /** The level of the title's heading element, 1 to 6. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    /** The width: `sm` for a confirmation, `md` for most dialogs, `lg` for a form. */
    size?: "sm" | "md" | "lg";
    /** A CSS selector for the element that takes focus when it opens, such as `#name`. Without it, an element marked `data-autofocus` does; an `alertdialog` falls back to its least destructive action and any other dialog to its first control. */
    initialFocus?: string;
    /** Closes the dialog when the backdrop is pressed as well. A form should leave it off, since a stray press would discard the work. */
    dismissible?: boolean;
    /** Shows the dialog in the page, without the backdrop or the focus trap, for a preview. */
    inline?: boolean;
  }>(),
  { role: "dialog", headingLevel: 2, size: "md" },
);

const emit = defineEmits<{
  /** Fires when the person closes it with the Close button, Escape, or the backdrop when `dismissible`. `open` is already false, so `v-model:open` is enough unless you need the moment. */
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
    :initial-focus="initialFocus"
    :content-class="['e-dialog', `e-dialog--${props.size}`, inline && 'e-dialog--inline']"
    @close="emit('close')"
  >
    <EDrawerBody class="e-dialog-body"><slot /></EDrawerBody>
    <template v-if="$slots.actions" #actions><slot name="actions" /></template>
  </DialogFrame>
</template>

<style>
@layer e.containers {
  .e-dialog {
    position: fixed;
    inset: 0;
    width: min(var(--_w), calc(100dvw - var(--e-space-8)));
    height: fit-content;
    max-height: calc(100dvh - var(--e-space-8));
    margin: auto;
    border-radius: var(--e-radius-md);
  }

  .e-dialog--inline,
  .e-dialog--inline[data-state] {
    animation: none;
    position: static;
    margin: 0;
    width: 100%;
    max-width: var(--_w);
  }
}
</style>
