<script lang="ts">
export interface SlotOption {
  value: string;
  label: string;
  /** A taken time: dashed and struck through, and not selectable. */
  disabled?: boolean;
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import AeFieldset from "../Fieldset/AeFieldset.vue";
import { useMessages } from "../../config.js";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";

const props = defineProps<{
  /** The question the times answer, usually the day. Names the group for screen readers. */
  label: string;
  /** The times. A string is both value and label. */
  slots: (string | SlotOption)[];
  /** Shown when the day has no times. Default "No times are open on this day." */
  emptyText?: string;
  /** Help that is announced with the group. */
  hint?: string;
  /** What to fix. Replaces the hint and is announced with the group. */
  error?: string;
  /** The `required` attribute and the word "Required". */
  required?: boolean;
  /** Disables every time. */
  disabled?: boolean;
  /** The name the radios share, submitted with a form. Generated when left out. */
  name?: string;
}>();

/** The chosen time's value, or `null` when none is chosen. */
const model = defineModel<string | null>({ default: null });

const t = useMessages();
const name = useUid(() => props.name);
const options = computed<SlotOption[]>(() =>
  props.slots.map((s) => (typeof s === "string" ? { value: s, label: s } : s)),
);
</script>

<template>
  <AeFieldset
    :id="`${name}-fs`"
    bare
    class="ae-slots"
    legend-class-name="ae-slots-legend"
    :legend="label"
    :hint="hint"
    :error="error"
    :required="required"
    :disabled="disabled"
  >
    <div v-if="options.length" class="ae-slots-grid">
      <label v-for="o in options" :key="o.value" class="ae-slot" :class="{ 'ae-slot--off': o.disabled }">
        <input
          type="radio"
          class="ae-slot-input"
          :name="name"
          :value="o.value"
          :checked="model === o.value"
          :disabled="o.disabled"
          :required="required"
          @change="model = o.value"
        />
        <span class="ae-slot-text">{{ o.label }}</span>
      </label>
    </div>
    <p v-else class="ae-field-hint">{{ emptyText || t("noTimes") }}</p>
  </AeFieldset>
</template>

<style>
@layer ae.controls {
  .ae-slots {
    display: grid;
    gap: var(--ae-space-2);
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .ae-slots-legend {
    padding: 0;
  }

  .ae-slots-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(6.5rem, 1fr));
    gap: var(--ae-space-2);
  }

  .ae-slot {
    position: relative;
    display: block;
  }

  .ae-slot-input {
    position: absolute;
    inset: 0;
    opacity: 0;
    margin: 0;
    cursor: pointer;
  }

  .ae-slot-text {
    display: grid;
    place-items: center;
    height: var(--ae-control-height);
    border: var(--ae-stroke-edge) solid var(--ae-border-strong);
    border-radius: var(--ae-radius-md);
    background: var(--ae-surface);
    font: 500 var(--ae-text-sm)/1 var(--ae-font-mono);
    font-variant-numeric: tabular-nums;
    transition:
      background-color var(--ae-duration-tap) var(--ae-easing-out),
      border-color var(--ae-duration-tap) var(--ae-easing-out);
  }

  .ae-slot:hover .ae-slot-text {
    background: var(--ae-surface-tint);
    border-color: var(--ae-ink);
  }

  .ae-slot-input:checked + .ae-slot-text {
    background: var(--ae-primary);
    border-color: var(--ae-primary);
    color: var(--ae-on-primary);
    font-weight: 600;
    box-shadow: inset 0 -2px 0 0 rgb(0 0 0 / 0.3);
  }

  .ae-slot-input:focus-visible + .ae-slot-text {
    outline: var(--ae-stroke-focus) solid var(--ae-focus-ring);
    outline-offset: var(--ae-focus-gap);
  }

  .ae-slot--off .ae-slot-text {
    border-style: dashed;
    color: var(--ae-muted);
    text-decoration: line-through;
    background: var(--ae-surface-tint);
    cursor: not-allowed;
  }

  .ae-slot--off:hover .ae-slot-text {
    border-color: var(--ae-border-strong);
  }
}
</style>
