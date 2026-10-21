<script lang="ts">
import type { IconProp } from "../../icons/types.js";

export interface SegmentedOption {
  value: string;
  label: string;
  /** An icon before the label. */
  icon?: IconProp;
  disabled?: boolean;
}
</script>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import EIcon from "../Icon/EIcon.vue";
import EFieldMessage from "../Field/EFieldMessage.vue";
import { useMessages } from "../../config.js";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  /** Read by screen readers as the name of the group. */
  label: string;
  /** Two to five. A string is both value and label. `SegmentedOption` is `{ value, label, icon?, disabled? }`. */
  options: (string | SegmentedOption)[];
  /** Help under the control, linked with `aria-describedby`. */
  hint?: string;
  /** What to fix. Replaces the hint and is announced. */
  error?: string;
  /** Adds the word "Optional" to the group's accessible name; nothing is shown. Flag whichever is rarer. */
  optional?: boolean;
  /** Disables every option. */
  disabled?: boolean;
  /** The name the radios share, submitted with a form. @default generated */
  name?: string;
}>();

/** The active value. @default first option */
const model = defineModel<string>();

const t = useMessages();
const name = useUid(() => props.name);
const hintId = computed(() => `${name.value}-hint`);
const options = computed<SegmentedOption[]>(() =>
  props.options.map((o) => (typeof o === "string" ? { value: o, label: o } : o)),
);
const current = computed(() => model.value ?? options.value[0]?.value);
const attrs = useFieldAttrs();

const track = ref<HTMLElement | null>(null);

/** In a space too narrow for every option the track scrolls; keep the chosen one in view. */
async function reveal(smooth: boolean) {
  await nextTick();
  const el = track.value;
  const opt = el?.querySelector<HTMLElement>(".e-seg-input:checked")?.parentElement;
  if (!el || !opt || el.scrollWidth <= el.clientWidth) return;
  const calm = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const a = opt.getBoundingClientRect();
  const b = el.getBoundingClientRect();
  el.scrollBy({ left: a.left + a.width / 2 - (b.left + b.width / 2), behavior: smooth && !calm ? "smooth" : "auto" });
}

onMounted(() => reveal(false));
watch(current, () => reveal(true));
const groupAttrs = () => ({
  role: "radiogroup",
  "aria-label": props.optional ? `${props.label}, ${t("optional")}` : props.label,
  "aria-invalid": props.error ? ("true" as const) : undefined,
  ...attrs.input(props.error || props.hint ? hintId.value : undefined),
});
</script>

<template>
  <div v-if="hint || error" class="e-seg-field" :class="attrs.wrapper().class" :style="attrs.wrapper().style">
    <div ref="track" class="e-seg" v-bind="groupAttrs()">
      <label v-for="o in options" :key="o.value" class="e-seg-opt">
        <input
          type="radio"
          class="e-seg-input"
          :name="name"
          :value="o.value"
          :checked="current === o.value"
          :disabled="o.disabled || disabled"
          @change="model = o.value"
        />
        <span class="e-seg-text"><EIcon v-if="o.icon" :name="o.icon" />{{ o.label }}</span>
      </label>
    </div>
    <EFieldMessage :id="hintId" :error="error" :hint="hint" />
  </div>
  <div
    v-else
    ref="track"
    class="e-seg"
    :class="attrs.wrapper().class"
    :style="attrs.wrapper().style"
    v-bind="groupAttrs()"
  >
    <label v-for="o in options" :key="o.value" class="e-seg-opt">
      <input
        type="radio"
        class="e-seg-input"
        :name="name"
        :value="o.value"
        :checked="current === o.value"
        :disabled="o.disabled || disabled"
        @change="model = o.value"
      />
      <span class="e-seg-text"><EIcon v-if="o.icon" :name="o.icon" />{{ o.label }}</span>
    </label>
  </div>
</template>

<style>
@layer e.controls {
  /* A pressed-in track. The chosen option fills its cell edge to edge in the primary colour, covering the track's outline there so the outline turns primary where it is chosen, and the track clips it, so only the pieces at either end take the track's rounded corners: a value you set, not a place you go (that is Tabs). With too many options for the space the track scrolls sideways, with no bar, while its outline stays put. */
  .e-seg {
    display: inline-flex;
    box-sizing: border-box;
    height: var(--e-control-height);
    position: relative;
    border-radius: var(--e-radius-md);
    background: var(--e-surface-tint);
    box-shadow:
      inset 0 0 0 var(--e-stroke-edge) var(--e-border-strong),
      var(--e-well);
    /* stylelint-disable-next-line declaration-block-no-redundant-longhand-properties -- the two axes are set apart: sideways scrolls, the rest is clipped */
    overflow-x: auto;
    overflow-y: hidden;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
    max-width: 100%;
    width: fit-content;
  }

  .e-seg::-webkit-scrollbar {
    display: none;
  }

  .e-seg-opt {
    position: relative;
    display: inline-flex;
    flex: none;
    cursor: pointer;
  }

  .e-seg-input {
    position: absolute;
    inset: 0;
    opacity: 0;
    margin: 0;
    cursor: pointer;
  }

  .e-seg-text {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--e-space-2);
    box-sizing: border-box;
    min-width: 4rem;
    padding: 0 var(--e-space-4);
    background: transparent;
    color: var(--e-ink);
    font: 500 var(--e-text-md)/1 var(--e-font-sans);
    white-space: nowrap;
    transition: background-color var(--e-duration-tap) var(--e-easing-out);
  }

  .e-seg-opt:hover .e-seg-text {
    background: var(--e-wash-hover);
  }

  .e-seg-input:checked + .e-seg-text,
  .e-seg-opt:hover .e-seg-input:checked + .e-seg-text {
    background-color: var(--e-primary);

    /* The darker band along the bottom is the slab, drawn inside the piece and the track clips it to the corners. */
    background-image: linear-gradient(
      to top,
      color-mix(in srgb, var(--e-primary), var(--e-shade-slab)) calc(1.5 * var(--e-depth)),
      transparent calc(1.5 * var(--e-depth))
    );
    color: var(--e-on-primary);
    font-weight: 600;
  }

  .e-seg-input:focus-visible + .e-seg-text {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: calc(-1 * var(--e-space-1));
  }

  .e-seg-input:disabled + .e-seg-text {
    color: var(--e-muted);
    cursor: not-allowed;
  }

  .e-seg-opt:has(:disabled):hover .e-seg-text {
    background: transparent;
  }

  /* Chosen but unavailable: a flat piece with ink text, so it stays readable. */
  .e-seg-input:disabled:checked + .e-seg-text,
  .e-seg-opt:has(:disabled:checked):hover .e-seg-text {
    background-color: var(--e-surface);
    background-image: none;
    outline: var(--e-stroke-edge) solid var(--e-border-strong);
    outline-offset: calc(-1 * var(--e-stroke-edge));
    color: var(--e-ink);
  }

  .e-seg-field {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--e-space-2);
  }

  @media (prefers-reduced-motion: reduce) {
    .e-seg-text {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .e-seg-input:checked + .e-seg-text {
      forced-color-adjust: none;
      background: Highlight;
      color: HighlightText;
    }
  }
}
</style>
