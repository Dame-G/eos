<script setup lang="ts">
import { inject, onBeforeUnmount, provide, ref, watch, type FunctionalComponent, type VNodeChild } from "vue";
import { useEventListener } from "@vueuse/core";
import AeToast from "../Toast/AeToast.vue";
import { useMessages, usePortalTarget } from "../../config.js";
import { createToasts, TOAST_KEY } from "../../composables/useToast.js";
import "../../styles/base.css";

defineSlots<{
  /** The app. Call `useToast()` anywhere inside it. */
  default?(): unknown;
}>();

const t = useMessages();
const target = usePortalTarget();

// An app that provided its own store (so toasts can be shown from outside components) keeps it.
const provided = inject(TOAST_KEY, null);
const store = provided ?? createToasts();
if (!provided) {
  provide(TOAST_KEY, store);
  onBeforeUnmount(() => store.clear());
}

// Timers wait while the pointer or keyboard focus is on a toast (WCAG 2.2.1), then run on with the time they had left.
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

// The pointer cannot leave a toast that is gone: forget it when the last one closes.
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
    <div ref="region" class="ae-root ae-toast-region" role="region" :aria-label="t('toastRegion')">
      <AeToast
        v-for="item in store.items"
        :key="item.id"
        :tone="item.tone"
        :title="item.title"
        @close="store.dismiss(item.id)"
      >
        <template v-if="item.message" #default>{{ item.message }}</template>
        <template v-if="item.action" #action><Render :content="item.action" /></template>
      </AeToast>
    </div>
  </Teleport>
</template>

<style>
@layer ae.containers {
  .ae-toast-region {
    justify-items: end;
    position: fixed;
    inset-inline-end: max(16px, env(safe-area-inset-right, 0px));
    bottom: max(16px, env(safe-area-inset-bottom, 0px));
    z-index: var(--ae-z-toast);
    display: grid;
    gap: var(--ae-space-2);
  }

  /* The region shrinks to its content and a toast is size-contained, so a percentage width would collapse to nothing. */
  .ae-toast-region > .ae-toast {
    width: min(24rem, calc(100vw - 32px));
  }

  .ae-toast-region > .ae-toast--actions {
    width: min(40rem, calc(100vw - 32px));
  }

  @media print {
    .ae-toast-region {
      display: none;
    }
  }
}
</style>
