<script lang="ts">
export type NoticeTone = "info" | "success" | "warning" | "danger";
</script>

<script setup lang="ts">
import { computed, getCurrentInstance } from "vue";
import AeActions from "../Actions/AeActions.vue";
import AeIcon from "../Icon/AeIcon.vue";
import AeIconButton from "../IconButton/AeIconButton.vue";
import { useMessages } from "../../config.js";
import type { IconName } from "../../icons/phosphor.js";
import "../../styles/base.css";
import "./notice.css";

const props = withDefaults(
  defineProps<{
    /** `info` is the default; `success` confirms; `warning` needs attention; `danger` is an error and is announced at once. */
    tone?: NoticeTone;
    /** What happened, in one short line. */
    title: string;
    /** Renders the title as a heading of this level (1 to 6) so the notice is findable by heading. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    /** The id of the title element, for a parent that labels itself by it. */
    titleId?: string;
    /** The ARIA role. `danger` uses `alert`, the others `status`. `false` removes it, for a parent that announces the notice. */
    role?: string | false;
    /** Replaces the icon of the tone. */
    icon?: IconName | (string & {});
  }>(),
  { tone: "info", role: undefined },
);

const emit = defineEmits<{
  /** The dismiss button was pressed. The button only shows when a listener is attached. */
  dismiss: [];
}>();

defineSlots<{
  /** One sentence of detail under the title. */
  default?(): unknown;
  /** Buttons for the next step; `outline` and `quiet` suit best. At the end of the row when the notice is 36rem wide or more, under the text when narrower. */
  actions?(): unknown;
}>();

const t = useMessages();
const instance = getCurrentInstance();
const TONE_ICON: Record<NoticeTone, string> = { info: "info", success: "check", warning: "alert", danger: "alert" };
const role = computed(() =>
  props.role === false ? undefined : props.role || (props.tone === "danger" ? "alert" : "status"),
);
const hasDismiss = () => !!instance?.vnode.props?.onDismiss;
</script>

<template>
  <div
    class="ae-notice"
    :class="[tone !== 'info' && `ae-notice--${tone}`, $slots.actions && 'ae-notice--actions']"
    :role="role"
  >
    <div class="ae-notice-grid">
      <span class="ae-notice-icon"><AeIcon :name="icon ?? TONE_ICON[tone]" /></span>
      <div class="ae-notice-body">
        <component :is="headingLevel ? `h${headingLevel}` : 'p'" :id="titleId" class="ae-notice-title">
          {{ title }}
        </component>
        <div v-if="$slots.default" class="ae-notice-text"><slot /></div>
      </div>
      <AeActions v-if="$slots.actions" class="ae-notice-actions"><slot name="actions" /></AeActions>
      <span v-if="hasDismiss()" class="ae-notice-dismiss">
        <AeIconButton icon="x" :label="t('dismiss')" @click="emit('dismiss')" />
      </span>
    </div>
  </div>
</template>

<style>
@layer ae.containers {
  .ae-notice {
    --ae-tone: var(--ae-primary);
    --ae-bg: var(--ae-surface-tint);

    container-type: inline-size;
    padding: var(--ae-space-3) var(--ae-space-4);
    border-radius: var(--ae-radius-md);
    background: var(--ae-bg);
    color: var(--ae-ink);
    box-shadow: inset 0 0 0 1.5px var(--ae-tone);
  }

  .ae-notice--success {
    --ae-tone: var(--ae-secondary);
    --ae-bg: var(--ae-secondary-soft);
  }

  .ae-notice--warning {
    --ae-tone: var(--ae-warning-strong);
    --ae-bg: var(--ae-warning-soft);
  }

  .ae-notice--danger {
    --ae-tone: var(--ae-danger);
    --ae-bg: var(--ae-danger-soft);
  }

  .ae-notice-title {
    margin: 0;
    font: 500 var(--ae-text-lg) / 24px var(--ae-font-sans);
  }

  .ae-notice-text {
    margin: 0;
    font: 400 var(--ae-text-sm) / 1.45 var(--ae-font-sans);
    color: var(--ae-ink);
  }

  @media (forced-colors: active) {
    .ae-notice {
      border: 1px solid CanvasText;
    }
  }
}
</style>
