<script lang="ts">
import type { IconName } from "../../icons/phosphor.js";

export interface SegmentedOption {
  value: string;
  label: string;
  /** An icon before the label. */
  icon?: IconName | (string & {});
  disabled?: boolean;
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import AeIcon from "../Icon/AeIcon.vue";
import AeFieldMessage from "../Field/AeFieldMessage.vue";
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
  <div v-if="hint || error" class="ae-seg-field" :class="attrs.wrapper().class" :style="attrs.wrapper().style">
    <div class="ae-seg" v-bind="groupAttrs()">
      <label v-for="o in options" :key="o.value" class="ae-seg-opt">
        <input
          type="radio"
          class="ae-seg-input"
          :name="name"
          :value="o.value"
          :checked="current === o.value"
          :disabled="o.disabled || disabled"
          @change="model = o.value"
        />
        <span class="ae-seg-text"><AeIcon v-if="o.icon" :name="o.icon" />{{ o.label }}</span>
      </label>
    </div>
    <AeFieldMessage :id="hintId" :error="error" :hint="hint" />
  </div>
  <div v-else class="ae-seg" :class="attrs.wrapper().class" :style="attrs.wrapper().style" v-bind="groupAttrs()">
    <label v-for="o in options" :key="o.value" class="ae-seg-opt">
      <input
        type="radio"
        class="ae-seg-input"
        :name="name"
        :value="o.value"
        :checked="current === o.value"
        :disabled="o.disabled || disabled"
        @change="model = o.value"
      />
      <span class="ae-seg-text"><AeIcon v-if="o.icon" :name="o.icon" />{{ o.label }}</span>
    </label>
  </div>
</template>

<style>
@layer ae.controls {
  .ae-seg {
    display: inline-flex;
    height: var(--ae-control-height);
    border: var(--ae-stroke-edge) solid var(--ae-border-strong);
    border-radius: var(--ae-radius-md);
    background: var(--ae-surface);
    overflow: hidden;
    max-width: 100%;
    width: fit-content;
  }

  .ae-seg-opt {
    position: relative;
    display: inline-flex;
    cursor: pointer;
  }

  .ae-seg-opt + .ae-seg-opt {
    border-inline-start: var(--ae-stroke-hair) solid var(--ae-border-strong);
  }

  .ae-seg-input {
    position: absolute;
    inset: 0;
    opacity: 0;
    margin: 0;
    cursor: pointer;
  }

  .ae-seg-text {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--ae-space-2);
    min-width: 4rem;
    padding: 0 var(--ae-space-4);
    font: 500 var(--ae-text-md)/1 var(--ae-font-sans);
    white-space: nowrap;
    transition: background-color var(--ae-duration-tap) var(--ae-easing-out);
  }

  .ae-seg-opt:hover .ae-seg-text {
    background: var(--ae-surface-tint);
  }

  .ae-seg-input:checked + .ae-seg-text {
    background: var(--ae-primary);
    color: var(--ae-on-primary);
    font-weight: 600;
    box-shadow: inset 0 -2px 0 0 rgb(0 0 0 / 0.3);
  }

  .ae-seg-input:focus-visible + .ae-seg-text {
    outline: var(--ae-stroke-focus) solid var(--ae-focus-ring);
    outline-offset: -4px;
  }

  .ae-seg-input:disabled + .ae-seg-text {
    color: var(--ae-muted);
    cursor: not-allowed;
  }

  .ae-seg-field {
    display: grid;
    gap: var(--ae-space-2);
  }

  @media (prefers-reduced-motion: reduce) {
    .ae-seg-text {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .ae-seg-input:checked + .ae-seg-text {
      forced-color-adjust: none;
      background: Highlight;
      color: HighlightText;
    }
  }
}
</style>
