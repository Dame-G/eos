<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { PopoverClose, PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from "reka-ui";
import EActions from "../Actions/EActions.vue";
import EIconButton from "../IconButton/EIconButton.vue";
import { useMessages, usePortalTarget } from "../../config.js";
import { useDir } from "../../composables/useDir.js";
import { RekaConfig } from "../../composables/useRekaConfig.js";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";
import "../../styles/controls/panel.css";
import "../../styles/popover.css";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** Names the panel for screen readers when there is no `title`. */
    label: string;
    /** Adds a title row with this title and a Close button. */
    title?: string;
    /** The level of the title's heading, so it fits the page outline. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    /** The side of the trigger it opens on. `start` and `end` follow the reading direction. It flips to the other side when there is no room. */
    side?: "top" | "bottom" | "start" | "end";
    /** How it lines up with the trigger along that side. */
    align?: "start" | "center" | "end";
  }>(),
  { headingLevel: 3, side: "bottom", align: "start" },
);

defineSlots<{
  /** The control that opens it: one element, usually an `EButton`. It receives `aria-expanded`, `aria-controls` and `aria-haspopup`. */
  trigger(props: { open: boolean }): unknown;
  /** The content. Up and Down move between its controls. */
  default(): unknown;
  /** Buttons in the footer, main action first. They stack full width on a narrow screen. */
  actions?(): unknown;
}>();

/** The open state. */
const open = defineModel<boolean>({ default: false });

const t = useMessages();
const portal = usePortalTarget();
const dir = useDir();
const id = useUid();

const physicalSide = computed(() => {
  if (props.side === "start") return dir.value === "rtl" ? "right" : "left";
  if (props.side === "end") return dir.value === "rtl" ? "left" : "right";
  return props.side;
});

/* Reka names the panel by its trigger and sets that after any attribute passed in. The panel is named by its title (or `label`) once it is in the page. */
const content = ref<{ $el: HTMLElement } | null>(null);
const panel = () =>
  (content.value?.$el?.closest("[role=dialog]") ?? content.value?.$el?.querySelector("[role=dialog]")) as
    HTMLElement | null | undefined;
watch(
  open,
  async (isOpen) => {
    if (!isOpen) return;
    await nextTick();
    panel()?.setAttribute("aria-labelledby", `${id.value}-title`);
  },
  { flush: "post" },
);

/** Elements that use the arrow keys themselves: a field, a list or a group of choices inside the panel keeps them. */
const OWNS_ARROWS =
  "input, textarea, select, [contenteditable=''], [contenteditable='true'], [role=listbox], [role=menu], [role=tree], [role=grid], [role=radiogroup], [role=tablist], [role=slider], [role=spinbutton]";
const FOCUSABLE =
  "a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex='-1'])";

/** Up and Down move to the previous and next control in the panel, Home and End to the first and last, as in a menu. */
function onKeydown(event: KeyboardEvent) {
  const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
  if (!keys.includes(event.key) || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
  const root = event.currentTarget as HTMLElement;
  const target = event.target as HTMLElement;
  const owner = target.closest(OWNS_ARROWS);
  if (owner && root.contains(owner)) return;
  const items = [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.getClientRects().length > 0);
  if (!items.length) return;
  const at = items.indexOf(target);
  const last = items.length - 1;
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? last
        : event.key === "ArrowDown"
          ? at < 0 || at === last
            ? 0
            : at + 1
          : at <= 0
            ? last
            : at - 1;
  event.preventDefault();
  items[next]!.focus();
}
</script>

<template>
  <RekaConfig>
    <PopoverRoot v-model:open="open">
      <PopoverTrigger as-child>
        <slot name="trigger" :open="open" />
      </PopoverTrigger>
      <PopoverPortal :to="portal">
        <PopoverContent
          ref="content"
          class="e-popover e-root"
          v-bind="$attrs"
          :side="physicalSide"
          :align="align"
          :side-offset="8"
          :collision-padding="16"
          @keydown="onKeydown"
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
  </RekaConfig>
</template>

<style>
/* The panel is the shared `.e-popover` (controls/panel.css) with the head and body of styles/popover.css. */
/* stylelint-disable-next-line block-no-empty -- the layer declaration is the point */
@layer e.containers {
}
</style>
