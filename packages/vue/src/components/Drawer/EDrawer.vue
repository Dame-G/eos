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
    side?: "right" | "left" | "bottom";
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
          :class="[side !== 'right' && `e-drawer--${side}`, inline && 'e-drawer--inline']"
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
    box-shadow: var(--e-float);
    display: flex;
    flex-direction: column;
    font-family: var(--e-font-sans);
  }

  .e-drawer--left {
    margin: 0 auto 0 0;
  }

  .e-drawer--bottom {
    inset: auto 0 0;
    width: 100%;
    height: auto;
    max-height: min(32rem, 85dvh);
    margin: 0;
    border-radius: var(--e-radius-lg) var(--e-radius-lg) 0 0;
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

  .e-drawer--inline.e-drawer--bottom {
    max-width: 28rem;
    height: auto;
    max-height: 18rem;
    border-radius: var(--e-radius-lg);
  }

  .e-drawer-body:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: calc(-1 * var(--e-stroke-focus));
  }

  @media (prefers-reduced-motion: reduce) {
    .e-drawer {
      animation: none;
      transition: none;
    }
  }
}
</style>
