<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useMessages } from "../../config.js";
import "../../styles/base.css";

const props = defineProps<{
  /** The column's label, for the accessible name. */
  label: string;
  /** The width the person set, in pixels, or nothing while the browser sizes the column. */
  width: number | undefined;
  /** The least width in pixels. */
  min: number;
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

const cellWidth = () => el.value?.parentElement?.getBoundingClientRect().width ?? props.min;
const sign = () => (el.value && getComputedStyle(el.value).direction === "rtl" ? -1 : 1);

onMounted(() => (measured.value = Math.round(cellWidth())));

function onDown(e: PointerEvent) {
  e.preventDefault();
  const startX = e.clientX;
  const startW = cellWidth();
  const dir = sign();
  function move(ev: PointerEvent) {
    emit("resize", Math.max(props.min, Math.round(startW + (ev.clientX - startX) * dir)));
  }
  function up() {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    document.body.style.cursor = "";
    measured.value = Math.round(cellWidth());
  }
  document.body.style.cursor = "col-resize";
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
}

function onKey(e: KeyboardEvent) {
  const step = e.shiftKey ? 40 : 10;
  const dir = sign();
  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    e.preventDefault();
    const grow = (e.key === "ArrowRight" ? 1 : -1) * dir;
    const next = Math.max(props.min, Math.round(cellWidth()) + grow * step);
    measured.value = next;
    emit("resize", next);
  } else if (e.key === "Home" || e.key === "Escape") {
    e.preventDefault();
    emit("reset");
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
    @pointerdown="onDown"
    @keydown="onKey"
    @focus="measured = Math.round(cellWidth())"
    @dblclick="onReset"
  />
</template>
