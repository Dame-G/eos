<script setup lang="ts">
import { getCurrentInstance } from "vue";
import AeActions from "../Actions/AeActions.vue";
import AeIcon from "../Icon/AeIcon.vue";
import AeIconButton from "../IconButton/AeIconButton.vue";
import AeSurface from "../Surface/AeSurface.vue";
import { useMessages } from "../../config.js";
import type { IconName } from "../../icons/phosphor.js";
import "../../styles/base.css";
import "../Notice/notice.css";

withDefaults(
  defineProps<{
    /** What happened, in a few words. */
    title: string;
    /** `info` is the default. `danger` is announced at once. */
    tone?: "info" | "success" | "warning" | "danger";
    /** Replaces the icon of the tone. */
    icon?: IconName | (string & {});
  }>(),
  { tone: "info" },
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
const hasClose = () => !!instance?.vnode.props?.onClose;
</script>

<template>
  <AeSurface
    tone="float"
    class="ae-toast"
    :class="[`ae-toast--${tone}`, $slots.action && 'ae-toast--actions']"
    :role="tone === 'danger' ? 'alert' : 'status'"
  >
    <div class="ae-notice-grid">
      <span class="ae-notice-icon"><AeIcon :name="icon ?? TONE_ICON[tone]" /></span>
      <div class="ae-notice-body ae-toast-body">
        <p class="ae-toast-title">{{ title }}</p>
        <p v-if="$slots.default" class="ae-toast-text"><slot /></p>
      </div>
      <AeActions v-if="$slots.action" class="ae-notice-actions"><slot name="action" /></AeActions>
      <span v-if="hasClose()" class="ae-notice-dismiss">
        <AeIconButton icon="x" :label="t('dismiss')" @click="emit('close')" />
      </span>
    </div>
  </AeSurface>
</template>

<style>
@layer ae.containers {
  .ae-toast {
    --ae-tone: var(--ae-primary);

    container-type: inline-size;
    width: min(24rem, 100%);
    padding: var(--ae-space-3) var(--ae-space-4);
  }

  .ae-toast--actions {
    width: min(40rem, 100%);
  }

  .ae-toast--success {
    --ae-tone: var(--ae-secondary);
  }

  .ae-toast--warning {
    --ae-tone: var(--ae-warning-strong);
  }

  .ae-toast--danger {
    --ae-tone: var(--ae-danger);
  }

  .ae-toast-title {
    margin: 0;
    font: 500 var(--ae-text-lg) / 24px var(--ae-font-sans);
  }

  .ae-toast-text {
    margin: 0;
    font: 400 var(--ae-text-sm) / 1.45 var(--ae-font-sans);
    color: var(--ae-muted);
  }

  @media (forced-colors: active) {
    .ae-toast {
      border: 1px solid CanvasText;
    }
  }
}
</style>
