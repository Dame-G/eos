<script setup lang="ts">
import { computed } from "vue";
import EFieldFlag from "../Field/EFieldFlag.vue";
import EFieldMessage from "../Field/EFieldMessage.vue";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";

const props = defineProps<{
  /** The question the controls answer. Names the group for screen readers. */
  legend?: string;
  /** No box: the legend becomes a small mono label above the controls (RadioGroup, SlotPicker). */
  bare?: boolean;
  /** Help that is announced with the group. */
  hint?: string;
  /** What to fix. Replaces the hint and is announced with the group. */
  error?: string;
  /** A word at the end of the legend. */
  required?: boolean;
  /** A word at the end of the legend. Flag whichever is rarer. */
  optional?: boolean;
  /** Disables every control inside. */
  disabled?: boolean;
  /** Extra classes for the legend. */
  legendClassName?: string;
  /** The id the hint and error ids are built from. Generated when left out. */
  id?: string;
}>();

defineSlots<{
  /** The controls. */
  default(): unknown;
}>();

const id = useUid(() => props.id);
const hintId = computed(() => `${id.value}-hint`);
</script>

<template>
  <fieldset
    class="e-fieldset"
    :class="{ 'e-fieldset--box': !bare }"
    :disabled="disabled"
    :aria-describedby="error || hint ? hintId : undefined"
    :aria-invalid="error ? 'true' : undefined"
  >
    <legend v-if="legend" class="e-fieldset-legend" :class="[bare && 'e-kicker', legendClassName]">
      <span class="e-fieldset-title">{{ legend }}</span>
      <span v-if="!bare" class="e-fieldset-rule" aria-hidden="true" />
      <EFieldFlag :required="required" :optional="optional" />
    </legend>
    <template v-if="bare">
      <slot />
      <EFieldMessage :id="hintId" :error="error" :hint="hint" />
    </template>
    <div v-else class="e-fieldset-body">
      <slot />
      <EFieldMessage :id="hintId" :error="error" :hint="hint" />
    </div>
  </fieldset>
</template>

<style>
@layer e.controls {
  .e-fieldset {
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .e-fieldset-legend {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--e-space-3);
    width: 100%;
    padding: 0;
  }

  .e-fieldset:not(.e-fieldset--box) > .e-fieldset-legend {
    float: inline-start;
    margin-bottom: var(--e-space-2);
  }

  .e-fieldset:not(.e-fieldset--box) > .e-fieldset-legend + * {
    clear: both;
  }

  .e-fieldset--box {
    padding: 0 var(--e-space-4) var(--e-space-4);
    border: var(--e-stroke-hair) solid var(--e-border);
    border-radius: var(--e-radius-md);
    background: var(--e-surface);
  }

  .e-fieldset--box > .e-fieldset-legend {
    align-items: center;
    gap: 0;
    font: 500 var(--e-text-md)/1.3 var(--e-font-sans);
    letter-spacing: 0;
    text-transform: none;
    color: var(--e-ink);
  }

  .e-fieldset--box .e-fieldset-title,
  .e-fieldset--box .e-field-flag {
    padding-inline: var(--e-space-3);
  }

  .e-fieldset-rule {
    flex: 1;
    min-width: var(--e-space-4);
    border-top: var(--e-stroke-hair) solid var(--e-border);
  }

  .e-fieldset-body {
    display: grid;
    gap: var(--e-space-4);
    padding-top: var(--e-space-1);
  }

  .e-fieldset:not(.e-slots) > .e-field-hint,
  .e-fieldset:not(.e-slots) > .e-field-error {
    margin-top: -6px;
  }

  .e-fieldset-body > .e-field-hint,
  .e-fieldset-body > .e-field-error {
    margin-top: calc(var(--e-space-4) * -1 + var(--e-space-2));
  }
}
</style>
