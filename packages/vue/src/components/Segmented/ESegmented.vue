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
import { computed } from "vue";
import EIcon from "../Icon/EIcon.vue";
import EFieldMessage from "../Field/EFieldMessage.vue";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  /** Read by screen readers as the name of the group. */
  label: string;
  /** Two to five. A string is both value and label. */
  options: (string | SegmentedOption)[];
  /** Help under the control, linked with `aria-describedby`. */
  hint?: string;
  /** What to fix. Replaces the hint and is announced. */
  error?: string;
  disabled?: boolean;
  /** The name the radios share, submitted with a form. Generated when left out. */
  name?: string;
}>();

/** The active option's value. The first option when nothing is bound. */
const model = defineModel<string>();

const name = useUid(() => props.name);
const hintId = computed(() => `${name.value}-hint`);
const options = computed<SegmentedOption[]>(() =>
  props.options.map((o) => (typeof o === "string" ? { value: o, label: o } : o)),
);
const current = computed(() => model.value ?? options.value[0]?.value);
const attrs = useFieldAttrs();
const groupAttrs = () => ({
  role: "radiogroup",
  "aria-label": props.label,
  ...attrs.input(props.error || props.hint ? hintId.value : undefined),
});
</script>

<template>
  <div v-if="hint || error" class="e-seg-field" :class="attrs.wrapper().class" :style="attrs.wrapper().style">
    <div class="e-seg" v-bind="groupAttrs()">
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
  <div v-else class="e-seg" :class="attrs.wrapper().class" :style="attrs.wrapper().style" v-bind="groupAttrs()">
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
  .e-seg {
    display: inline-flex;
    height: var(--e-control-height);
    border: var(--e-stroke-edge) solid var(--e-border-strong);
    border-radius: var(--e-radius-md);
    background: var(--e-surface);
    overflow: hidden;
    max-width: 100%;
    width: fit-content;
  }

  .e-seg-opt {
    position: relative;
    display: inline-flex;
    cursor: pointer;
  }

  .e-seg-opt + .e-seg-opt {
    border-inline-start: var(--e-stroke-hair) solid var(--e-border-strong);
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
    min-width: 4rem;
    padding: 0 var(--e-space-4);
    font: 500 var(--e-text-md)/1 var(--e-font-sans);
    white-space: nowrap;
    transition: background-color var(--e-duration-tap) var(--e-easing-out);
  }

  .e-seg-opt:hover .e-seg-text {
    background: var(--e-surface-tint);
  }

  .e-seg-input:checked + .e-seg-text {
    background: var(--e-primary);
    color: var(--e-on-primary);
    font-weight: 600;
    box-shadow: inset 0 -2px 0 0 rgb(0 0 0 / 0.3);
  }

  .e-seg-input:focus-visible + .e-seg-text {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: -4px;
  }

  .e-seg-input:disabled + .e-seg-text {
    color: var(--e-muted);
    cursor: not-allowed;
  }

  .e-seg-field {
    display: grid;
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
