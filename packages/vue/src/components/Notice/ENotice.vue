<script lang="ts">
export type NoticeTone = "neutral" | "info" | "success" | "warning" | "danger";
</script>

<script setup lang="ts">
import { computed } from "vue";
import EActions from "../Actions/EActions.vue";
import EIcon from "../Icon/EIcon.vue";
import EIconButton from "../IconButton/EIconButton.vue";
import { useMessages } from "../../config.js";
import type { IconProp } from "../../icons/types.js";
import "../../styles/base.css";
import "../Heading/scale.css";
import "./notice.css";

const props = withDefaults(
  defineProps<{
    /** `neutral` is plain information with no colour, `info` informs, `success` confirms, `warning` needs attention and `danger` is an error announced at once. */
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
    /** Shows the close button. Handle `@close` to remove the notice. */
    closable?: boolean;
  }>(),
  { tone: "info", role: undefined },
);

const emit = defineEmits<{
  /** The close button was pressed. */
  close: [];
}>();

defineSlots<{
  /** One sentence of detail under the title. */
  default?(): unknown;
  /** Buttons for the next step, best as `outline` or `quiet`. They sit at the end of the row when the notice is 36rem wide or more and under the text when narrower. */
  actions?(): unknown;
}>();

const t = useMessages();
const TONE_ICON: Record<NoticeTone, string> = {
  neutral: "info",
  info: "info",
  success: "check",
  warning: "alert",
  danger: "alert",
};
const role = computed(() =>
  props.role === false ? undefined : props.role || (props.tone === "danger" ? "alert" : "status"),
);
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
        <component :is="headingLevel ? `h${headingLevel}` : 'p'" :id="titleId" class="e-notice-title e-h e-h4">
          {{ title }}
        </component>
        <div v-if="$slots.default" class="e-notice-text"><slot /></div>
      </div>
      <EActions v-if="$slots.actions" class="e-notice-actions"><slot name="actions" /></EActions>
      <span v-if="closable" class="e-notice-dismiss">
        <EIconButton icon="x" :label="t('dismiss')" @click="emit('close')" />
      </span>
    </div>
  </div>
</template>

<style>
@layer e.containers {
  .e-notice {
    --e-tone: var(--e-info);
    --_bg: var(--e-info-soft);

    container-type: inline-size;
    padding-block: calc(var(--e-gap-base) - var(--e-stroke-edge));
    padding-inline: calc(var(--e-pad-card) - var(--e-stroke-edge));
    border: var(--e-stroke-edge) solid var(--e-tone);
    border-inline-start-width: calc(var(--e-stroke-edge) + var(--e-slab-bold));
    border-radius: var(--e-radius-md);
    background-color: var(--_bg);
    background-clip: padding-box;
    color: var(--e-ink);
  }

  /* The slab sits on the tone's side: the inline-start border is thicker by `slab-bold`, so it flips in a right-to-left page. */
  .e-notice--neutral {
    --e-tone: var(--e-muted);
    --_bg: var(--e-surface-tint);
  }

  .e-notice--success {
    --e-tone: var(--e-success);
    --_bg: var(--e-success-soft);
  }

  .e-notice--warning {
    --e-tone: var(--e-warning);
    --_bg: var(--e-warning-soft);
  }

  .e-notice--danger {
    --e-tone: var(--e-danger);
    --_bg: var(--e-danger-soft);
  }

  /* The title's style comes from the type scale (`e-h e-h4`). */
  .e-notice-text {
    margin: 0;
    font: var(--e-type-small);
    color: var(--e-ink);
  }

  @media (forced-colors: active) {
    .e-notice {
      border: var(--e-stroke-edge) solid CanvasText;
    }
  }
}
</style>
