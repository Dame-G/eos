<script setup lang="ts">
import { cloneVNode, computed, onBeforeUnmount, onMounted, ref, watch, type VNode } from "vue";
import { TooltipContent, TooltipPortal, TooltipRoot, TooltipTrigger } from "reka-ui";
import { usePortalTarget } from "../../config.js";
import { EDGE_PADDING_TIGHT, FLOAT_OFFSET, useLogicalSide } from "../../composables/useDir.js";
import { TooltipScope } from "../../composables/useRekaConfig.js";
import { useTooltipGroup } from "./group.js";
import "../../styles/base.css";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** What the tooltip says: a name for the control, never anything you must read or click. */
    label: string;
    /** Which edge of the control it sits on. `start` and `end` follow the reading direction. */
    side?: "top" | "bottom" | "start" | "end";
    /** Milliseconds of hovering before it shows. Keyboard focus shows it at once, and so does moving from one tooltip to the next. */
    delay?: number;
    /** Whether the label is read out as the control's description (`aria-describedby`). Left out, it is, unless the label is the control's accessible name already, which would be read twice; the bubble is then only for sight. */
    describes?: boolean;
  }>(),
  { side: "top", delay: 400, describes: undefined },
);

const emit = defineEmits<{
  /** The person hid it, by blur, pointer leave, Escape or the end of a touch. `open` is already false. Setting `open` to false yourself does not fire it. */
  close: [];
}>();

const slots = defineSlots<{
  /** One focusable element: an icon button, a link. It becomes the trigger and is described by the bubble. */
  default(): unknown;
}>();

const portal = usePortalTarget();
const group = useTooltipGroup();
/** Whether the bubble shows. Hover, focus and Escape update it. */
const open = defineModel<boolean>("open", { default: false });

const placement = useLogicalSide(() => props.side);
const delayNow = computed(() => (group.skipping.value ? 0 : props.delay));

watch(open, (now) => (now ? group.opened() : group.closed()));

/** The person showing or hiding it: hover, focus, Escape, a touch. Only a person hiding it fires `close`; `open` set to false from outside does not. */
function setOpen(value: boolean) {
  const was = open.value;
  open.value = value;
  if (was && !value) emit("close");
}

/*
 * The trigger's accessible name, as far as it can be read without a full computation: `aria-label`, the text of the
 * `aria-labelledby` elements, or its own text. An `EIconButton` with a tooltip passes its label as both.
 */
const trigger = ref<{ $el?: Node } | null>(null);
const triggerName = ref<string | null>(null);
const squash = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim().toLowerCase();
function readName() {
  // A trigger that renders a fragment points at its start marker; the element follows it.
  let node: Node | null | undefined = trigger.value?.$el;
  while (node && !(node instanceof Element)) node = node.nextSibling;
  const el = node;
  if (!el) return;
  const ids = el.getAttribute("aria-labelledby");
  const labelled = ids
    ?.split(/\s+/)
    .map((id) => document.getElementById(id)?.textContent ?? "")
    .join(" ");
  triggerName.value = squash(el.getAttribute("aria-label") ?? labelled ?? el.textContent);
}
onMounted(readName);
watch(open, (now) => now && readName(), { flush: "pre" });

const describing = computed(() => props.describes ?? triggerName.value !== squash(props.label));

/*
 * Reka sets `aria-describedby` on the trigger while the bubble is open. When the label is not a description, the
 * trigger's own value is laid over it (the trigger's props win the merge), so a name is never read twice.
 */
function triggerNodes(): VNode[] {
  const nodes = (slots.default() ?? []) as VNode[];
  if (describing.value) return nodes;
  return nodes.map((n) => cloneVNode(n, { "aria-describedby": n.props?.["aria-describedby"] }));
}

/*
 * A held finger shows it, and it stays a moment after the finger lifts so it can be read. The click that follows a
 * short touch would close it at once, so a touch turns off Reka's close-on-click until the bubble has gone.
 */
const touching = ref(false);
let hold: ReturnType<typeof setTimeout> | undefined;
onBeforeUnmount(() => clearTimeout(hold));
function touchStart(e: PointerEvent) {
  if (e.pointerType !== "touch") {
    touching.value = false;
    return;
  }
  touching.value = true;
  clearTimeout(hold);
  requestAnimationFrame(() => setOpen(true));
}
function touchEnd(e: PointerEvent) {
  if (e.pointerType !== "touch") return;
  clearTimeout(hold);
  hold = setTimeout(() => {
    touching.value = false;
    setOpen(false);
  }, 1500);
}
</script>

<template>
  <TooltipScope :delay-duration="delay">
    <TooltipRoot :open="open" :delay-duration="delayNow" :disable-closing-trigger="touching" @update:open="setOpen">
      <TooltipTrigger ref="trigger" as-child @pointerdown="touchStart" @pointerup="touchEnd" @pointercancel="touchEnd">
        <component :is="node" v-for="(node, i) in triggerNodes()" :key="i" />
      </TooltipTrigger>
      <TooltipPortal :to="portal">
        <TooltipContent
          class="e-tip-bubble e-root"
          :side="placement"
          align="center"
          :side-offset="FLOAT_OFFSET"
          :collision-padding="EDGE_PADDING_TIGHT"
          :aria-hidden="describing ? undefined : 'true'"
          v-bind="$attrs"
        >
          {{ label }}
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipScope>
</template>

<style>
@layer e.primitives {
  .e-tip-bubble {
    z-index: var(--e-z-tooltip);
    width: max-content;
    max-width: calc(var(--e-size-panel-md) / 2);
    padding: var(--e-gap-snug) var(--e-pad-control-sm);
    border-radius: var(--e-radius-sm);
    background: var(--e-ink);
    color: var(--e-surface);
    font: var(--e-type-small);
    text-align: center;
  }

  @media (forced-colors: active) {
    .e-tip-bubble {
      outline: var(--e-stroke-edge) solid CanvasText;
    }
  }
}
</style>
