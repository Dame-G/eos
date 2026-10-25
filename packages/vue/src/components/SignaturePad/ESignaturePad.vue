<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import EIcon from "../Icon/EIcon.vue";
import EButton from "../Button/EButton.vue";
import EFieldFlag from "../Field/EFieldFlag.vue";
import EFieldMessage from "../Field/EFieldMessage.vue";
import { useMessages } from "../../config.js";
import { useUid } from "../../composables/useUid.js";
import { useFormField } from "../../composables/useFormField.js";
import { missingMessage } from "../Form/missing.js";
import "../../styles/base.css";
import "../../styles/controls/label.css";

const props = withDefaults(
  defineProps<{
    /** A label shown above the pad, which also names it. Without one the pad is named "Draw your signature" and no label shows. */
    label?: string;
    /** Hides the label from the page and keeps it for screen readers. */
    hideLabel?: boolean;
    /** The height of the drawing area: a number of pixels or a CSS length such as `"10rem"`. */
    height?: number | string;
    /** Help that stays under the pad. */
    hint?: string;
    /** What to fix. Replaces the hint, gives the pad a danger edge, is announced and describes the pad. An image has no `aria-invalid`. */
    error?: string;
    /** Adds "Required" beside the label, or to what screen readers hear with the pad. An `EForm` around it stops the submit while the pad is empty; a plain form does not, so check the value. */
    required?: boolean;
    /** Shows "Optional" beside the label, or adds it to what screen readers hear. Only the rarer of required and optional needs a flag. */
    optional?: boolean;
    /** Ignores drawing and disables Clear. A disabled pad posts nothing. */
    disabled?: boolean;
    /** Shows the signature but ignores drawing and disables Clear. */
    readonly?: boolean;
    /** The name the PNG data URL is submitted under with a form, through a hidden input. */
    name?: string;
    /** The id of the canvas. @default generated */
    id?: string;
  }>(),
  { height: 160 },
);

/** A PNG data URL (black on transparent). Empty while clear. Setting `""` clears the pad. */
const model = defineModel<string>({ default: "" });

/** The width of a stroke and the radius of a dot (a tap with no movement), in CSS pixels. */
const LINE_WIDTH = 2.5;
const DOT_RADIUS = 1.2;
/** The exported image is at most this many pixels per CSS pixel: sharp enough to print, without a 3x phone's weight. */
const EXPORT_SCALE_MAX = 2;

const t = useMessages();
const id = useUid(() => props.id);
const canvas = ref<HTMLCanvasElement | null>(null);
const empty = ref(!model.value);
const accessibleName = computed(() => props.label || t("drawSignature"));
// A canvas is no form control: the pad tells the EForm around it about its error, and that it is required and empty.
useFormField({
  id: () => id.value,
  label: () => accessibleName.value,
  error: () => props.error,
  check: () =>
    props.required && !props.disabled && !props.readonly && !model.value
      ? missingMessage("text", t("required"))
      : undefined,
});

/** A point on the pad as a share of its width and height, so the strokes scale when the pad is resized. */
interface Point {
  x: number;
  y: number;
}
const strokes: Point[][] = [];
let current: Point[] | null = null;
/** A signature that came in through `v-model`: it cannot be replayed as strokes, so it is drawn beneath them. */
let base: HTMLImageElement | null = null;
/** The base image in the ink of the page, made once per image and colour rather than on every repaint. */
let tint: { img: HTMLImageElement; color: string; canvas: HTMLCanvasElement } | null = null;
/** The ink colour, read once when a stroke starts rather than on every move. */
let ink = "";
/** The last value this pad produced or took in, so the watcher can tell an outside change from its own. */
let known = model.value;

const cssHeight = computed(() => (typeof props.height === "number" ? `${props.height}px` : props.height));
const width = () => canvas.value?.clientWidth || 320;
const height = () => canvas.value?.clientHeight || (typeof props.height === "number" ? props.height : 160);

/** The image in one colour: the exported PNG is black, and the pad shows it in the ink of the page. */
function tinted(img: HTMLImageElement, color: string): HTMLCanvasElement {
  if (tint && tint.img === img && tint.color === color) return tint.canvas;
  const out = document.createElement("canvas");
  out.width = img.naturalWidth;
  out.height = img.naturalHeight;
  const ctx = out.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, out.width, out.height);
  tint = { img, color, canvas: out };
  return out;
}

function paint(ctx: CanvasRenderingContext2D, color: string, w: number, h: number, tintBase = true) {
  if (base) ctx.drawImage(tintBase ? tinted(base, color) : base, 0, 0, w, h);
  ctx.lineWidth = LINE_WIDTH;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  for (const stroke of strokes) {
    const [first, ...rest] = stroke;
    if (!first) continue;
    ctx.beginPath();
    ctx.arc(first.x * w, first.y * h, DOT_RADIUS, 0, 2 * Math.PI);
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
  cv.height = Math.round(height() * dpr);
  const ctx = cv.getContext("2d");
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  paint(ctx, getComputedStyle(cv).color, width(), height());
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

let resize: ResizeObserver | undefined;
onMounted(() => {
  setup();
  if (model.value) load(model.value);
  if (typeof ResizeObserver !== "undefined" && canvas.value) {
    resize = new ResizeObserver(setup);
    resize.observe(canvas.value);
  }
});
onBeforeUnmount(() => resize?.disconnect());

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
  ctx.arc(p.x * width(), p.y * height(), DOT_RADIUS, 0, 2 * Math.PI);
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
  ctx.moveTo(from.x * width(), from.y * height());
  ctx.lineTo(p.x * width(), p.y * height());
  ctx.stroke();
}

/** One canvas for every export, so a stroke does not allocate a new one. */
let exportCanvas: HTMLCanvasElement | null = null;
function exportImage(): string {
  const scale = Math.min(window.devicePixelRatio || 1, EXPORT_SCALE_MAX);
  exportCanvas ??= document.createElement("canvas");
  const out = exportCanvas;
  out.width = Math.round(width() * scale);
  out.height = Math.round(height() * scale);
  const ctx = out.getContext("2d")!;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  // The base is black already: drawn untinted, it needs no tinted copy.
  paint(ctx, "black", width(), height(), false);
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
  tint = null;
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

// The ink dims while disabled, so the strokes are drawn again in it.
watch(() => props.disabled, setup, { flush: "post" });

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
    <span v-if="label" :id="`${id}-label`" class="e-field-label e-kicker" :class="{ 'e-sr': hideLabel }">
      {{ label }}
      <EFieldFlag :required="required" :optional="optional" />
    </span>
    <div
      class="e-pad-surface"
      :data-empty="empty ? '' : undefined"
      :data-invalid="error ? '' : undefined"
      :data-readonly="readonly ? '' : undefined"
      :data-disabled="disabled ? '' : undefined"
    >
      <canvas
        :id="id"
        ref="canvas"
        class="e-pad-canvas"
        role="img"
        :style="{ height: cssHeight, color: disabled ? 'var(--e-disabled-ink)' : 'var(--e-ink)' }"
        :aria-label="label ? undefined : accessibleName"
        :aria-labelledby="label ? `${id}-label` : undefined"
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
        <span v-if="!label && (required || optional)" class="e-sr">{{ t(required ? "required" : "optional") }}. </span
        >{{ t("signDrawHint") }}
      </p>
      <EButton variant="quiet" icon="eraser" :disabled="empty || disabled || readonly" @click="clear">
        {{ t("signClear") }}
      </EButton>
    </div>
    <EFieldMessage :id="`${id}-msg`" :error="error" :hint="hint" />
    <input v-if="name" type="hidden" :name="name" :value="model" :disabled="disabled || undefined" />
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

  /* Read-only and disabled look as a field's do: read-only loses the well on a tinted face; disabled draws the dashed edge on the disabled fill, its ink dimmed. */
  .e-pad-surface[data-readonly]:not([data-disabled]) {
    background: var(--e-surface-tint);
    box-shadow: none;
  }

  .e-pad-surface[data-disabled] {
    outline: var(--e-stroke-edge) dashed var(--e-border-strong);
    outline-offset: calc(-1 * var(--e-stroke-edge));
    border-color: transparent;
    background: var(--e-disabled-fill);
    box-shadow: none;
  }

  .e-pad-surface[data-readonly] .e-pad-canvas {
    cursor: default;
  }

  .e-pad-surface[data-disabled] .e-pad-canvas {
    cursor: not-allowed;
  }

  .e-pad-surface::after {
    content: "";
    position: absolute;
    inset-inline: var(--e-space-4);
    bottom: calc(var(--e-space-8) + var(--e-space-1));
    border-bottom: var(--e-stroke-edge) solid var(--e-ink);
    pointer-events: none;
  }

  .e-pad-surface[data-disabled]::after {
    border-bottom-color: var(--e-disabled-ink);
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

  .e-pad-surface[data-disabled] .e-pad-placeholder {
    color: var(--e-disabled-ink);
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
