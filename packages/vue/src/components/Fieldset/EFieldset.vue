<script setup lang="ts">
import { computed } from "vue";
import EFieldFlag from "../Field/EFieldFlag.vue";
import EFieldMessage from "../Field/EFieldMessage.vue";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";

const props = defineProps<{
  /** The question the controls answer. Names the group for screen readers. */
  legend?: string;
  /** No box: the legend becomes a small mono label above the controls (RadioGroup). */
  bare?: boolean;
  /** Help that is announced with the group. */
  hint?: string;
  /** What to fix. Replaces the hint and is announced with the group. */
  error?: string;
  /** "Required" at the end of the legend: at the right end of the line where the box's outline runs through the title. */
  required?: boolean;
  /** A word at the end of the legend, placed like `required`. Flag whichever is rarer. */
  optional?: boolean;
  /** A titled form section: no box, a larger legend ruled off from what comes before, and the hint under the legend. Replaces `EFormSection`. */
  section?: boolean;
  /** Disables every control inside. */
  disabled?: boolean;
  /** Extra classes for the legend. */
  legendClass?: string;
  /** Keep the legend for screen readers and remove it from the page. */
  hideLegend?: boolean;
  /** The id the hint and error ids are built from. @default generated */
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
    :class="{ 'e-fieldset--box': !bare && !section, 'e-fieldset--section': section }"
    :disabled="disabled"
    :aria-describedby="error || hint ? hintId : undefined"
    :aria-invalid="error ? 'true' : undefined"
  >
    <legend
      v-if="legend"
      class="e-fieldset-legend"
      :class="[bare && 'e-kicker', hideLegend && 'e-fieldset-legend--hidden', legendClass]"
    >
      <span class="e-fieldset-title">{{ legend }}</span>
      <span v-if="!bare && !section" class="e-fieldset-rule" aria-hidden="true" />
      <EFieldFlag :required="required" :optional="optional" />
    </legend>
    <div v-if="section" class="e-fieldset-body">
      <EFieldMessage v-if="!error" :id="hintId" :hint="hint" />
      <slot />
      <EFieldMessage v-if="error" :id="hintId" :error="error" />
    </div>
    <template v-else-if="bare">
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

  .e-fieldset-legend--hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .e-fieldset:not(.e-fieldset--box, .e-fieldset--section) > .e-fieldset-legend {
    float: inline-start;
    margin-bottom: var(--e-space-2);
  }

  .e-fieldset:not(.e-fieldset--box, .e-fieldset--section) > .e-fieldset-legend + * {
    clear: both;
  }

  /* The ring is the outline alone: a native fieldset border is broken around its legend, so pairing it with the overlay painted a second, unbroken line. The legend straddles the ring and its own surface background breaks the line instead. */
  .e-fieldset--box {
    padding: 0 var(--e-space-4) var(--e-space-4);
    border: 0;

    --e-bc: var(--e-border);

    outline: var(--e-stroke-hair) solid var(--e-bc);
    outline-offset: calc(-1 * var(--e-stroke-hair));
    border-radius: var(--e-radius-md);
    background: var(--e-surface);
  }

  .e-fieldset--box > .e-fieldset-legend {
    position: relative;
    align-items: center;
    gap: 0;
    width: calc(100% + var(--e-space-4));
    inset-block-start: -0.65em;
    margin: 0 0 var(--e-space-3) calc(-1 * var(--e-space-2));
    font: 500 var(--e-text-md)/1.3 var(--e-font-sans);
    letter-spacing: 0;
    text-transform: none;
    color: var(--e-ink);
  }

  /* The title and the Required or Optional word each break the outline on their own surface, the title at the left and the word always at the right end of the line, with the outline running between them. */
  .e-fieldset--box .e-fieldset-title,
  .e-fieldset--box .e-field-flag {
    padding-inline: var(--e-space-2);
    background: var(--e-surface);
  }

  .e-fieldset--box .e-fieldset-rule {
    flex: 1 1 var(--e-space-2);
    width: auto;
    min-width: var(--e-space-2);
  }

  /* The rule is the legend's own border, never a native fieldset border (which would break around the legend). */
  .e-fieldset--section > .e-fieldset-legend {
    display: block;
    padding-top: var(--e-space-6);
    border-top: var(--e-stroke-hair) solid var(--e-border);
    font: 500 var(--e-text-xl)/1.25 var(--e-font-sans);
    color: var(--e-ink);
  }

  .e-fieldset--section:first-child > .e-fieldset-legend {
    padding-top: 0;
    border-top: 0;
  }

  .e-fieldset--section > .e-fieldset-legend .e-fieldset-title {
    padding: 0;
  }

  .e-fieldset--section > .e-fieldset-body {
    padding-top: var(--e-space-4);
  }

  .e-fieldset--section > .e-fieldset-body > .e-field-hint {
    margin-top: calc(var(--e-space-4) * -1 + var(--e-space-1));
    max-width: var(--e-measure);
  }

  .e-fieldset-rule {
    flex: none;
    width: var(--e-space-2);
  }

  .e-fieldset-body {
    display: grid;
    gap: var(--e-space-4);
    padding-top: var(--e-space-1);
  }

  .e-fieldset > .e-field-hint,
  .e-fieldset > .e-field-error {
    margin-top: -6px;
  }

  .e-fieldset-body > .e-field-hint,
  .e-fieldset-body > .e-field-error {
    margin-top: calc(var(--e-space-4) * -1 + var(--e-space-2));
  }
}
</style>
