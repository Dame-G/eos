<script setup lang="ts">
import { getCurrentInstance } from "vue";
import EActions from "../Actions/EActions.vue";
import EIcon from "../Icon/EIcon.vue";
import EIconButton from "../IconButton/EIconButton.vue";
import ESurface from "../Surface/ESurface.vue";
import { useMessages } from "../../config.js";
import type { IconProp } from "../../icons/types.js";
import "../../styles/base.css";
import "../Notice/notice.css";

const props = withDefaults(
  defineProps<{
    /** What happened, in a few words. */
    title: string;
    /** `danger` is announced at once and the other tones politely. */
    tone?: "info" | "success" | "warning" | "danger";
    /** Replaces the icon of the tone. */
    icon?: IconProp;
    /** Forces the dismiss button on or off. Left out, it shows when a `@close` listener is attached. */
    closable?: boolean;
  }>(),
  { tone: "info", closable: undefined },
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
const instance = getCurrentInstance();
const TONE_ICON = { info: "info", success: "check", warning: "alert", danger: "alert" } as const;
const hasClose = () => props.closable ?? !!instance?.vnode.props?.onClose;
</script>

<template>
  <ESurface
    raised
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
      <span v-if="hasClose()" class="e-notice-dismiss">
        <EIconButton icon="x" :label="t('dismiss')" @click="emit('close')" />
      </span>
    </div>
  </ESurface>
</template>

<style>
@layer e.containers {
  .e-toast {
    --e-tone: var(--e-primary);

    container-type: inline-size;
    width: min(24rem, 100%);
    padding: var(--e-space-3) var(--e-space-4);
  }

  .e-toast--actions {
    width: min(40rem, 100%);
  }

  .e-toast--success {
    --e-tone: var(--e-secondary);
  }

  .e-toast--warning {
    --e-tone: var(--e-warning-strong);
  }

  .e-toast--danger {
    --e-tone: var(--e-danger);
  }

  .e-toast-title {
    margin: 0;
    font: 500 var(--e-text-lg) / 24px var(--e-font-sans);
  }

  .e-toast-text {
    margin: 0;
    font: 400 var(--e-text-sm) / 1.45 var(--e-font-sans);
    color: var(--e-muted);
  }

  @media (forced-colors: active) {
    .e-toast {
      border: var(--e-stroke-card) solid CanvasText;
    }
  }
}
</style>
