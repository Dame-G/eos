<script setup lang="ts">
import EActions from "../Actions/EActions.vue";
import EIcon from "../Icon/EIcon.vue";
import EIconButton from "../IconButton/EIconButton.vue";
import ESurface from "../Surface/ESurface.vue";
import { useConfig, useMessages } from "../../config.js";
import type { IconProp } from "../../icons/types.js";
import "../../styles/base.css";
import "../Notice/notice.css";

withDefaults(
  defineProps<{
    /** What happened, in a few words. */
    title: string;
    /** `danger` is announced at once and the other tones politely. */
    tone?: "info" | "success" | "warning" | "danger";
    /** Replaces the icon of the tone. */
    icon?: IconProp;
    /** Shows the dismiss button. */
    closable?: boolean;
    /** Announces the toast to screen readers as it appears (`alert` for `danger`, `status` for the rest). Turn it off when the host announces it, as `EToastProvider` does. */
    live?: boolean;
  }>(),
  { tone: "info", closable: true, live: true },
);

const emit = defineEmits<{
  /** The dismiss button was pressed. The button only shows when `closable`. */
  close: [];
}>();

defineSlots<{
  /** One sentence of detail under the title. */
  default?(): unknown;
  /** A Button. At the end of the row when the toast is 36rem wide or more, under the text when narrower. */
  action?(): unknown;
}>();

const t = useMessages();
const config = useConfig();
/** Toasts and notices share the `dismiss` message. A `closeToast` set before that still names the toast's button. */
const dismissLabel = () => (config.messages.closeToast as string | undefined) ?? t("dismiss");
const TONE_ICON = { info: "info", success: "check", warning: "alert", danger: "alert" } as const;
</script>

<template>
  <ESurface
    raised
    flush
    class="e-toast"
    :class="[`e-toast--${tone}`, $slots.action && 'e-toast--actions']"
    :role="live ? (tone === 'danger' ? 'alert' : 'status') : undefined"
  >
    <div class="e-notice-grid">
      <span class="e-notice-icon"><EIcon :name="icon ?? TONE_ICON[tone]" /></span>
      <div class="e-notice-body e-toast-body">
        <p class="e-toast-title">{{ title }}</p>
        <p v-if="$slots.default" class="e-toast-text"><slot /></p>
      </div>
      <EActions v-if="$slots.action" class="e-notice-actions"><slot name="action" /></EActions>
      <span v-if="closable" class="e-notice-dismiss">
        <EIconButton icon="x" :label="dismissLabel()" @click="emit('close')" />
      </span>
    </div>
  </ESurface>
</template>

<style>
@layer e.containers {
  /* The slab on the tone's side: the inline-start border, `slab-bold` thick, in the colour of the tone's edge. It flips in a right-to-left page. */
  .e-toast {
    --e-tone: var(--e-info);

    position: relative;
    container-type: inline-size;
    width: min(24rem, 100%);
    padding: var(--e-gap-base) var(--e-pad-card);
    border-inline-start: var(--e-slab-bold) solid var(--e-tone);
  }

  .e-toast--actions {
    width: min(40rem, 100%);
  }

  .e-toast--success {
    --e-tone: var(--e-success);
  }

  .e-toast--warning {
    --e-tone: var(--e-warning);
  }

  .e-toast--danger {
    --e-tone: var(--e-danger);
  }

  .e-toast-title {
    margin: 0;
    font: var(--e-weight-medium) var(--e-text-lg) / calc(4 / 3) var(--e-font-sans);
  }

  .e-toast-text {
    margin: 0;
    font: var(--e-weight-regular) var(--e-text-sm) / 1.45 var(--e-font-sans);
    color: var(--e-muted);
  }

  @media (forced-colors: active) {
    .e-toast {
      border: var(--e-stroke-card) solid CanvasText;
      border-inline-start-width: var(--e-slab-bold);
    }
  }
}
</style>
