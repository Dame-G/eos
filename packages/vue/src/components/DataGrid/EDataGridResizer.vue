<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useMessages } from "../../config.js";
import "../../styles/base.css";

const props = defineProps<{
  /** The column's label, for the accessible name. */
  label: string;
  /** The width the person set, in pixels, or nothing while the browser sizes the column. */
  width: number | undefined;
  /** The least width in pixels. */
  min: number;
  /** The most width in pixels. */
  max: number;
}>();

const emit = defineEmits<{
  /** The person chose a width in pixels. */
  resize: [px: number];
  /** The person asked for the automatic width again. */
  reset: [];
}>();

const t = useMessages();
const el = ref<HTMLElement | null>(null);
const measured = ref(props.min);
/** The width when the edge was picked up or focused: Escape goes back to it. `undefined` is the automatic width. */
let origin: number | undefined;
let stopDrag: (() => void) | undefined;

const cellWidth = () => el.value?.parentElement?.getBoundingClientRect().width ?? props.min;
const sign = () => (el.value && getComputedStyle(el.value).direction === "rtl" ? -1 : 1);
const bounded = (px: number) => Math.min(props.max, Math.max(props.min, Math.round(px)));

onMounted(() => (measured.value = Math.round(cellWidth())));
onBeforeUnmount(() => stopDrag?.());

function restore() {
  if (origin === undefined) emit("reset");
  else emit("resize", origin);
  measured.value = Math.round(origin ?? cellWidth());
}

function onDown(e: PointerEvent) {
  e.preventDefault();
  stopDrag?.();
  const startX = e.clientX;
  const startW = cellWidth();
  const dir = sign();
  origin = props.width;
  function move(ev: PointerEvent) {
    emit("resize", bounded(startW + (ev.clientX - startX) * dir));
  }
  function end() {
    stopDrag?.();
    measured.value = Math.round(cellWidth());
  }
  function cancel() {
    stopDrag?.();
    restore();
  }
  function key(ev: KeyboardEvent) {
    if (ev.key !== "Escape") return;
    ev.preventDefault();
    cancel();
  }
  document.body.style.cursor = "col-resize";
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", end);
  window.addEventListener("pointercancel", cancel);
  window.addEventListener("keydown", key, true);
  stopDrag = () => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointercancel", cancel);
    window.removeEventListener("keydown", key, true);
    document.body.style.cursor = "";
    stopDrag = undefined;
  };
}

function onFocus() {
  origin = props.width;
  measured.value = Math.round(cellWidth());
}

function onKey(e: KeyboardEvent) {
  const step = e.shiftKey ? 40 : 10;
  const dir = sign();
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    e.preventDefault();
    const grow = (e.key === "ArrowRight" ? 1 : -1) * dir;
    const next = bounded(cellWidth() + grow * step);
    measured.value = next;
    emit("resize", next);
  } else if (e.key === "Home") {
    e.preventDefault();
    emit("reset");
  } else if (e.key === "Escape") {
    e.preventDefault();
    restore();
  }
}

function onReset() {
  emit("reset");
}
</script>

<template>
  <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
  <span
    ref="el"
    class="e-resizer"
    role="separator"
    aria-orientation="vertical"
    tabindex="0"
    :aria-label="t('resizeCol', { col: label })"
    :aria-valuenow="Math.round(width ?? measured)"
    :aria-valuemin="min"
    :aria-valuemax="max"
    @pointerdown="onDown"
    @keydown="onKey"
    @focus="onFocus"
    @dblclick="onReset"
  />
</template>
