<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "reka-ui";
import { computed, useAttrs, watch } from "vue";
import EActions from "../Actions/EActions.vue";
import EIconButton from "../IconButton/EIconButton.vue";
import { useMessages, usePortalTarget } from "../../config.js";
import { useDir } from "../../composables/useDir.js";
import { RekaConfig } from "../../composables/useRekaConfig.js";
import { measureScrollBody } from "../../composables/useScrollBody.js";
import type { DialogFrameProps } from "./frame.js";
import "../../styles/base.css";
import "../Heading/scale.css";
import "./dialog.css";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<
    DialogFrameProps & {
      /** The panel's classes: its kind and size. */
      contentClass?: unknown;
      /** Draws only the content, with the title hidden: the caller brings the whole layout, as the command palette does. */
      bare?: boolean;
    }
  >(),
  { headingLevel: 2, role: "dialog" },
);

const emit = defineEmits<{
  close: [];
}>();

defineSlots<{
  default?(): unknown;
  actions?(): unknown;
}>();

const open = defineModel<boolean>("open");

const t = useMessages();
const target = usePortalTarget();
const dir = useDir();

// The scroll lock reads the page's scrollbar gutter as a modal opens, in case the page's styles changed since.
watch(
  () => !!open.value && !props.inline,
  (locking) => locking && measureScrollBody(),
  { flush: "sync", immediate: true },
);

/** An inline preview is part of the page, so it leaves focus alone: it does not take it when it opens, and does not send it back to wherever it was when it closes. Sending it back could land on a tab or link and activate it. */
function keepFocus(event: Event) {
  if (props.inline) event.preventDefault();
}

/** The first control of the foot that is not a danger button: the answer that undoes nothing. */
function safestAction(content: HTMLElement): HTMLElement | null {
  const buttons = [...content.querySelectorAll<HTMLElement>(".e-dialog-foot button:not(:disabled)")];
  return buttons.find((b) => !b.classList.contains("e-btn--danger")) ?? buttons[0] ?? null;
}

/** Reka focuses the first control, which is the Close button. An alert dialog must not open on a way out, so it picks the answer itself. */
function focusInitial(event: Event) {
  if (props.inline) return event.preventDefault();
  const content = event.target as HTMLElement | null;
  if (!content) return;
  const explicit = props.initialFocus ? content.querySelector<HTMLElement>(props.initialFocus) : null;
  const marked = content.querySelector<HTMLElement>("[data-autofocus]");
  const picked = explicit ?? marked ?? (props.role === "alertdialog" ? safestAction(content) : null);
  if (!picked) return;
  event.preventDefault();
  picked.focus({ preventScroll: true });
}

const attrs = useAttrs();

/** A row footer keeps its buttons side by side at every width. */
const footerStack = computed(() => (props.footer === "row" ? "never" : undefined));

/** Reka points aria-describedby at a description element that may not exist. With no description it is dropped, so the attribute never dangles. A description the consumer wired themselves is kept. */
const describedby = computed(() =>
  props.description || attrs["aria-describedby"] ? {} : { "aria-describedby": undefined },
);

/**
 * A press outside the panel closes a dismissible dialog. A press on a toast is not one: the toasts float over the
 * dialog, and dismissing one must leave the dialog open. An inline preview is part of the page, so nothing outside it
 * (a press, or focus moving on) closes it.
 */
function onInteractOutside(event: CustomEvent<{ originalEvent?: Event }>) {
  const hit = event.detail?.originalEvent?.target ?? event.target;
  const onToast = hit instanceof Element && !!hit.closest(".e-toast-region");
  if (props.inline || !props.dismissible || onToast) event.preventDefault();
}

/** Reka listens for Escape on the whole window. An inline preview is not a layer over the page, so Escape leaves it. */
function onEscape(event: KeyboardEvent) {
  if (props.inline) event.preventDefault();
}

function setOpen(value: boolean) {
  open.value = value;
  if (!value) emit("close");
}
</script>

<template>
  <RekaConfig>
    <DialogRoot :open="!!open" :modal="!inline" :dir="dir" @update:open="setOpen">
      <DialogPortal :to="target" :disabled="inline">
        <div class="e-root">
          <DialogOverlay v-if="!inline" class="e-dialog-overlay" />
          <DialogContent
            :role="role"
            :aria-modal="inline ? undefined : 'true'"
            v-bind="{ ...describedby, ...$attrs }"
            :class="contentClass"
            @interact-outside="onInteractOutside"
            @escape-key-down="onEscape"
            @open-auto-focus="focusInitial"
            @close-auto-focus="keepFocus"
          >
            <template v-if="bare">
              <DialogTitle class="e-sr">{{ title }}</DialogTitle>
              <slot />
            </template>
            <template v-else>
              <header class="e-dialog-head">
                <DialogTitle :as="`h${headingLevel}`" class="e-dialog-title e-h e-h2">{{ title }}</DialogTitle>
                <DialogClose as-child>
                  <EIconButton icon="x" :label="t('close')" />
                </DialogClose>
              </header>
              <DialogDescription v-if="description" class="e-dialog-description">{{ description }}</DialogDescription>
              <slot />
              <EActions v-if="$slots.actions" as="footer" bar :stack="footerStack" class="e-dialog-foot">
                <slot name="actions" />
              </EActions>
            </template>
          </DialogContent>
        </div>
      </DialogPortal>
    </DialogRoot>
  </RekaConfig>
</template>
