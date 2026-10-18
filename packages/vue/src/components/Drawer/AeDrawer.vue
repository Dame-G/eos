<script setup lang="ts">
import { DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from "reka-ui";
import AeActions from "../Actions/AeActions.vue";
import AeIconButton from "../IconButton/AeIconButton.vue";
import AeDrawerBody from "./AeDrawerBody.vue";
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
      <div class="ae-root">
        <DialogOverlay v-if="!inline" class="ae-dialog-overlay" />
        <DialogContent
          v-bind="$attrs"
          class="ae-drawer"
          :class="[side === 'left' && 'ae-drawer--left', inline && 'ae-drawer--inline']"
          :aria-describedby="undefined"
          @interact-outside.prevent
        >
          <header class="ae-dialog-head">
            <DialogTitle :as="`h${headingLevel}`" class="ae-dialog-title">{{ title }}</DialogTitle>
            <DialogClose as-child>
              <AeIconButton icon="x" :label="t('close')" />
            </DialogClose>
          </header>
          <AeDrawerBody><slot /></AeDrawerBody>
          <AeActions v-if="$slots.actions" as="footer" bar class="ae-dialog-foot"><slot name="actions" /></AeActions>
        </DialogContent>
      </div>
    </DialogPortal>
  </DialogRoot>
</template>

<style>
@layer ae.containers {
  .ae-drawer {
    position: fixed;
    inset: 0;
    z-index: var(--ae-z-modal);
    width: min(28rem, 100vw);
    height: 100dvh;
    max-height: none;
    margin: 0 0 0 auto;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: var(--ae-surface);
    color: var(--ae-ink);
    box-shadow:
      0 0 0 1px var(--ae-border),
      var(--ae-float);
    display: flex;
    flex-direction: column;
    font-family: var(--ae-font-sans);
  }

  .ae-drawer--left {
    margin: 0 auto 0 0;
  }

  .ae-drawer[data-state="open"] {
    animation: ae-drawer-in 220ms var(--ae-easing-out);
  }

  .ae-drawer[data-state="closed"] {
    animation: ae-drawer-out 220ms var(--ae-easing-out) forwards;
  }

  .ae-drawer--left[data-state="open"] {
    animation-name: ae-drawer-in-left;
  }

  .ae-drawer--left[data-state="closed"] {
    animation-name: ae-drawer-out-left;
  }

  @keyframes ae-drawer-in {
    from {
      transform: translateX(100%);
    }
  }

  @keyframes ae-drawer-out {
    to {
      transform: translateX(100%);
    }
  }

  @keyframes ae-drawer-in-left {
    from {
      transform: translateX(-100%);
    }
  }

  @keyframes ae-drawer-out-left {
    to {
      transform: translateX(-100%);
    }
  }

  .ae-drawer-body {
    flex: 1;
    overflow: auto;
    padding: var(--ae-space-3) var(--ae-space-6) var(--ae-space-6);
    font: 400 var(--ae-text-md) / 1.5 var(--ae-font-sans);
  }

  .ae-drawer .ae-dialog-foot {
    margin-top: auto;
  }

  .ae-drawer--inline,
  .ae-drawer--inline[data-state] {
    animation: none;
    transition: none;
    position: static;
    width: 100%;
    max-width: 28rem;
    height: 26rem;
    margin: 0;
    transform: none;
  }

  .ae-drawer-body:focus-visible {
    outline: var(--ae-stroke-focus) solid var(--ae-focus-ring);
    outline-offset: -2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .ae-drawer {
      animation: none;
      transition: none;
    }
  }
}
</style>
