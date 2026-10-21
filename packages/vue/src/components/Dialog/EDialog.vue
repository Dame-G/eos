<script setup lang="ts">
import DialogFrame from "./DialogFrame.vue";

defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    /** The question or task, as the dialog's heading and accessible name; make it a real question. */
    title: string;
    /** The level of the title's heading element, 1 to 6. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Also closes when the backdrop is pressed. Leave it off for a form, where a stray press would throw the work away. */
    dismissible?: boolean;
    /** Shows the dialog in the page, without the backdrop or the focus trap. Only for a preview. */
    inline?: boolean;
  }>(),
  { headingLevel: 2 },
);

const emit = defineEmits<{
  /** The person closed it: the Close button, Escape, or the backdrop when `dismissible`. `open` is already false. */
  close: [];
}>();

defineSlots<{
  /** The content: a sentence or two, or a short form. */
  default?(): unknown;
  /** Buttons for the foot bar, the main action first. Name the danger button for what it does. */
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
    width: min(32rem, calc(100vw - var(--e-space-8)));
    height: fit-content;
    max-height: calc(100dvh - var(--e-space-8));
    margin: auto;
    border-radius: var(--e-radius-md);
    overflow: auto;
    overscroll-behavior: contain;
  }

  .e-dialog--inline {
    position: static;
    margin: 0;
    width: 100%;
    max-width: 32rem;
  }
}
</style>
