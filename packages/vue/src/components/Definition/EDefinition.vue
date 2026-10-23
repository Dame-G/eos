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
    /** The level of the title's heading, so it fits the page outline. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Sets the term in the sentence around it, at the sentence's size and on its baseline, without the info icon. For a term inside running text, such as a footer line. */
    inline?: boolean;
  }>(),
  { headingLevel: 3 },
);
defineSlots<{
  /** The term that opens the panel. */
  trigger(): unknown;
  /** The explanation. Keep it short, and use a Dialog when the reader must decide something. */
  default(): unknown;
  /** Buttons in the footer, main action first. They stack full width on a narrow screen. */
  actions?(): unknown;
}>();

/** The open state. */
const open = defineModel<boolean>({ default: false });

const t = useMessages();
const portal = usePortalTarget();
const id = useUid();

/* Reka names the panel by its trigger and sets that after any attribute passed in, so a bound `aria-labelledby` is overwritten. The panel is named by its title (or `label`) once it is in the page. */
const content = ref<{ $el: HTMLElement } | null>(null);
watch(
  open,
  async (isOpen) => {
    if (!isOpen) return;
    await nextTick();
    const panel = content.value?.$el?.closest("[role=dialog]") ?? content.value?.$el?.querySelector("[role=dialog]");
    panel?.setAttribute("aria-labelledby", `${id.value}-title`);
  },
  { flush: "post" },
);
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child>
      <button type="button" class="e-definition-term" :class="inline && 'e-definition-term--inline'" v-bind="$attrs">
        <EIcon v-if="!inline" name="info" size="sm" />
        <slot name="trigger" />
        <span class="e-sr">, {{ label }}</span>
      </button>
    </PopoverTrigger>
    <PopoverPortal :to="portal">
      <PopoverContent
        ref="content"
        class="e-popover e-root"
        side="bottom"
        align="start"
        :side-offset="8"
        :collision-padding="16"
      >
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
  .e-definition-term {
    display: inline-flex;
    align-items: center;
    gap: var(--e-gap-tight);
    position: relative;
    min-height: var(--e-icon-size-md);
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--e-primary);
    font: var(--e-weight-medium) var(--e-text-sm) / var(--e-leading-snug) var(--e-font-sans);
    text-decoration: underline dotted;
    text-decoration-color: currentcolor;
    text-underline-offset: var(--e-gap-tight);
    text-decoration-thickness: var(--e-stroke-edge);
    cursor: help;
  }

  /* In running text: the sentence's font and baseline, no icon, and no taller box than the line. */
  .e-definition-term--inline {
    align-items: baseline;
    min-height: 0;
    font: inherit;
    vertical-align: baseline;
  }

  .e-definition-term::after {
    content: "";
    position: absolute;
    inset: calc(-1 * var(--e-gap-snug)) calc(-1 * var(--e-gap-tight));
  }

  .e-definition-term:hover,
  .e-definition-term:active {
    color: var(--e-ink);
  }

  /* .e-pop-head, .e-pop-title and .e-pop-body are also the popover frame of EDataGrid's column chooser. */
  .e-pop-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--e-gap-snug);
    padding-block: var(--e-gap-tight) 0;
    padding-inline: var(--e-pad-card) var(--e-gap-tight);
  }

  .e-pop-title {
    margin: 0;
    font: var(--e-type-kicker);
    letter-spacing: var(--e-tracking-label);
    text-transform: uppercase;
    color: var(--e-muted);
  }

  .e-pop-body {
    padding-block: var(--e-gap-base) var(--e-pad-card);
    padding-inline: var(--e-pad-card);
    font: var(--e-type-body);
  }

  .e-pop-head + .e-pop-body {
    padding-top: var(--e-gap-tight);
  }

  @media print {
    .e-definition-term {
      display: none;
    }
  }
}
</style>
