<script setup lang="ts">
import { computed } from "vue";
import AeFieldFlag from "../Field/AeFieldFlag.vue";
import AeFieldMessage from "../Field/AeFieldMessage.vue";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";

const props = defineProps<{
  /** The question the controls answer. Names the group for screen readers. */
  legend?: string;
  /** No box: the legend becomes a small mono label above the controls (RadioGroup, TimeSlots). */
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
    class="ae-fieldset"
    :class="{ 'ae-fieldset--box': !bare }"
    :disabled="disabled"
    :aria-describedby="error || hint ? hintId : undefined"
    :aria-invalid="error ? 'true' : undefined"
  >
    <legend v-if="legend" class="ae-fieldset-legend" :class="[bare && 'ae-kicker', legendClassName]">
      <span class="ae-fieldset-title">{{ legend }}</span>
      <span v-if="!bare" class="ae-fieldset-rule" aria-hidden="true" />
      <AeFieldFlag :required="required" :optional="optional" />
    </legend>
    <template v-if="bare">
      <slot />
      <AeFieldMessage :id="hintId" :error="error" :hint="hint" />
    </template>
    <div v-else class="ae-fieldset-body">
      <slot />
      <AeFieldMessage :id="hintId" :error="error" :hint="hint" />
    </div>
  </fieldset>
</template>

<style>
@layer ae.controls {
  .ae-fieldset {
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .ae-fieldset-legend {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--ae-space-3);
    width: 100%;
    padding: 0;
  }

  .ae-fieldset:not(.ae-fieldset--box) > .ae-fieldset-legend {
    float: inline-start;
    margin-bottom: var(--ae-space-2);
  }

  .ae-fieldset:not(.ae-fieldset--box) > .ae-fieldset-legend + * {
    clear: both;
  }

  .ae-fieldset--box {
    padding: 0 var(--ae-space-4) var(--ae-space-4);
    border: var(--ae-stroke-hair) solid var(--ae-border);
    border-radius: var(--ae-radius-md);
    background: var(--ae-surface);
  }

  .ae-fieldset--box > .ae-fieldset-legend {
    align-items: center;
    gap: 0;
    font: 500 var(--ae-text-md)/1.3 var(--ae-font-sans);
    letter-spacing: 0;
    text-transform: none;
    color: var(--ae-ink);
  }

  .ae-fieldset--box .ae-fieldset-title,
  .ae-fieldset--box .ae-field-flag {
    padding-inline: var(--ae-space-3);
  }

  .ae-fieldset-rule {
    flex: 1;
    min-width: var(--ae-space-4);
    border-top: var(--ae-stroke-hair) solid var(--ae-border);
  }

  .ae-fieldset-body {
    display: grid;
    gap: var(--ae-space-4);
    padding-top: var(--ae-space-1);
  }

  .ae-fieldset:not(.ae-slots) > .ae-field-hint,
  .ae-fieldset:not(.ae-slots) > .ae-field-error {
    margin-top: -6px;
  }

  .ae-fieldset-body > .ae-field-hint,
  .ae-fieldset-body > .ae-field-error {
    margin-top: calc(var(--ae-space-4) * -1 + var(--ae-space-2));
  }
}
</style>
