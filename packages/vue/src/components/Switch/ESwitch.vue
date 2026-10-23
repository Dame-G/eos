<script setup lang="ts">
import EChoiceRow from "../Checkbox/EChoiceRow.vue";
import type { EFieldCommonProps } from "../Field/fieldProps.js";
import { useChoice } from "../Checkbox/useChoiceMessage.js";
import "../../styles/base.css";
import "../Checkbox/choice.css";

defineOptions({ inheritAttrs: false });

const props = defineProps<
  Omit<EFieldCommonProps, "hideLabel"> & {
    /** The setting, named by what it does. */
    label: string;
    /** A line of detail under the label. */
    description?: string;
    /** The name submitted with a form. */
    name?: string;
    /** The value submitted with a form when on. */
    value?: string;
  }
>();

/** On or off. */
const model = defineModel<boolean>({ default: false });

const choice = useChoice(props);
const input = choice.input;

defineExpose(choice.exposed);
</script>

<template>
  <EChoiceRow v-bind="choice.row()" row-class="e-switch">
    <!-- eslint-disable-next-line vuejs-accessibility/form-control-has-label -- EChoiceRow's label wraps this slot and points at the id -->
    <input
      ref="input"
      type="checkbox"
      role="switch"
      class="e-switch-input"
      :checked="model"
      v-bind="choice.bind()"
      @click="choice.guard"
      @change="model = ($event.target as HTMLInputElement).checked"
    />
    <span class="e-switch-track" aria-hidden="true" />
  </EChoiceRow>
</template>

<style>
@layer e.controls {
  .e-switch-input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
  }

  /* A pressed-in track with a plain thumb. The sizes follow the checkbox, so they grow with the text scale. */
  .e-switch-track {
    --_w: calc(2 * var(--e-check-size) - var(--e-gap-tight));
    --_thumb: calc(var(--e-check-size) - 2 * var(--e-gap-tight));
    --_inset: var(--e-gap-tight);
    --_travel: calc(var(--_w) - var(--_thumb) - 2 * var(--_inset));
    --_ring: var(--e-border-strong);

    position: relative;
    flex: none;
    width: var(--_w);
    height: var(--e-check-size);
    box-sizing: border-box;
    border: var(--e-stroke-edge) solid var(--_ring);
    border-radius: var(--e-radius-sm);
    background: var(--e-surface-tint);
    background-clip: padding-box;
    box-shadow: var(--e-well);
    transition: var(--e-transition-state);
  }

  .e-switch-track::after {
    --_face: var(--e-ink);

    content: "";
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: calc(var(--_inset) - var(--e-stroke-edge));
    width: var(--_thumb);
    height: var(--_thumb);
    margin-block-start: calc(var(--_thumb) / -2);
    box-sizing: border-box;

    /* Concentric with the track: the thumb's edge is `--_inset` inside the track's outer edge, border included. */
    border-radius: max(0px, calc(var(--e-radius-sm) - var(--_inset)));
    background: var(--_face);
    transition: transform var(--e-duration-move) var(--e-easing-out);
  }

  .e-switch:hover .e-switch-input:not(:checked, :disabled) + .e-switch-track {
    --_ring: var(--e-wash-ring);

    background-color: var(--e-primary-soft);
  }

  .e-switch:active .e-switch-input:not(:checked, :disabled) + .e-switch-track {
    --_ring: var(--e-ink);
  }

  /* Off, the track is pressed in. On, it is a flat primary face, so the well goes. The thumb is the same height either way. */
  .e-switch-input:checked + .e-switch-track {
    --_ring: var(--e-primary-slab);

    background-color: var(--e-primary);
    background-clip: border-box;
    box-shadow: none;
  }

  .e-switch:hover .e-switch-input:checked:not(:disabled) + .e-switch-track {
    background-color: var(--e-primary-hover);
  }

  .e-switch:active .e-switch-input:checked:not(:disabled) + .e-switch-track {
    background-color: var(--e-primary-press);
  }

  .e-switch-input:checked + .e-switch-track::after {
    --_face: var(--e-on-primary);

    transform: translateX(var(--_travel));
  }

  .e-switch-input:disabled + .e-switch-track {
    border-color: transparent;
    outline: var(--e-stroke-edge) dashed var(--e-border-strong);
    outline-offset: calc(-1 * var(--e-stroke-edge));
    background-color: var(--e-disabled-fill);
    box-shadow: none;
  }

  .e-switch-input:disabled + .e-switch-track::after {
    --_face: var(--e-disabled-ink);
  }

  .e-switch-input[aria-invalid="true"]:not(:disabled) + .e-switch-track {
    --_ring: var(--e-danger);
  }

  @media (forced-colors: active) {
    .e-switch-input:checked + .e-switch-track {
      forced-color-adjust: none;
      background: Highlight;
    }

    .e-switch-track::after {
      forced-color-adjust: none;
      background: ButtonText;
    }
  }

  :dir(rtl) .e-switch-input:checked + .e-switch-track::after {
    transform: translateX(calc(-1 * var(--_travel)));
  }
}
</style>
