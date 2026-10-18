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
import EFieldset from "../Fieldset/EFieldset.vue";
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
  <EFieldset
    :id="`${name}-fs`"
    bare
    class="e-slots"
    legend-class-name="e-slots-legend"
    :legend="label"
    :hint="hint"
    :error="error"
    :required="required"
    :disabled="disabled"
  >
    <div v-if="options.length" class="e-slots-grid">
      <label v-for="o in options" :key="o.value" class="e-slot" :class="{ 'e-slot--off': o.disabled }">
        <input
          type="radio"
          class="e-slot-input"
          :name="name"
          :value="o.value"
          :checked="model === o.value"
          :disabled="o.disabled"
          :required="required"
          @change="model = o.value"
        />
        <span class="e-slot-text">{{ o.label }}</span>
      </label>
    </div>
    <p v-else class="e-field-hint">{{ emptyText || t("noTimes") }}</p>
  </EFieldset>
</template>

<style>
@layer e.controls {
  .e-slots {
    display: grid;
    gap: var(--e-space-2);
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .e-slots-legend {
    padding: 0;
  }

  .e-slots-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(6.5rem, 1fr));
    gap: var(--e-space-2);
  }

  .e-slot {
    position: relative;
    display: block;
  }

  .e-slot-input {
    position: absolute;
    inset: 0;
    opacity: 0;
    margin: 0;
    cursor: pointer;
  }

  .e-slot-text {
    display: grid;
    place-items: center;
    height: var(--e-control-height);
    border: var(--e-stroke-edge) solid var(--e-border-strong);
    border-radius: var(--e-radius-md);
    background: var(--e-surface);
    font: 500 var(--e-text-sm)/1 var(--e-font-mono);
    font-variant-numeric: tabular-nums;
    transition:
      background-color var(--e-duration-tap) var(--e-easing-out),
      border-color var(--e-duration-tap) var(--e-easing-out);
  }

  .e-slot:hover .e-slot-text {
    background: var(--e-surface-tint);
    border-color: var(--e-ink);
  }

  .e-slot-input:checked + .e-slot-text {
    background: var(--e-primary);
    border-color: var(--e-primary);
    color: var(--e-on-primary);
    font-weight: 600;
    box-shadow: inset 0 -2px 0 0 rgb(0 0 0 / 0.3);
  }

  .e-slot-input:focus-visible + .e-slot-text {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-focus-gap);
  }

  .e-slot--off .e-slot-text {
    border-style: dashed;
    color: var(--e-muted);
    text-decoration: line-through;
    background: var(--e-surface-tint);
    cursor: not-allowed;
  }

  .e-slot--off:hover .e-slot-text {
    border-color: var(--e-border-strong);
  }
}
</style>
