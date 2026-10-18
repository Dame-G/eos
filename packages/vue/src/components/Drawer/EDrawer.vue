<script setup lang="ts">
import { DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from "reka-ui";
import EActions from "../Actions/EActions.vue";
import EIconButton from "../IconButton/EIconButton.vue";
import EDrawerBody from "./EDrawerBody.vue";
import { useMessages, usePortalTarget } from "../../config.js";
import "../../styles/base.css";
import "../Dialog/dialog.css";

defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    /** The panel's heading and accessible name, such as the statement being read. */
    title: string;
    /** The level of the title's heading element, 1 to 6. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    /** The edge it slides in from. */
    side?: "right" | "left";
    /** Shows the drawer in the page, without the backdrop or the focus trap. Only for a preview. */
    inline?: boolean;
  }>(),
  { headingLevel: 2, side: "right" },
);

const emit = defineEmits<{
  /** The person closed it: the Close button, or Escape. `open` is already false. */
  close: [];
}>();

defineSlots<{
  /** The content, such as a statement or receipt. It scrolls inside the drawer. */
  default?(): unknown;
  /** Buttons for the foot bar, the main action first. */
  actions?(): unknown;
}>();

/** Whether the drawer is open. */
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
          class="e-drawer"
          :class="[side === 'left' && 'e-drawer--left', inline && 'e-drawer--inline']"
          :aria-describedby="undefined"
          @interact-outside.prevent
        >
          <header class="e-dialog-head">
            <DialogTitle :as="`h${headingLevel}`" class="e-dialog-title">{{ title }}</DialogTitle>
            <DialogClose as-child>
              <EIconButton icon="x" :label="t('close')" />
            </DialogClose>
          </header>
          <EDrawerBody><slot /></EDrawerBody>
          <EActions v-if="$slots.actions" as="footer" bar class="e-dialog-foot"><slot name="actions" /></EActions>
        </DialogContent>
      </div>
    </DialogPortal>
  </DialogRoot>
</template>

<style>
@layer e.containers {
  .e-drawer {
    position: fixed;
    inset: 0;
    z-index: var(--e-z-modal);
    width: min(28rem, 100vw);
    height: 100dvh;
    max-height: none;
    margin: 0 0 0 auto;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: var(--e-surface);
    color: var(--e-ink);
    box-shadow:
      0 0 0 1px var(--e-border),
      var(--e-float);
    display: flex;
    flex-direction: column;
    font-family: var(--e-font-sans);
  }

  .e-drawer--left {
    margin: 0 auto 0 0;
  }

  .e-drawer[data-state="open"] {
    animation: e-drawer-in 220ms var(--e-easing-out);
  }

  .e-drawer[data-state="closed"] {
    animation: e-drawer-out 220ms var(--e-easing-out) forwards;
  }

  .e-drawer--left[data-state="open"] {
    animation-name: e-drawer-in-left;
  }

  .e-drawer--left[data-state="closed"] {
    animation-name: e-drawer-out-left;
  }

  @keyframes e-drawer-in {
    from {
      transform: translateX(100%);
    }
  }

  @keyframes e-drawer-out {
    to {
      transform: translateX(100%);
    }
  }

  @keyframes e-drawer-in-left {
    from {
      transform: translateX(-100%);
    }
  }

  @keyframes e-drawer-out-left {
    to {
      transform: translateX(-100%);
    }
  }

  .e-drawer-body {
    flex: 1;
    overflow: auto;
    padding: var(--e-space-3) var(--e-space-6) var(--e-space-6);
    font: 400 var(--e-text-md) / 1.5 var(--e-font-sans);
  }

  .e-drawer .e-dialog-foot {
    margin-top: auto;
  }

  .e-drawer--inline,
  .e-drawer--inline[data-state] {
    animation: none;
    transition: none;
    position: static;
    width: 100%;
    max-width: 28rem;
    height: 26rem;
    margin: 0;
    transform: none;
  }

  .e-drawer-body:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: -2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .e-drawer {
      animation: none;
      transition: none;
    }
  }
}
</style>
