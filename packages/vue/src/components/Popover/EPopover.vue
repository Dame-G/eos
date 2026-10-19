<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { PopoverClose, PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from "reka-ui";
import EActions from "../Actions/EActions.vue";
import EIcon from "../Icon/EIcon.vue";
import EIconButton from "../IconButton/EIconButton.vue";
import { useMessages, usePortalTarget } from "../../config.js";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";
import "../Select/panel.css";

defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    /** Names the panel for screen readers (when there is no `title`) and is read after the term. */
    label: string;
    /** Adds a title row with this title and a Close button. */
    title?: string;
    /** The level of the title's heading, so it fits the page outline. Default 3. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  }>(),
  { headingLevel: 3 },
);

defineSlots<{
  /** The term, shown with a dotted underline and an info glyph. */
  trigger(): unknown;
  /** The explanation. Keep it short; use a Dialog when the reader must decide something. */
  default(): unknown;
  /** Buttons in a tinted footer, left-aligned, the main action first. They stack full width on a phone. */
  actions?(): unknown;
}>();

const open = defineModel<boolean>({ default: false });

const t = useMessages();
const portal = usePortalTarget();
const id = useUid();

const trigger = ref<HTMLElement | null>(null);
watch(
  open,
  async (isOpen) => {
    if (!isOpen) return;
    await nextTick();
    document
      .getElementById(trigger.value?.getAttribute("aria-controls") ?? "")
      ?.setAttribute("aria-labelledby", `${id.value}-title`);
  },
  { flush: "post" },
);
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child>
      <button ref="trigger" type="button" class="e-linkbtn" v-bind="$attrs">
        <EIcon name="info" small />
        <slot name="trigger" />
        <span class="e-sr">, {{ label }}</span>
      </button>
    </PopoverTrigger>
    <PopoverPortal :to="portal">
      <PopoverContent class="e-popover e-root" side="bottom" align="start" :side-offset="8" :collision-padding="16">
        <div v-if="title" class="e-pop-head">
          <component :is="`h${headingLevel}`" :id="`${id}-title`" class="e-pop-title">{{ title }}</component>
          <PopoverClose as-child>
            <EIconButton icon="x" :label="t('close')" />
          </PopoverClose>
        </div>
        <span v-else :id="`${id}-title`" class="e-sr">{{ label }}</span>
        <div class="e-pop-body"><slot /></div>
        <EActions v-if="$slots['actions']" bar><slot name="actions" /></EActions>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<style>
@layer e.containers {
  .e-linkbtn {
    display: inline-flex;
    align-items: center;
    gap: var(--e-space-1);
    position: relative;
    min-height: 28px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--e-primary);
    font: 500 var(--e-text-sm) / 1.3 var(--e-font-sans);
    text-decoration: underline dotted;
    text-decoration-color: currentcolor;
    text-underline-offset: 4px;
    text-decoration-thickness: 2px;
    cursor: help;
  }

  .e-linkbtn::after {
    content: "";
    position: absolute;
    inset: -8px -4px;
  }

  .e-linkbtn:hover,
  .e-linkbtn:active {
    color: var(--e-ink);
  }

  .e-pop-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--e-space-2);
    padding: var(--e-space-1) var(--e-space-1) 0 var(--e-space-4);
  }

  .e-pop-title {
    margin: 0;
    font: 600 var(--e-text-xs) / 1.2 var(--e-font-mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--e-muted);
  }

  .e-pop-body {
    padding: var(--e-space-3) var(--e-space-4) var(--e-space-4);
    font: 400 var(--e-text-md) / 1.5 var(--e-font-sans);
  }

  .e-pop-head + .e-pop-body {
    padding-top: var(--e-space-1);
  }

  @media print {
    .e-linkbtn {
      display: none;
    }
  }
}
</style>
