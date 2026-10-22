<script lang="ts">
export type NoticeTone = "info" | "success" | "warning" | "danger";
</script>

<script setup lang="ts">
import { computed, getCurrentInstance } from "vue";
import EActions from "../Actions/EActions.vue";
import EIcon from "../Icon/EIcon.vue";
import EIconButton from "../IconButton/EIconButton.vue";
import { useMessages } from "../../config.js";
import type { IconProp } from "../../icons/types.js";
import "../../styles/base.css";
import "./notice.css";

const props = withDefaults(
  defineProps<{
    /** `info` informs, `success` confirms, `warning` needs attention and `danger` is an error announced at once. */
    tone?: NoticeTone;
    /** What happened, in one short line. */
    title: string;
    /** Renders the title as a heading of this level (1 to 6) so the notice is findable by heading. Without it the title is a paragraph. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    /** The id of the title element, for a parent that labels itself by it. */
    titleId?: string;
    /** The ARIA role. `danger` uses `alert`, the others `status`. `false` removes it, for a parent that announces the notice. */
    role?: string | false;
    /** Replaces the icon of the tone. */
    icon?: IconProp;
    /** Forces the close button on or off. Left out, it shows when a `@close` listener is attached. */
    closable?: boolean;
  }>(),
  { tone: "info", role: undefined, closable: undefined },
);

const emit = defineEmits<{
  /** The close button was pressed. The button only shows when a listener is attached. */
  close: [];
}>();

defineSlots<{
  /** One sentence of detail under the title. */
  default?(): unknown;
  /** Buttons for the next step, best as `outline` or `quiet`. They sit at the end of the row when the notice is 36rem wide or more and under the text when narrower. */
  actions?(): unknown;
}>();

const t = useMessages();
const instance = getCurrentInstance();
const TONE_ICON: Record<NoticeTone, string> = { info: "info", success: "check", warning: "alert", danger: "alert" };
const role = computed(() =>
  props.role === false ? undefined : props.role || (props.tone === "danger" ? "alert" : "status"),
);
const hasClose = () => props.closable ?? !!instance?.vnode.props?.onClose;
</script>

<template>
  <div
    class="e-notice"
    :class="[tone !== 'info' && `e-notice--${tone}`, $slots.actions && 'e-notice--actions']"
    :role="role"
  >
    <div class="e-notice-grid">
      <span class="e-notice-icon"><EIcon :name="icon ?? TONE_ICON[tone]" /></span>
      <div class="e-notice-body">
        <component :is="headingLevel ? `h${headingLevel}` : 'p'" :id="titleId" class="e-notice-title">
          {{ title }}
        </component>
        <div v-if="$slots.default" class="e-notice-text"><slot /></div>
      </div>
      <EActions v-if="$slots.actions" class="e-notice-actions"><slot name="actions" /></EActions>
      <span v-if="hasClose()" class="e-notice-close">
        <EIconButton icon="x" :label="t('dismiss')" @click="emit('close')" />
      </span>
    </div>
  </div>
</template>

<style>
@layer e.containers {
  .e-notice {
    --e-tone: var(--e-primary);
    --e-bg: var(--e-surface-tint);

    container-type: inline-size;
    padding: calc(var(--e-space-3) - var(--e-stroke-edge)) calc(var(--e-space-4) - var(--e-stroke-edge));
    padding-left: calc(var(--e-space-4) - var(--e-stroke-edge) + 2 * var(--e-depth));
    border: var(--e-stroke-edge) solid var(--e-tone);
    border-radius: var(--e-radius-md);
    background-color: var(--e-bg);
    background-image: linear-gradient(to right, var(--e-tone) calc(2 * var(--e-depth)), transparent calc(2 * var(--e-depth)));
    background-repeat: no-repeat;
    background-clip: padding-box;
    color: var(--e-ink);
  }

  .e-notice--success {
    --e-tone: var(--e-secondary);
    --e-bg: var(--e-secondary-soft);
  }

  .e-notice--warning {
    --e-tone: var(--e-warning-strong);
    --e-bg: var(--e-warning-soft);
  }

  .e-notice--danger {
    --e-tone: var(--e-danger);
    --e-bg: var(--e-danger-soft);
  }

  .e-notice-title {
    margin: 0;
    font: 500 var(--e-text-lg) / 24px var(--e-font-sans);
  }

  .e-notice-text {
    margin: 0;
    font: 400 var(--e-text-sm) / 1.45 var(--e-font-sans);
    color: var(--e-ink);
  }

  @media (forced-colors: active) {
    .e-notice {
      border: var(--e-stroke-edge) solid CanvasText;
    }
  }
}
</style>
