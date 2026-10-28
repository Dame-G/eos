<script setup lang="ts">
import { computed } from "vue";
import EActions from "../Actions/EActions.vue";
import EButton from "../Button/EButton.vue";
import EIcon from "../Icon/EIcon.vue";
import EIconButton from "../IconButton/EIconButton.vue";
import { useMessages } from "../../config.js";
import type { IconProp } from "../../icons/types.js";
import { roleFor, TONE_ICON, type NoticeRole, type NoticeTone } from "./tone.js";
import "../../styles/base.css";
import "../Heading/scale.css";
import "./notice.css";

const props = withDefaults(
  defineProps<{
    /** `neutral` is plain information with no colour, `info` informs, `success` confirms, `warning` needs attention and `danger` is an error. */
    tone?: NoticeTone;
    /** What happened, in one short line. */
    title: string;
    /** Renders the title as a heading of this level (1 to 6) so the notice is findable by heading. Without it the title is a paragraph. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    /** The id of the title element, for a parent that labels itself by it. */
    titleId?: string;
    /** The live role, which announces a change of the notice's words: `alert` at once, `status` politely. `false` removes it, for a parent that announces the notice. @default "alert" for danger, else "status" */
    role?: NoticeRole;
    /** Replaces the icon of the tone. */
    icon?: IconProp;
    /** Shows the close button. Handle `@close` to remove the notice. */
    closable?: boolean;
    /** Shows a retry button in the actions, for a failure that can be tried again. Handle `@retry`. It comes after anything in the `actions` slot. */
    retry?: boolean;
    /** The retry button's label. @default "Try again" */
    retryLabel?: string;
    /** Marks the retry button busy while the retry runs: it shows a spinner and ignores presses. */
    retrying?: boolean;
  }>(),
  { tone: "info", role: undefined },
);

const emit = defineEmits<{
  /** The close button was pressed. */
  close: [];
  /** The retry button was pressed (`retry`). */
  retry: [];
}>();

defineSlots<{
  /** One sentence of detail under the title. */
  default?(): unknown;
  /** Buttons for the next step, best as `outline` or `quiet`. They sit at the end of the row when the notice is 36rem wide or more and under the text when narrower. */
  actions?(): unknown;
}>();

const t = useMessages();
const role = computed(() => roleFor(props.role, props.tone));
</script>

<template>
  <div
    class="e-notice"
    :class="[tone !== 'info' && `e-notice--${tone}`, ($slots.actions || retry) && 'e-notice--actions']"
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
      <EActions v-if="$slots.actions || retry" class="e-notice-actions">
        <slot name="actions" />
        <EButton v-if="retry" variant="outline" size="sm" icon="refresh" :loading="retrying" @click="emit('retry')">
          {{ retryLabel ?? t("retry") }}
        </EButton>
      </EActions>
      <span v-if="closable" class="e-notice-dismiss">
        <EIconButton icon="x" :label="t('dismiss')" @click="emit('close')" />
      </span>
    </div>
  </div>
</template>

<style>
@layer e.containers {
  /* Full width, closed on every side, with the slab on the inline-start edge and the theme's corner radius. The tone's colours come from notice.css. */
  .e-notice {
    container-type: inline-size;
    padding-block: calc(var(--e-gap-base) - var(--e-stroke-edge));
    padding-inline: calc(var(--e-pad-card) - var(--e-stroke-edge));
    border: var(--e-stroke-edge) solid var(--_tone);
    border-inline-start-width: calc(var(--e-stroke-edge) + var(--e-depth-bold));

    /* The start corners are as much wider than tall as the tone edge is thick, so the face inside them stays round. */
    border-radius: var(--e-radius-md);
    border-start-start-radius: calc(var(--e-radius-md) + var(--e-depth-bold)) var(--e-radius-md);
    border-end-start-radius: calc(var(--e-radius-md) + var(--e-depth-bold)) var(--e-radius-md);
    background-color: var(--_tone-bg);
    background-clip: padding-box;
    color: var(--e-ink);
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
