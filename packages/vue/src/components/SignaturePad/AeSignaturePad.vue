<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useResizeObserver } from "@vueuse/core";
import AeIcon from "../Icon/AeIcon.vue";
import AeButton from "../Button/AeButton.vue";
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

/** The drawing as a PNG data URL, empty while the pad is clear. Set it to an empty string to clear the pad. */
const model = defineModel<string>({ default: "" });

const t = useMessages();
const id = useUid(() => props.id);
const canvas = ref<HTMLCanvasElement | null>(null);
const empty = ref(!model.value);

interface Point {
  x: number;
  y: number;
}
// The strokes are kept as points so the pad can redraw after a resize and export in black whatever the theme.
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

/** Sizes the bitmap to the element at the device pixel ratio, then redraws what was drawn. */
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
  } catch {
    // some pointers cannot be captured; drawing still works while the pointer stays over the canvas
  }
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

/** The image is black on transparent, as on paper, whatever the theme draws on screen. */
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

// Setting the model to an empty string from outside clears the pad.
watch(model, (v) => {
  if (!v && !empty.value) wipe();
});

defineExpose({
  /** Clears the pad. */
  clear,
  /** The `<canvas>` element. */
  canvas,
});
</script>

<template>
  <div class="ae-pad">
    <div class="ae-pad-surface" :data-empty="empty ? '' : undefined">
      <canvas
        :id="id"
        ref="canvas"
        class="ae-pad-canvas"
        role="img"
        :style="{ height: `${height}px`, color: 'var(--ae-ink)' }"
        :aria-label="t('drawSignature')"
        :aria-describedby="`${id}-hint`"
        @pointerdown="down"
        @pointermove="move"
        @pointerup="up"
        @pointercancel="up"
      />
      <span v-if="empty" class="ae-pad-placeholder" aria-hidden="true">
        <AeIcon name="signature" />
        {{ t("signEmpty") }}
      </span>
    </div>
    <div class="ae-pad-foot">
      <p :id="`${id}-hint`" class="ae-field-hint">{{ t("signDrawHint") }}</p>
      <AeButton variant="quiet" icon="eraser" :disabled="empty || disabled" @click="clear">
        {{ t("signClear") }}
      </AeButton>
    </div>
  </div>
</template>

<style>
@layer ae.composites {
  .ae-pad {
    display: grid;
    gap: var(--ae-space-2);
  }

  .ae-pad-surface {
    position: relative;
    overflow: hidden;
    border: var(--ae-stroke-edge) solid var(--ae-border-strong);
    border-radius: var(--ae-radius-md);
    background: var(--ae-surface);
    box-shadow: var(--ae-well);
  }

  .ae-pad-surface::after {
    content: "";
    position: absolute;
    inset-inline: var(--ae-space-4);
    bottom: 36px;
    border-bottom: 2px solid var(--ae-ink);
    pointer-events: none;
  }

  .ae-pad-canvas {
    display: block;
    width: 100%;
    touch-action: none;
    cursor: crosshair;
  }

  .ae-pad-placeholder {
    position: absolute;
    inset: 0;
    display: grid;
    place-content: center;
    justify-items: center;
    gap: var(--ae-space-2);
    color: var(--ae-muted);
    font: 400 var(--ae-text-sm)/1.4 var(--ae-font-sans);
    pointer-events: none;
  }

  .ae-pad-foot {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--ae-space-2) var(--ae-space-4);
  }

  .ae-pad-foot .ae-field-hint {
    margin: 0;
    flex: 1 1 14rem;
  }
}
</style>
