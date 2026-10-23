<script setup lang="ts">
import EActions from "../Actions/EActions.vue";
import EIcon from "../Icon/EIcon.vue";
import EIconButton from "../IconButton/EIconButton.vue";
import ESurface from "../Surface/ESurface.vue";
import { useMessages } from "../../config.js";
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
  }>(),
  { tone: "info", closable: true },
);

const emit = defineEmits<{
  /** The dismiss button was pressed. The button only shows when a listener is attached. */
  close: [];
}>();

defineSlots<{
  /** One sentence of detail under the title. */
  default?(): unknown;
  /** A Button. At the end of the row when the toast is 36rem wide or more, under the text when narrower. */
  action?(): unknown;
}>();

const t = useMessages();
const TONE_ICON = { info: "info", success: "check", warning: "alert", danger: "alert" } as const;
</script>

<template>
  <ESurface
    raised
    flush
    class="e-toast"
    :class="[`e-toast--${tone}`, $slots.action && 'e-toast--actions']"
    :role="tone === 'danger' ? 'alert' : 'status'"
  >
    <div class="e-notice-grid">
      <span class="e-notice-icon"><EIcon :name="icon ?? TONE_ICON[tone]" /></span>
      <div class="e-notice-body e-toast-body">
        <p class="e-toast-title">{{ title }}</p>
        <p v-if="$slots.default" class="e-toast-text"><slot /></p>
      </div>
      <EActions v-if="$slots.action" class="e-notice-actions"><slot name="action" /></EActions>
      <span v-if="closable" class="e-notice-dismiss">
        <EIconButton icon="x" :label="t('dismiss')" @click="emit('close')" />
      </span>
    </div>
  </ESurface>
</template>

<style>
@layer e.containers {
  .e-toast {
    --e-tone: var(--e-info);

    position: relative;
    container-type: inline-size;
    width: min(24rem, 100%);
    padding: var(--e-space-3) var(--e-space-4);
    padding-inline-start: calc(var(--e-space-4) + var(--e-space-1));
  }

  /* The slab on the tone's side: a solid edge in the colour of the tone, as on a Notice. */
  .e-toast::before {
    content: "";
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    inline-size: var(--e-space-1);
    border-start-start-radius: inherit;
    border-end-start-radius: inherit;
    background: var(--e-tone);
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
    }

    .e-toast::before {
      forced-color-adjust: none;
      background: CanvasText;
    }
  }
}
</style>
