<script setup lang="ts">
import DialogFrame from "./DialogFrame.vue";

defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    /** The question or task, as the dialog's heading and accessible name. */
    title: string;
    /** The level of the title's heading element, 1 to 6. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Shows the dialog in the page, without the backdrop or the focus trap. Only for a preview. */
    inline?: boolean;
  }>(),
  { headingLevel: 2 },
);

const emit = defineEmits<{
  /** The person closed it: the Close button, or Escape. `open` is already false. */
  close: [];
}>();

defineSlots<{
  /** The content: a sentence or two, or a short form. */
  default?(): unknown;
  /** Buttons for the foot bar, the main action first. Name the danger button for what it does. */
  actions?(): unknown;
}>();

const open = defineModel<boolean>("open");
</script>

<template>
  <DialogFrame
    v-bind="$attrs"
    v-model:open="open"
    :title="title"
    :heading-level="headingLevel"
    :inline="inline"
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
    width: min(32rem, calc(100vw - 32px));
    height: fit-content;
    max-height: calc(100dvh - 32px);
    margin: auto;
    border-radius: var(--e-radius-lg);
    overflow: auto;
  }

  .e-dialog--inline {
    position: static;
    margin: 0;
    width: 100%;
    max-width: 32rem;
  }
}
</style>
