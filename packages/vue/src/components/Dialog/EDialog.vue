<script setup lang="ts">
import { computed } from "vue";
import DialogFrame from "./DialogFrame.vue";
import DialogBody from "./DialogBody.vue";
import type { DialogFrameProps } from "./frame.js";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    DialogFrameProps & {
      /** The width: `sm` for a confirmation, `md` for most dialogs, `lg` for a form. */
      size?: "sm" | "md" | "lg";
    }
  >(),
  { role: "dialog", headingLevel: 2, size: "md" },
);

/** Everything but the size goes to the frame as it is. */
const frame = computed(() => {
  const { size: _size, ...shared } = props;
  return shared;
});

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
    v-bind="{ ...$attrs, ...frame }"
    v-model:open="open"
    :content-class="['e-dialog', `e-dialog--${props.size}`, inline && 'e-dialog--inline']"
    @close="emit('close')"
  >
    <DialogBody class="e-dialog-body"><slot /></DialogBody>
    <template v-if="$slots.actions" #actions><slot name="actions" /></template>
  </DialogFrame>
</template>

<style>
@layer e.containers {
  .e-dialog {
    position: fixed;
    inset: 0;
    width: min(var(--_w), calc(100vw - var(--e-space-8)));
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
