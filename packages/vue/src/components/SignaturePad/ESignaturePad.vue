<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useResizeObserver } from "@vueuse/core";
import EIcon from "../Icon/EIcon.vue";
import EButton from "../Button/EButton.vue";
import EFieldMessage from "../Field/EFieldMessage.vue";
import { useMessages } from "../../config.js";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The height of the drawing area in pixels. */
    height?: number;
    /** Help that stays under the pad. */
    hint?: string;
    /** What to fix. Replaces the hint, marks the pad invalid (`aria-invalid`, a danger edge) and is announced. */
    error?: string;
    /** Adds "Required" to what screen readers hear with the pad. Nothing stops an empty pad from being submitted: check the value. */
    required?: boolean;
    /** Ignores drawing and disables Clear. */
    disabled?: boolean;
    /** Shows the signature but ignores drawing and disables Clear. */
    readonly?: boolean;
    /** The id of the canvas. @default generated */
    id?: string;
  }>(),
  { height: 160 },
);

/** A PNG data URL (black on transparent). Empty while clear. Setting `""` clears the pad. */
const model = defineModel<string>({ default: "" });

const t = useMessages();
const id = useUid(() => props.id);
const canvas = ref<HTMLCanvasElement | null>(null);
const empty = ref(!model.value);

/** A point on the pad as a share of its width and height, so the strokes scale when the pad is resized. */
interface Point {
  x: number;
  y: number;
}
const strokes: Point[][] = [];
let current: Point[] | null = null;
/** A signature that came in through `v-model`: it cannot be replayed as strokes, so it is drawn beneath them. */
let base: HTMLImageElement | null = null;
/** The ink colour, read once when a stroke starts rather than on every move. */
let ink = "";
/** The last value this pad produced or took in, so the watcher can tell an outside change from its own. */
let known = model.value;

const width = () => canvas.value?.clientWidth || 320;

/** The image in one colour: the exported PNG is black, and the pad shows it in the ink of the page. */
function tinted(img: HTMLImageElement, color: string): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = img.naturalWidth;
  out.height = img.naturalHeight;
  const ctx = out.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, out.width, out.height);
  return out;
}

function paint(ctx: CanvasRenderingContext2D, color: string, w: number, h: number) {
  if (base) ctx.drawImage(tinted(base, color), 0, 0, w, h);
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  for (const stroke of strokes) {
    const [first, ...rest] = stroke;
    if (!first) continue;
    ctx.beginPath();
    ctx.arc(first.x * w, first.y * h, 1.2, 0, 6.3);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(first.x * w, first.y * h);
    for (const p of rest) ctx.lineTo(p.x * w, p.y * h);
    ctx.stroke();
  }
}

/** Sizes the bitmap to the element and draws everything again. */
function setup() {
  const cv = canvas.value;
  if (!cv) return;
  const dpr = window.devicePixelRatio || 1;
  cv.width = Math.round(width() * dpr);
  cv.height = Math.round(props.height * dpr);
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  paint(ctx, getComputedStyle(cv).color, width(), props.height);
}

async function load(url: string) {
  const img = new Image();
  img.src = url;
  try {
    await img.decode();
  } catch {
    return;
  }
  if (model.value !== url) return;
  strokes.length = 0;
  base = img;
  empty.value = false;
  setup();
}

onMounted(() => {
  setup();
  if (model.value) load(model.value);
});
useResizeObserver(canvas, setup);

function point(e: PointerEvent): Point {
  const r = canvas.value!.getBoundingClientRect();
  return { x: (e.clientX - r.left) / (r.width || 1), y: (e.clientY - r.top) / (r.height || 1) };
}

function down(e: PointerEvent) {
  if (props.disabled || props.readonly) return;
  e.preventDefault();
  try {
    canvas.value!.setPointerCapture(e.pointerId);
  } catch {}
  ink = getComputedStyle(canvas.value!).color;
  const p = point(e);
  current = [p];
  strokes.push(current);
  const ctx = canvas.value!.getContext("2d")!;
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(p.x * width(), p.y * props.height, 1.2, 0, 6.3);
  ctx.fill();
}

function move(e: PointerEvent) {
  if (!current) return;
  const from = current[current.length - 1]!;
  const p = point(e);
  current.push(p);
  const ctx = canvas.value!.getContext("2d")!;
  ctx.strokeStyle = ink;
  ctx.beginPath();
  ctx.moveTo(from.x * width(), from.y * props.height);
  ctx.lineTo(p.x * width(), p.y * props.height);
  ctx.stroke();
}

function exportImage(): string {
  const cv = canvas.value!;
  const out = document.createElement("canvas");
  out.width = cv.width;
  out.height = cv.height;
  const ctx = out.getContext("2d")!;
  ctx.scale(cv.width / width(), cv.height / props.height);
  paint(ctx, "black", width(), props.height);
  return out.toDataURL("image/png");
}

function up() {
  if (!current) return;
  current = null;
  empty.value = false;
  known = exportImage();
  model.value = known;
}

function wipe() {
  strokes.length = 0;
  current = null;
  base = null;
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
  known = "";
  model.value = "";
}

// A value set from outside is drawn on the pad; an empty one clears it.
watch(model, (v) => {
  if (v === known) return;
  known = v;
  if (!v) wipe();
  else load(v);
});

defineExpose({
  clear,
  canvas,
});
</script>

<template>
  <div class="e-pad">
    <div
      class="e-pad-surface"
      :data-empty="empty ? '' : undefined"
      :data-invalid="error ? '' : undefined"
      :data-readonly="readonly ? '' : undefined"
    >
      <canvas
        :id="id"
        ref="canvas"
        class="e-pad-canvas"
        role="img"
        :style="{ height: `${height}px`, color: 'var(--e-ink)' }"
        :aria-label="t('drawSignature')"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="[`${id}-hint`, error || hint ? `${id}-msg` : ''].filter(Boolean).join(' ')"
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
      <p :id="`${id}-hint`" class="e-field-hint">
        <span v-if="required" class="e-sr">{{ t("required") }}. </span>{{ t("signDrawHint") }}
      </p>
      <EButton variant="quiet" icon="eraser" :disabled="empty || disabled || readonly" @click="clear">
        {{ t("signClear") }}
      </EButton>
    </div>
    <EFieldMessage :id="`${id}-msg`" :error="error" :hint="hint" />
  </div>
</template>

<style>
@layer e.composites {
  .e-pad {
    display: grid;
    gap: var(--e-gap-snug);
  }

  .e-pad-surface {
    position: relative;
    overflow: hidden;
    border: var(--e-stroke-edge) solid var(--e-border-strong);
    border-radius: var(--e-radius-md);
    background: var(--e-surface);
    background-clip: padding-box;
    box-shadow: var(--e-well);
  }

  .e-pad-surface[data-invalid] {
    border-color: var(--e-danger);
  }

  .e-pad-surface::after {
    content: "";
    position: absolute;
    inset-inline: var(--e-space-4);
    bottom: calc(var(--e-space-8) + var(--e-space-1));
    border-bottom: var(--e-stroke-edge) solid var(--e-ink);
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
    gap: var(--e-gap-snug);
    color: var(--e-muted);
    font: var(--e-type-small);
    pointer-events: none;
  }

  .e-pad-foot {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--e-gap-snug) var(--e-gap-loose);
  }

  .e-pad-foot .e-field-hint {
    margin: 0;
    flex: 1 1 14rem;
  }
}
</style>
