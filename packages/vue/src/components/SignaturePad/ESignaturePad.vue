<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useResizeObserver } from "@vueuse/core";
import EIcon from "../Icon/EIcon.vue";
import EButton from "../Button/EButton.vue";
import { useMessages } from "../../config.js";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The height of the drawing area in pixels. */
    height?: number;
    disabled?: boolean;
    /** The id of the canvas. Generated when left out. */
    id?: string;
  }>(),
  { height: 160 },
);

const model = defineModel<string>({ default: "" });

const t = useMessages();
const id = useUid(() => props.id);
const canvas = ref<HTMLCanvasElement | null>(null);
const empty = ref(!model.value);

interface Point {
  x: number;
  y: number;
}
const strokes: Point[][] = [];
let current: Point[] | null = null;

function paint(ctx: CanvasRenderingContext2D, color: string) {
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  for (const stroke of strokes) {
    const [first, ...rest] = stroke;
    if (!first) continue;
    ctx.beginPath();
    ctx.arc(first.x, first.y, 1.2, 0, 6.3);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);
    for (const p of rest) ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }
}

function setup() {
  const cv = canvas.value;
  if (!cv) return;
  const dpr = window.devicePixelRatio || 1;
  cv.width = Math.round((cv.clientWidth || 320) * dpr);
  cv.height = Math.round(props.height * dpr);
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  paint(ctx, getComputedStyle(cv).color);
}
onMounted(setup);
useResizeObserver(canvas, setup);

function point(e: PointerEvent): Point {
  const r = canvas.value!.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

function down(e: PointerEvent) {
  if (props.disabled) return;
  e.preventDefault();
  try {
    canvas.value!.setPointerCapture(e.pointerId);
  } catch {}
  const p = point(e);
  current = [p];
  strokes.push(current);
  const ctx = canvas.value!.getContext("2d")!;
  ctx.fillStyle = getComputedStyle(canvas.value!).color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 1.2, 0, 6.3);
  ctx.fill();
}

function move(e: PointerEvent) {
  if (!current) return;
  const from = current[current.length - 1]!;
  const p = point(e);
  current.push(p);
  const ctx = canvas.value!.getContext("2d")!;
  ctx.strokeStyle = getComputedStyle(canvas.value!).color;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
}

function exportImage(): string {
  const cv = canvas.value!;
  const out = document.createElement("canvas");
  out.width = cv.width;
  out.height = cv.height;
  const ctx = out.getContext("2d")!;
  ctx.scale(cv.width / (cv.clientWidth || 320), cv.height / props.height);
  paint(ctx, "black");
  return out.toDataURL("image/png");
}

function up() {
  if (!current) return;
  current = null;
  empty.value = false;
  model.value = exportImage();
}

function wipe() {
  strokes.length = 0;
  current = null;
  empty.value = true;
  const cv = canvas.value;
  const ctx = cv?.getContext("2d");
  if (cv && ctx) {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.restore();
  }
}

function clear() {
  wipe();
  model.value = "";
}

watch(model, (v) => {
  if (!v && !empty.value) wipe();
});

defineExpose({
  clear,
  canvas,
});
</script>

<template>
  <div class="e-pad">
    <div class="e-pad-surface" :data-empty="empty ? '' : undefined">
      <canvas
        :id="id"
        ref="canvas"
        class="e-pad-canvas"
        role="img"
        :style="{ height: `${height}px`, color: 'var(--e-ink)' }"
        :aria-label="t('drawSignature')"
        :aria-describedby="`${id}-hint`"
        @pointerdown="down"
        @pointermove="move"
        @pointerup="up"
        @pointercancel="up"
      />
      <span v-if="empty" class="e-pad-placeholder" aria-hidden="true">
        <EIcon name="signature" />
        {{ t("signEmpty") }}
      </span>
    </div>
    <div class="e-pad-foot">
      <p :id="`${id}-hint`" class="e-field-hint">{{ t("signDrawHint") }}</p>
      <EButton variant="quiet" icon="eraser" :disabled="empty || disabled" @click="clear">
        {{ t("signClear") }}
      </EButton>
    </div>
  </div>
</template>

<style>
@layer e.composites {
  .e-pad {
    display: grid;
    gap: var(--e-space-2);
  }

  .e-pad-surface {
    position: relative;
    overflow: hidden;
    border: var(--e-stroke-edge) solid var(--e-border-strong);
    border-radius: var(--e-radius-md);
    background: var(--e-surface);
    box-shadow: var(--e-well);
  }

  .e-pad-surface::after {
    content: "";
    position: absolute;
    inset-inline: var(--e-space-4);
    bottom: 36px;
    border-bottom: 2px solid var(--e-ink);
    pointer-events: none;
  }

  .e-pad-canvas {
    display: block;
    width: 100%;
    touch-action: none;
    cursor: crosshair;
  }

  .e-pad-placeholder {
    position: absolute;
    inset: 0;
    display: grid;
    place-content: center;
    justify-items: center;
    gap: var(--e-space-2);
    color: var(--e-muted);
    font: 400 var(--e-text-sm)/1.4 var(--e-font-sans);
    pointer-events: none;
  }

  .e-pad-foot {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--e-space-2) var(--e-space-4);
  }

  .e-pad-foot .e-field-hint {
    margin: 0;
    flex: 1 1 14rem;
  }
}
</style>
