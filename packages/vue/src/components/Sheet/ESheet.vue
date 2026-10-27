<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { FocusScope } from "reka-ui";
import EActions from "../Actions/EActions.vue";
import EIconButton from "../IconButton/EIconButton.vue";
import DialogBody from "../Dialog/DialogBody.vue";
import { useMessages } from "../../config.js";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";
import "../Heading/scale.css";
import "../Dialog/dialog.css";

const props = withDefaults(
  defineProps<{
    /** The heading and the accessible name: the thing the sheet shows, such as a profile or the settings. */
    title: string;
    /** A sentence under the title that says what it is for. It is shown, and read out as the description. */
    description?: string;
    /** The level of the title's heading element, 1 to 6. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    /** The edge it docks to. `end` is the right in a left-to-right page and `start` the left; both flip in a right-to-left page. */
    side?: "end" | "start";
    /** The width: `sm` (28rem), `md` (32rem) or `lg` (36rem), never wider than what it docks over. */
    size?: "sm" | "md" | "lg";
    /** Docks it over the window instead of its nearest positioned container. */
    viewport?: boolean;
    /** A width such as `48rem`: below it the sheet covers the whole window and is modal, so focus stays inside until it closes. Without it the sheet is never modal. */
    modalBelow?: string;
  }>(),
  { headingLevel: 2, side: "end", size: "sm" },
);

const emit = defineEmits<{
  /** Fires when the person closes it with the Close button or Escape. `open` is already false. */
  close: [];
}>();

defineSlots<{
  /** The content. It scrolls inside the sheet. */
  default?(): unknown;
  /** Before the title, such as a Back button. */
  leading?(): unknown;
  /** Buttons for the foot bar, with the main action first. */
  actions?(): unknown;
}>();

/** Whether it is open. Without a binding it keeps its own state. */
const open = defineModel<boolean>("open");

const t = useMessages();
const uid = useUid();
const root = ref<{ $el: HTMLElement } | null>(null);
const heading = ref<HTMLElement | null>(null);
const sheet = () => root.value?.$el ?? null;

/* Below `modalBelow` the sheet is a full-window modal: a window query, since it covers the window, not its container. */
const narrow = ref(false);
let query: MediaQueryList | undefined;
const sync = () => (narrow.value = !!query?.matches);
function listen(width: string | undefined) {
  query?.removeEventListener("change", sync);
  query = width && typeof matchMedia !== "undefined" ? matchMedia(`(width < ${width})`) : undefined;
  query?.addEventListener("change", sync);
  sync();
}
onMounted(() => listen(props.modalBelow));
watch(
  () => props.modalBelow,
  (w) => listen(w),
);
const modal = computed(() => !!props.modalBelow && narrow.value);

/*
 * Focus. Opening moves it to the heading, so a screen reader starts at the sheet's name and Tab goes on into it. Closing
 * gives it back to the control that opened the sheet, but only when it was still inside the sheet (or nowhere): a
 * sheet that is not modal must not pull focus back from the page the person has moved on to.
 */
let opener: HTMLElement | null = null;
function giveBack() {
  const el = sheet();
  const active = document.activeElement;
  const inside = !active || active === document.body || (!!el && el.contains(active));
  const to = opener;
  opener = null;
  if (inside && to?.isConnected) void nextTick(() => to.focus({ preventScroll: true }));
}
watch(
  () => !!open.value,
  async (isOpen, was) => {
    if (typeof document === "undefined") return;
    if (isOpen && !was) {
      opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      await nextTick();
      heading.value?.focus({ preventScroll: true });
    } else if (!isOpen && was) giveBack();
  },
  { immediate: true },
);
onBeforeUnmount(() => {
  if (open.value) giveBack();
});

function close() {
  open.value = false;
  emit("close");
}

/**
 * Escape closes the sheet from anywhere on the page, as the sheet is not modal and the person may be working beside
 * it. A layer that is open over it (a menu, a popover, a dialog) takes Escape first.
 */
function onKey(event: KeyboardEvent) {
  if (event.key !== "Escape" || event.defaultPrevented || !open.value) return;
  const el = sheet();
  const layer = [...document.querySelectorAll("[data-dismissable-layer], [aria-modal='true']")].some(
    (l) => l !== el && !l.contains(el),
  );
  if (layer) return;
  event.preventDefault();
  close();
}
onMounted(() => document.addEventListener("keydown", onKey));
onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKey);
  query?.removeEventListener("change", sync);
});
</script>

<template>
  <FocusScope
    v-if="open"
    ref="root"
    as="section"
    role="dialog"
    :aria-modal="modal ? 'true' : undefined"
    :aria-labelledby="`${uid}-title`"
    :aria-describedby="description ? `${uid}-desc` : undefined"
    :trapped="modal"
    :loop="modal"
    class="e-sheet"
    :class="[
      `e-sheet--${size}`,
      side === 'start' && 'e-sheet--start',
      viewport && 'e-sheet--viewport',
      modal && 'e-sheet--modal',
    ]"
    @mount-auto-focus.prevent
    @unmount-auto-focus.prevent
  >
    <header class="e-dialog-head">
      <slot name="leading" />
      <component
        :is="`h${headingLevel}`"
        :id="`${uid}-title`"
        ref="heading"
        class="e-sheet-title e-h e-h3"
        tabindex="-1"
      >
        {{ title }}
      </component>
      <EIconButton icon="x" :label="t('close')" @click="close" />
    </header>
    <p v-if="description" :id="`${uid}-desc`" class="e-dialog-description">{{ description }}</p>
    <DialogBody class="e-sheet-body"><slot /></DialogBody>
    <EActions v-if="$slots.actions" as="footer" bar class="e-dialog-foot"><slot name="actions" /></EActions>
  </FocusScope>
</template>

<style>
@layer e.containers {
  /* A panel that floats over one side of its positioned container (or the window), beside the content, which stays usable. `--_slide` is 1 in a left-to-right page and -1 in a right-to-left one, so the side and the slide both flip. */
  .e-sheet {
    --_slide: 1;
    --_w: var(--e-panel-width-sm);

    position: absolute;
    inset-block: 0;
    inset-inline: auto 0;
    z-index: var(--e-z-header);
    display: flex;
    flex-direction: column;
    gap: var(--e-gap-base);
    width: min(var(--_w), 100%);
    overflow: hidden;
    background: var(--e-surface);
    color: var(--e-ink);
    box-shadow: var(--e-shadow-float);
    font-family: var(--e-font-sans);
    animation: e-sheet-in var(--e-duration-move) var(--e-easing-enter);
  }

  .e-sheet:dir(rtl) {
    --_slide: -1;
  }

  .e-sheet--md {
    --_w: var(--e-panel-width-md);
  }

  .e-sheet--lg {
    --_w: var(--e-panel-width-lg);
  }

  .e-sheet--start {
    inset-inline: 0 auto;
    animation-name: e-sheet-in-start;
  }

  .e-sheet--viewport {
    position: fixed;
    width: min(var(--_w), 100vw);
  }

  /* Below `modalBelow`: the whole window, over everything the page raises. */
  .e-sheet--modal {
    position: fixed;
    inset: 0;
    z-index: var(--e-z-modal);
    width: auto;
    animation-name: e-sheet-in-full;
  }

  /* The title takes the room between what leads the head and the Close button. Focus lands on it when the sheet opens, where it shows a ring only for the keyboard. */
  .e-sheet-title {
    flex: 1;
    min-width: 0;
    border-radius: var(--e-radius-sm);
  }

  .e-sheet-title:focus {
    outline: none;
  }

  .e-sheet-title:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-stroke-focus);
  }

  @keyframes e-sheet-in {
    from {
      transform: translateX(calc(100% * var(--_slide)));
    }
  }

  @keyframes e-sheet-in-start {
    from {
      transform: translateX(calc(-100% * var(--_slide)));
    }
  }

  @keyframes e-sheet-in-full {
    from {
      opacity: 0;
    }
  }

  @media (forced-colors: active) {
    /* The float is a shadow, which forced colours drop, so the sheet draws its edge as an outline. */
    .e-sheet {
      outline: var(--e-stroke-edge) solid CanvasText;
    }
  }

  @media print {
    .e-sheet {
      box-shadow: none;
    }
  }
}
</style>
