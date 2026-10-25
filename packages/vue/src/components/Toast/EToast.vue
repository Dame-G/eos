<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import EActions from "../Actions/EActions.vue";
import EIcon from "../Icon/EIcon.vue";
import EIconButton from "../IconButton/EIconButton.vue";
import ESurface from "../Surface/ESurface.vue";
import { useMessages } from "../../config.js";
import { useAnnouncer } from "../../composables/useAnnouncer.js";
import type { IconProp } from "../../icons/types.js";
import { roleFor, TONE_ICON, type NoticeRole, type NoticeTone } from "../Notice/tone.js";
import "../../styles/base.css";
import "../Notice/notice.css";

const props = withDefaults(
  defineProps<{
    /** What happened, in a few words. */
    title: string;
    /** `neutral` is for news that is neither good nor bad, `info` informs, `success` confirms, `warning` needs attention and `danger` is an error. */
    tone?: NoticeTone;
    /** Replaces the icon of the tone. */
    icon?: IconProp;
    /** Shows the dismiss button. A toast floats over the page, so it has one unless it goes by itself. */
    closable?: boolean;
    /** How it is announced as it appears: `alert` at once, `status` politely, `false` not at all, for a host that announces it (as `EToastProvider` does). @default "alert" for danger, else "status" */
    role?: NoticeRole;
  }>(),
  { tone: "info", closable: true, role: undefined },
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
const { announce } = useAnnouncer();
const role = computed(() => roleFor(props.role, props.tone));

/*
 * A live region that arrives with its words in it is missed by several screen readers, so the toast carries no live
 * role. It says its title and detail through the page's shared live regions as it appears.
 */
const detail = ref<HTMLElement | null>(null);
onMounted(() => {
  if (!role.value) return;
  const words = [props.title, detail.value?.textContent?.trim()].filter(Boolean).join(". ");
  announce(words, { assertive: role.value === "alert" });
});
</script>

<template>
  <ESurface variant="raised" flush class="e-toast" :class="[`e-toast--${tone}`, $slots.action && 'e-toast--actions']">
    <div class="e-notice-grid">
      <span class="e-notice-icon"><EIcon :name="icon ?? TONE_ICON[tone]" /></span>
      <div class="e-notice-body e-toast-body">
        <p class="e-toast-title">{{ title }}</p>
        <p v-if="$slots.default" ref="detail" class="e-toast-text"><slot /></p>
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
  /* The slab on the tone's side: the inline-start border, `stroke-edge` plus `slab-bold` thick as on a Notice and a Stamp, in the colour of the tone's edge. It flips in a right-to-left page. The tone's colour comes from notice.css. */
  .e-toast {
    /* The notice's 36rem container step (`size-panel-lg`) plus the toast's padding and tone edge, so an action sits at the end of the row. */
    --_wide: calc(var(--e-size-panel-lg) + 2 * var(--e-pad-card) + var(--e-stroke-edge) + var(--e-slab-bold));

    position: relative;
    container-type: inline-size;
    width: min(var(--e-size-panel-sm), 100%);
    padding: var(--e-gap-base) var(--e-pad-card);
    border-inline-start: calc(var(--e-stroke-edge) + var(--e-slab-bold)) solid var(--_tone);
    border-start-start-radius: calc(var(--e-radius-md) + var(--e-slab-bold)) var(--e-radius-md);
    border-end-start-radius: calc(var(--e-radius-md) + var(--e-slab-bold)) var(--e-radius-md);
  }

  .e-toast--actions {
    width: min(var(--_wide), 100%);
  }

  /* The title is the notice's title style. */
  .e-toast-title {
    margin: 0;
    font: var(--e-type-h4);
  }

  .e-toast-text {
    margin: 0;
    font: var(--e-type-small);
    color: var(--e-muted);
  }

  @media (forced-colors: active) {
    .e-toast {
      border: var(--e-stroke-card) solid CanvasText;
      border-inline-start-width: calc(var(--e-stroke-edge) + var(--e-slab-bold));
    }
  }
}
</style>
