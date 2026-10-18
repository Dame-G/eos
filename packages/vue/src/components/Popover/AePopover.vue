<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { PopoverClose, PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from "reka-ui";
import AeActions from "../Actions/AeActions.vue";
import AeIcon from "../Icon/AeIcon.vue";
import AeIconButton from "../IconButton/AeIconButton.vue";
import { useMessages, usePortalTarget } from "../../config.js";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";
import "../Select/panel.css";

defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    /** Names the panel for screen readers (when there is no `title`) and is read after the term. */
    label: string;
    /** Adds a header with this title and a Close button. */
    title?: string;
    /** The level of the title's heading, so it fits the page outline. Default 3. */
    headingLevel?: 1 | 2 | 3 | 4;
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

/** Whether the panel is open. */
const open = defineModel<boolean>({ default: false });

const t = useMessages();
const portal = usePortalTarget();
const id = useUid();

// Reka names the panel by its trigger. The panel is better named by its title, or by the label when there is none.
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
      <button ref="trigger" type="button" class="ae-linkbtn" v-bind="$attrs">
        <AeIcon name="info" small />
        <slot name="trigger" />
        <span class="ae-sr">, {{ label }}</span>
      </button>
    </PopoverTrigger>
    <PopoverPortal :to="portal">
      <PopoverContent class="ae-popover ae-root" side="bottom" align="start" :side-offset="8" :collision-padding="16">
        <header v-if="title" class="ae-pop-head">
          <component :is="`h${headingLevel}`" :id="`${id}-title`" class="ae-pop-title">{{ title }}</component>
          <PopoverClose as-child>
            <AeIconButton icon="x" :label="t('close')" />
          </PopoverClose>
        </header>
        <span v-else :id="`${id}-title`" class="ae-sr">{{ label }}</span>
        <div class="ae-pop-body"><slot /></div>
        <AeActions v-if="$slots['actions']" bar><slot name="actions" /></AeActions>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>

<style>
@layer ae.containers {
  .ae-linkbtn {
    display: inline-flex;
    align-items: center;
    gap: var(--ae-space-1);
    position: relative;
    min-height: 28px;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--ae-primary);
    font: 500 var(--ae-text-sm) / 1.3 var(--ae-font-sans);
    text-decoration: underline dotted;
    text-decoration-color: currentcolor;
    text-underline-offset: 4px;
    text-decoration-thickness: 2px;
    cursor: help;
  }

  .ae-linkbtn::after {
    content: "";
    position: absolute;
    inset: -8px -4px;
  }

  .ae-linkbtn:hover,
  .ae-linkbtn:active {
    color: var(--ae-ink);
  }

  .ae-pop-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ae-space-2);
    padding: var(--ae-space-1) var(--ae-space-1) 0 var(--ae-space-4);
  }

  .ae-pop-title {
    margin: 0;
    font: 600 var(--ae-text-xs) / 1.2 var(--ae-font-mono);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ae-muted);
  }

  .ae-pop-body {
    padding: var(--ae-space-3) var(--ae-space-4) var(--ae-space-4);
    font: 400 var(--ae-text-md) / 1.5 var(--ae-font-sans);
  }

  .ae-pop-head + .ae-pop-body {
    padding-top: var(--ae-space-1);
  }

  /* Not part of the page when printed. The reference uses !important; a later rule in the same layer wins without it. */
  @media print {
    .ae-linkbtn {
      display: none;
    }
  }
}
</style>
