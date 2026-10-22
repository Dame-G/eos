<script setup lang="ts">
import { inject, onBeforeUnmount, provide, ref, watch, type FunctionalComponent, type VNodeChild } from "vue";
import { useEventListener } from "@vueuse/core";
import EToast from "../Toast/EToast.vue";
import { useMessages, usePortalTarget } from "../../config.js";
import { createToasts, TOAST_KEY } from "../../composables/useToast.js";
import "../../styles/base.css";

defineSlots<{
  /** The app. Call `useToast()` anywhere inside it. */
  default?(): unknown;
}>();

const t = useMessages();
const target = usePortalTarget();

const provided = inject(TOAST_KEY, null);
const store = provided ?? createToasts();
if (!provided) {
  provide(TOAST_KEY, store);
  onBeforeUnmount(() => store.clear());
}

const region = ref<HTMLElement>();
let hovering = false;
let focused = false;
const settle = () => (hovering || focused ? store.pause() : store.resume());

useEventListener(region, "mouseenter", () => {
  hovering = true;
  settle();
});
useEventListener(region, "mouseleave", () => {
  hovering = false;
  settle();
});
useEventListener(region, "focusin", () => {
  focused = true;
  settle();
});
useEventListener(region, "focusout", (e: FocusEvent) => {
  if (region.value?.contains(e.relatedTarget as Node | null)) return;
  focused = false;
  settle();
});

watch(
  () => store.items.length,
  (n) => {
    if (n) return;
    hovering = false;
    focused = false;
    store.resume();
  },
);

const Render: FunctionalComponent<{ content: VNodeChild | (() => VNodeChild) }> = (p) =>
  typeof p.content === "function" ? p.content() : p.content;
Render.props = ["content"];
</script>

<template>
  <slot />
  <Teleport :to="target">
    <div ref="region" class="e-root e-toast-region" role="region" aria-live="off" :aria-label="t('toastRegion')">
      <EToast
        v-for="item in store.items"
        :key="item.id"
        :tone="item.tone"
        :title="item.title"
        @close="store.dismiss(item.id)"
      >
        <template v-if="item.message" #default>{{ item.message }}</template>
        <template v-if="item.action" #action><Render :content="item.action" /></template>
      </EToast>
    </div>
  </Teleport>
</template>

<style>
@layer e.containers {
  .e-toast-region {
    justify-items: end;
    position: fixed;
    inset-inline-end: max(var(--e-space-4), env(safe-area-inset-right, 0px));
    bottom: max(var(--e-space-4), env(safe-area-inset-bottom, 0px));
    z-index: var(--e-z-toast);

    /* An open modal dialog sets pointer-events: none on the body. The toasts must stay clickable. */
    pointer-events: auto;
    display: grid;
    gap: var(--e-space-2);
  }

  .e-toast-region > .e-toast {
    width: min(24rem, calc(100vw - 2 * var(--e-space-4)));
  }

  .e-toast-region > .e-toast--actions {
    width: min(40rem, calc(100vw - 2 * var(--e-space-4)));
  }

  @media print {
    .e-toast-region {
      display: none;
    }
  }
}
</style>
