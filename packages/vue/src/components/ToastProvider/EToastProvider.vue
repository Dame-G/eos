<script setup lang="ts">
import {
  inject,
  nextTick,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch,
  type FunctionalComponent,
  type VNodeChild,
} from "vue";
import { useEventListener } from "@vueuse/core";
import EToast from "../Toast/EToast.vue";
import { useMessages, usePortalTarget } from "../../config.js";
import { useAnnouncer } from "../../composables/useAnnouncer.js";
import { createToasts, TOAST_KEY, type ToastItem } from "../../composables/useToast.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** How many toasts stay on screen. Showing one more removes the oldest. */
    limit?: number;
  }>(),
  { limit: 5 },
);

defineSlots<{
  /** The app. `useToast()` works anywhere inside it. */
  default?(): unknown;
}>();

const t = useMessages();
const target = usePortalTarget();
const { announce } = useAnnouncer();

const provided = inject(TOAST_KEY, null);
const store = provided ?? createToasts();
if (!provided) {
  provide(TOAST_KEY, store);
  onBeforeUnmount(() => store.clear());
}
watch(
  () => props.limit,
  (n) => (store.limit = n),
  { immediate: true },
);

// The teleport is only rendered once mounted, so the server markup and the first client render agree.
const mounted = ref(false);
onMounted(() => (mounted.value = true));

const region = ref<HTMLElement>();
let hovering = false;
let focused = false;
const away = () => typeof document !== "undefined" && document.hidden;
const settle = () => (hovering || focused || away() ? store.pause() : store.resume());

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
// A toast nobody can see must not run out, or a message sent while the tab was in the background is lost unread.
useEventListener(typeof document === "undefined" ? undefined : document, "visibilitychange", settle);

watch(
  () => store.items.length,
  (n) => {
    if (n) return;
    hovering = false;
    focused = false;
    settle();
  },
);

/*
 * Announcing goes through the shared live regions, which are in the page before anything is said. A live role that
 * arrives in the DOM together with its text is missed by several screen readers, so the toasts carry no role.
 */
const spoken = new Map<string, string>();
const wording = (item: ToastItem) => [item.title, item.message].filter(Boolean).join(". ");
watch(
  () => store.items,
  (items) => {
    const said: Record<"polite" | "assertive", string[]> = { polite: [], assertive: [] };
    const now = new Map<string, string>();
    for (const item of items) {
      const text = wording(item);
      now.set(item.id, text);
      if (spoken.get(item.id) !== text) said[item.tone === "danger" ? "assertive" : "polite"].push(text);
    }
    spoken.clear();
    for (const [id, text] of now) spoken.set(id, text);
    if (said.assertive.length) announce(said.assertive.join(". "), { assertive: true });
    if (said.polite.length) announce(said.polite.join(". "));
  },
  { immediate: true },
);

/*
 * Keyboard: F8 moves focus to the notifications, Tab walks them, Escape dismisses the toast that has focus (or, on the
 * region itself, hands focus back to where it was). A modal dialog traps focus, so under one the toasts are reached by
 * pointer and the announcement.
 */
let before: HTMLElement | null = null;
useEventListener(typeof document === "undefined" ? undefined : document, "keydown", (e: KeyboardEvent) => {
  if (e.key !== "F8" || e.defaultPrevented || !region.value) return;
  e.preventDefault();
  if (!region.value.contains(document.activeElement)) before = document.activeElement as HTMLElement | null;
  region.value.focus();
});

function onKeydown(e: KeyboardEvent) {
  if (e.key !== "Escape") return;
  const toast = (e.target as Element).closest<HTMLElement>("[data-toast-id]");
  e.stopPropagation();
  if (toast) store.dismiss(toast.dataset.toastId!);
  void nextTick(() => {
    const next = region.value?.querySelector<HTMLElement>("button, a[href], [tabindex]");
    if (toast && next) next.focus();
    else {
      before?.focus();
      before = null;
    }
  });
}

const Render: FunctionalComponent<{ content: VNodeChild | (() => VNodeChild) }> = (p) =>
  typeof p.content === "function" ? p.content() : p.content;
Render.props = ["content"];
</script>

<template>
  <slot />
  <Teleport v-if="mounted" :to="target">
    <!-- A region the keyboard can enter (F8) and leave (Escape). -->
    <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
    <section
      v-if="store.items.length"
      ref="region"
      class="e-root e-toast-region"
      tabindex="-1"
      :aria-label="t('toastRegion')"
      @keydown="onKeydown"
    >
      <EToast
        v-for="item in store.items"
        :key="item.id"
        :data-toast-id="item.id"
        :tone="item.tone"
        :title="item.title"
        :icon="item.icon"
        :closable="item.closable ?? true"
        :live="false"
        @close="store.dismiss(item.id)"
      >
        <template v-if="item.message" #default>{{ item.message }}</template>
        <template v-if="item.action" #action><Render :content="item.action" /></template>
      </EToast>
    </section>
  </Teleport>
</template>

<style>
@layer e.containers {
  .e-toast-region {
    justify-items: end;
    position: fixed;
    inset-inline-end: max(var(--e-gap-loose), env(safe-area-inset-right, 0px));
    bottom: max(var(--e-gap-loose), env(safe-area-inset-bottom, 0px));
    z-index: var(--e-z-toast);

    /* An open modal dialog sets pointer-events: none on the body. The toasts must stay clickable. */
    pointer-events: auto;
    display: grid;
    gap: var(--e-gap-snug);
  }

  .e-toast-region:focus {
    outline: none;
  }

  .e-toast-region > .e-toast {
    width: min(24rem, calc(100vw - 2 * var(--e-gap-loose)));
  }

  .e-toast-region > .e-toast--actions {
    width: min(40rem, calc(100vw - 2 * var(--e-gap-loose)));
  }

  @media print {
    .e-toast-region {
      display: none;
    }
  }
}
</style>
