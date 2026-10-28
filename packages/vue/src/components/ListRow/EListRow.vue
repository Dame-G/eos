<script setup lang="ts">
import { computed, inject, onBeforeUnmount, onMounted, ref, watch, type Component } from "vue";
import { listKey, type ListKey } from "../List/listContext.js";
import { useMessages } from "../../config.js";
import { hasLinkTarget, linkTarget } from "../../composables/useLink.js";
import "../../styles/base.css";
import "../../styles/listrow.css";

const props = withDefaults(
  defineProps<{
    /** What names the row in its `EList`: the list's `v-model` is the `value` of the current or selected row. Unique in the list. */
    value: ListKey;
    /** The first line, in the row's own weight. The `title` slot replaces it. */
    title?: string;
    /** A muted second line, such as when and how long. The `subtitle` slot replaces it. */
    subtitle?: string;
    /** Where the row goes, in a `current` list. Give `href` or, with a `linkComponent`, `to`; the row is then a link instead of a button. */
    href?: string;
    /** A router location, passed to `linkComponent` as `to` (for `RouterLink`). Use it instead of `href`. */
    to?: unknown;
    /** What renders a row that links: `RouterLink` or any component that takes `href` or `to` and a default slot. */
    linkComponent?: string | Component;
    /** Marks the row as happening now, with a pulsing dot before the title and "Live" for screen readers. The `live` slot replaces the dot. Passing it at all, even as `false`, reserves the dot's place before the title and the subtitle, so the titles of live and finished rows line up. */
    live?: boolean;
    /** The colour of the live dot: `success` (green), `danger` (red), `warning` or `info`. @default "success" */
    liveTone?: "success" | "danger" | "warning" | "info";
    /** Whether what the row opens is open, for a row that expands something. Sets `aria-expanded` on the row's own button or link, not on its wrapper. */
    expanded?: boolean;
    /** Stacks what the `trailing` slot holds, end-aligned, one child under another: a score over a time. The second line is set smaller and muted. */
    trailingStack?: boolean;
    /** Keeps it in the list but unavailable: it dims and no longer answers. */
    disabled?: boolean;
  }>(),
  { linkComponent: "a", live: undefined, liveTone: "success", expanded: undefined },
);

defineSlots<{
  /** The first line, instead of `title`, for richer text such as two names and a result. */
  title?(): unknown;
  /** The second line, instead of `subtitle`. */
  subtitle?(): unknown;
  /** Before the lines, such as an avatar, an icon or a stamp. */
  leading?(): unknown;
  /** At the end, such as a score or an amount. In a `select` list keep it to text: an option cannot hold a control. */
  trailing?(): unknown;
  /** A mark of your own for `live`, in place of the pulsing dot. */
  live?(): unknown;
  /** Buttons at the end of the row, such as Delete or a menu. They sit beside the row's button, not inside it, so a row can hold controls; keep them to a few icon buttons. Not shown in a `select` list, whose options cannot sit beside controls. */
  actions?(): unknown;
}>();

const t = useMessages();
const list = inject(listKey, null);

watch(
  () => props.value,
  (key, old) => {
    if (old !== undefined) list?.unregister(old);
    list?.register(key);
  },
  { immediate: true },
);
onBeforeUnmount(() => list?.unregister(props.value));

const select = computed(() => list?.mode.value === "select");
const chosen = computed(() => !!list?.isChosen(props.value));
const linked = computed(() => !select.value && !props.disabled && hasLinkTarget(props));
const tag = computed(() => (select.value ? "div" : linked.value ? props.linkComponent : "button"));
const tabindex = computed(() => (list ? (list.isStop(props.value) ? 0 : -1) : undefined));

const expandedAttr = computed(() => (props.expanded === undefined ? undefined : props.expanded ? "true" : "false"));

/** The room the actions take at the end of the row, so the row's own text stops short of them. */
const actionsEl = ref<HTMLElement | null>(null);
const actionsWidth = ref(0);
let watcher: ResizeObserver | undefined;
onMounted(() => {
  const el = actionsEl.value;
  if (!el || typeof ResizeObserver === "undefined") return;
  watcher = new ResizeObserver(() => (actionsWidth.value = el.offsetWidth));
  watcher.observe(el);
  actionsWidth.value = el.offsetWidth;
});
onBeforeUnmount(() => watcher?.disconnect());

const attrs = computed(() => {
  if (select.value)
    return {
      role: "option",
      "aria-selected": chosen.value ? "true" : "false",
      "aria-disabled": props.disabled ? "true" : undefined,
    };
  if (linked.value)
    return {
      ...linkTarget(props, props.linkComponent),
      "aria-current": chosen.value ? "true" : undefined,
      "aria-expanded": expandedAttr.value,
    };
  return {
    type: "button",
    "aria-current": chosen.value ? "true" : undefined,
    "aria-disabled": props.disabled ? "true" : undefined,
    "aria-expanded": expandedAttr.value,
  };
});

function press(event: MouseEvent | KeyboardEvent) {
  if (props.disabled) {
    event.preventDefault();
    return;
  }
  list?.choose(props.value);
}

/** An option is not a button, so Enter and Space choose it here. A button or a link answers them itself. */
function onKeydown(event: KeyboardEvent) {
  if (!select.value || (event.key !== "Enter" && event.key !== " ")) return;
  event.preventDefault();
  press(event);
}
</script>

<template>
  <!-- An option sits straight in its listbox, so in a `select` list the wrapper has no role. -->
  <div
    :role="select ? 'none' : 'listitem'"
    class="e-listrow-item"
    :class="$slots.actions && !select && 'e-listrow-item--actions'"
    :style="actionsWidth ? { '--_actions': `${actionsWidth}px` } : undefined"
  >
    <component
      :is="tag"
      class="e-listrow e-interact--inset"
      v-bind="attrs"
      :tabindex="tabindex"
      @click="press"
      @keydown="onKeydown"
      @focus="list?.focused(value)"
    >
      <span v-if="$slots.leading" class="e-listrow-lead"><slot name="leading" /></span>
      <span class="e-listrow-main" :class="live !== undefined && 'e-listrow-main--gutter'">
        <span class="e-listrow-title">
          <span v-if="live !== undefined" class="e-listrow-live" :class="`e-listrow-live--${liveTone}`"
            ><template v-if="live"
              ><slot name="live"><span class="e-listrow-pulse"></span></slot
              ><span class="e-sr">{{ t("live") }},</span></template
            ></span
          >
          <slot name="title">{{ title }}</slot>
        </span>
        <span v-if="subtitle || $slots.subtitle" class="e-listrow-sub"
          ><slot name="subtitle">{{ subtitle }}</slot></span
        >
      </span>
      <span v-if="$slots.trailing" class="e-listrow-trail" :class="trailingStack && 'e-listrow-trail--stack'"
        ><slot name="trailing"
      /></span>
    </component>
    <span v-if="$slots.actions && !select" ref="actionsEl" class="e-listrow-actions"><slot name="actions" /></span>
  </div>
</template>

<style>
@layer e.blocks {
  /* The row itself is the shared `.e-listrow` (styles/listrow.css), which ETree draws its rows with too. */
  .e-listrow-item {
    display: block;
    min-width: 0;
  }

  /* The actions sit over the end of the row, beside its button; the button makes room for them. */
  .e-listrow-item--actions {
    position: relative;
  }

  .e-listrow-item--actions > .e-listrow {
    padding-inline-end: calc(var(--e-pad-control-sm) + var(--_actions, 0px) + var(--e-gap-snug));
  }

  .e-listrow-actions {
    position: absolute;
    inset-block: 0;
    inset-inline-end: var(--e-gap-tight);
    display: flex;
    align-items: center;
    gap: var(--e-gap-tight);
  }
}
</style>
