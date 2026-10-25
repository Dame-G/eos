<script setup lang="ts">
import { computed, useAttrs } from "vue";
import EFieldFlag from "../Field/EFieldFlag.vue";
import EFieldMessage from "../Field/EFieldMessage.vue";
import { isProduction } from "../../env.js";
import { useUid } from "../../composables/useUid.js";
import { useFormField } from "../../composables/useFormContext.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The question the controls answer. Names the group for screen readers. A group without one needs an `aria-label` or `aria-labelledby`, and warns in development when it has none. */
    legend?: string;
    /** How the group is drawn: `box` outlines it with the legend on the line, `plain` shows the legend as a label above the controls (as `ERadioGroup` does), `section` is a titled form section with a rule above and the hint under the title. */
    variant?: "box" | "plain" | "section";
    /** Help that is announced with the group. */
    hint?: string;
    /** What to fix. Replaces the hint and is announced with the group. */
    error?: string;
    /** Shows "Required" at the end of the legend. */
    required?: boolean;
    /** Shows "Optional" at the end of the legend. Only the rarer of required and optional needs a flag. */
    optional?: boolean;
    /** Disables every control inside. */
    disabled?: boolean;
    /** Classes added to the legend. */
    legendClass?: string;
    /** Hides the legend from the page and keeps it for screen readers. */
    hideLegend?: boolean;
    /** The id of the `fieldset`, which an `EForm` summary links to. The hint and error ids are built from it. @default generated */
    id?: string;
  }>(),
  { variant: "box" },
);

defineSlots<{
  /** The controls. */
  default(): unknown;
}>();

const id = useUid(() => props.id);
const box = computed(() => props.variant === "box");
const plain = computed(() => props.variant === "plain");
const section = computed(() => props.variant === "section");
const hintId = computed(() => `${id.value}-hint`);

const attrs = useAttrs();
// The group's error is listed in the summary of the EForm around it, linked to the group.
useFormField({
  id: () => id.value,
  label: () => props.legend || (attrs["aria-label"] as string | undefined) || "",
  error: () => props.error,
});
if (!props.legend && !attrs["aria-label"] && !attrs["aria-labelledby"] && !isProduction()) {
  console.warn("[eos] EFieldset has no name. Give it a `legend`, or an `aria-label` or `aria-labelledby`.");
}
</script>

<template>
  <fieldset
    :id="id"
    class="e-fieldset"
    :class="`e-fieldset--${variant}`"
    :disabled="disabled"
    :aria-describedby="error || hint ? hintId : undefined"
  >
    <!-- A hidden legend is only the screen reader text (`e-sr`), with none of the legend's layout. -->
    <legend v-if="legend" :class="[hideLegend ? 'e-sr' : ['e-fieldset-legend', plain && 'e-kicker'], legendClass]">
      <span class="e-fieldset-title">{{ legend }}</span>
      <span v-if="box && !hideLegend" class="e-fieldset-rule" aria-hidden="true" />
      <EFieldFlag :required="required" :optional="optional" />
    </legend>
    <div class="e-fieldset-body" :class="plain && 'e-fieldset-body--plain'">
      <!-- In a section the hint sits under the legend, ahead of the controls; the error always follows them. -->
      <EFieldMessage v-if="section && !error" :id="hintId" :hint="hint" />
      <slot />
      <EFieldMessage v-if="!plain && (!section || error)" :id="hintId" :error="error" :hint="hint" />
    </div>
    <EFieldMessage v-if="plain" :id="hintId" :error="error" :hint="hint" />
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
    gap: var(--e-gap-base);
    width: 100%;
    padding: 0;
  }

  .e-fieldset > legend.e-sr {
    padding: 0;
  }

  .e-fieldset--plain > .e-fieldset-legend {
    float: inline-start;
    margin-block-end: var(--e-gap-snug);
  }

  .e-fieldset--plain > .e-fieldset-legend + * {
    clear: both;
  }

  /* The ring is the outline alone: a native fieldset border is broken around its legend, so pairing it with the overlay painted a second, unbroken line. The legend straddles the ring and its own surface background breaks the line instead. */
  .e-fieldset--box {
    --_legend-lh: var(--e-leading-snug);

    padding-block: 0 var(--e-pad-card);
    padding-inline: var(--e-pad-card);
    border: 0;
    outline: var(--e-stroke-card) solid var(--e-border);
    outline-offset: calc(-1 * var(--e-stroke-card));
    border-radius: var(--e-radius-md);
    background: var(--e-surface);
  }

  .e-fieldset--box > .e-fieldset-legend {
    position: relative;
    align-items: center;
    gap: 0;
    width: calc(100% + var(--e-pad-card));

    /* Half the line box, so the ring runs through the middle of the title. */
    inset-block-start: calc(-0.5 * var(--_legend-lh) * 1em);
    margin-block: 0 var(--e-gap-base);
    margin-inline: calc(-1 * var(--e-gap-snug)) 0;
    font: var(--e-weight-medium) var(--e-text-md) / var(--_legend-lh) var(--e-font-sans);
    letter-spacing: 0;
    text-transform: none;
    color: var(--e-ink);
  }

  /* The title and the Required or Optional word each break the outline on their own surface, the title at the start and the word always at the end of the line, with the outline running between them. */
  .e-fieldset--box .e-fieldset-title,
  .e-fieldset--box .e-field-flag {
    padding-inline: var(--e-gap-snug);
    background: var(--e-surface);
  }

  .e-fieldset--box .e-fieldset-rule {
    flex: 1 1 var(--e-gap-snug);
    width: auto;
    min-width: var(--e-gap-snug);
  }

  /* The rule is the legend's own border, never a native fieldset border (which would break around the legend). */
  .e-fieldset--section > .e-fieldset-legend {
    display: block;
    padding-block-start: var(--e-gap-section);
    border-block-start: var(--e-stroke-hair) solid var(--e-border);
    font: var(--e-type-h3);
    color: var(--e-ink);
  }

  .e-fieldset--section:first-child > .e-fieldset-legend {
    padding-block-start: 0;
    border-block-start: 0;
  }

  .e-fieldset--section > .e-fieldset-legend .e-fieldset-title {
    padding: 0;
  }

  .e-fieldset--section > .e-fieldset-body {
    padding-block-start: var(--e-gap-loose);
  }

  /* The body's gap is gap-loose; a hint or error under the controls pulls up to gap-snug, and in a section the hint pulls up to the legend. */
  .e-fieldset--section > .e-fieldset-body > .e-field-hint:first-child {
    margin-block-start: calc(var(--e-gap-loose) * -1 + var(--e-gap-tight));
    max-width: var(--e-measure);
  }

  .e-fieldset-rule {
    flex: none;
    width: var(--e-gap-snug);
  }

  .e-fieldset-body {
    display: grid;
    gap: var(--e-gap-loose);
    padding-block-start: var(--e-gap-tight);
  }

  /* A plain group has its controls in the body too, so they are spaced as in any other; its message follows the body, outside it. */
  .e-fieldset-body--plain {
    padding-block-start: 0;
  }

  /* In a plain group the message follows the controls directly, so it pulls up by the space the controls leave. */
  .e-fieldset > .e-field-hint,
  .e-fieldset > .e-field-error {
    margin-block-start: calc(-1 * (var(--e-gap-tight) + var(--e-stroke-focus)));
  }

  .e-fieldset-body > .e-field-hint:not(:first-child),
  .e-fieldset-body > .e-field-error {
    margin-block-start: calc(var(--e-gap-loose) * -1 + var(--e-gap-snug));
  }
}
</style>
