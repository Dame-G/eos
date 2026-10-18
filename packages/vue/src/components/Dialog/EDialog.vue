<script setup lang="ts">
import { DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from "reka-ui";
import EActions from "../Actions/EActions.vue";
import EIconButton from "../IconButton/EIconButton.vue";
import { useMessages, usePortalTarget } from "../../config.js";
import "../../styles/base.css";
import "./dialog.css";

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

/** Whether the dialog is open. */
const open = defineModel<boolean>("open");

const t = useMessages();
const target = usePortalTarget();

function setOpen(value: boolean) {
  open.value = value;
  if (!value) emit("close");
}
</script>

<template>
  <DialogRoot :open="!!open" :modal="!inline" @update:open="setOpen">
    <DialogPortal :to="target" :disabled="inline">
      <div class="e-root">
        <DialogOverlay v-if="!inline" class="e-dialog-overlay" />
        <DialogContent
          v-bind="$attrs"
          class="e-dialog"
          :class="inline && 'e-dialog--inline'"
          :aria-describedby="undefined"
          @interact-outside.prevent
        >
          <header class="e-dialog-head">
            <DialogTitle :as="`h${headingLevel}`" class="e-dialog-title">{{ title }}</DialogTitle>
            <DialogClose as-child>
              <EIconButton icon="x" :label="t('close')" />
            </DialogClose>
          </header>
          <div class="e-dialog-body"><slot /></div>
          <EActions v-if="$slots.actions" as="footer" bar class="e-dialog-foot"><slot name="actions" /></EActions>
        </DialogContent>
      </div>
    </DialogPortal>
  </DialogRoot>
</template>

<style>
@layer e.containers {
  .e-dialog {
    position: fixed;
    inset: 0;
    z-index: var(--e-z-modal);
    width: min(32rem, calc(100vw - 32px));
    height: fit-content;
    max-height: calc(100dvh - 32px);
    margin: auto;
    padding: 0;
    border: 0;
    border-radius: var(--e-radius-lg);
    background: var(--e-surface);
    color: var(--e-ink);
    box-shadow:
      0 0 0 1px var(--e-border),
      var(--e-float);
    overflow: auto;
    font-family: var(--e-font-sans);
  }

  .e-dialog-overlay {
    position: fixed;
    inset: 0;
    z-index: var(--e-z-modal);
    background: var(--e-scrim);
  }

  .e-dialog--inline {
    position: static;
    margin: 0;
    width: 100%;
    max-width: 32rem;
  }

  .e-dialog-body {
    padding: var(--e-space-3) var(--e-space-6) var(--e-space-6);
    font: 400 var(--e-text-md) / 1.5 var(--e-font-sans);
  }
}
</style>
