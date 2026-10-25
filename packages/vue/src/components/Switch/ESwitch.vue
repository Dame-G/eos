<script setup lang="ts">
import EChoiceRow from "../Checkbox/EChoiceRow.vue";
import type { EFieldCommonProps } from "../Field/fieldProps.js";
import { useChoice } from "../Checkbox/useChoiceMessage.js";
import "../../styles/base.css";
import "../../styles/controls/choice.css";

defineOptions({ inheritAttrs: false });

const props = defineProps<
  EFieldCommonProps & {
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

  /* Off, a pressed-in track; on, a value you set: the primary face on a thin slab (the track is no taller than a chip). The thumb is a small button face either way, the page surface on a thin slab, like the slider's thumb. The sizes follow the checkbox, so they grow with the text scale. */
  .e-switch-track {
    --_w: calc(2 * var(--e-check-size) - var(--e-gap-tight));
    --_thumb: calc(var(--e-check-size) - 2 * var(--e-gap-tight));
    --_inset: var(--e-gap-tight);
    --_travel: calc(var(--_w) - var(--_thumb) - 2 * var(--_inset));
    --_ring: var(--e-border-strong);
    --_lift: 0px;
    --_r: var(--e-radius-sm);

    position: relative;
    flex: none;
    width: var(--_w);
    height: var(--e-check-size);
    box-sizing: border-box;
    border: var(--e-stroke-edge) solid var(--_ring);
    border-bottom-width: calc(var(--e-stroke-edge) + var(--_lift));
    border-radius: var(--_r) / var(--_r) var(--_r) calc(var(--_r) + var(--_lift)) calc(var(--_r) + var(--_lift));
    background: var(--e-surface-tint);
    background-clip: padding-box;
    box-shadow: var(--e-shadow-well);
    transition: var(--e-transition-state);
  }

  .e-switch-track::after {
    --_edge: var(--e-slab-ink);

    content: "";
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: calc(var(--_inset) - var(--e-stroke-edge));
    width: var(--_thumb);
    height: var(--_thumb);

    /* Centred in the track's box: the slab, when on, thickens the bottom border and would lift a centre taken inside it, so half the lift is given back and the thumb sits at one height on and off. */
    margin-block-start: calc(var(--_thumb) / -2 + var(--_lift) / 2);
    box-sizing: border-box;
    border: var(--e-stroke-edge) solid var(--_edge);
    border-bottom-width: calc(var(--e-stroke-edge) + var(--_thumb-lift, var(--e-depth-thin)));

    /* Concentric with the track: the thumb's edge is `--_inset` inside the track's outer edge, border included. */
    border-radius: max(0px, calc(var(--_r) - var(--_inset)));
    background: var(--e-surface);
    transition:
      transform var(--e-duration-move) var(--e-easing-out),
      border-color var(--e-duration-tap) var(--e-easing-out);
  }

  .e-switch:hover .e-switch-input:not(:checked, :disabled) + .e-switch-track {
    --_ring: var(--e-wash-ring);

    background-color: var(--e-wash-hover);
  }

  .e-switch:active .e-switch-input:not(:checked, :disabled) + .e-switch-track {
    --_ring: var(--e-ink);

    background-color: var(--e-wash-press);
  }

  /* On, the well goes and the face rises on its slab; it sinks while pressed. */
  .e-switch-input:checked + .e-switch-track {
    --_ring: var(--e-primary-slab);
    --_lift: var(--e-depth-thin);

    background-color: var(--e-primary);
    background-clip: border-box;
    box-shadow: none;
  }

  .e-switch:hover .e-switch-input:checked:not(:disabled) + .e-switch-track {
    background-color: var(--e-primary-hover);
  }

  .e-switch:active .e-switch-input:checked:not(:disabled) + .e-switch-track {
    --_lift: 0px;

    background-color: var(--e-primary-press);
  }

  /* The thumb is a small button face, so it sinks off its slab while pressed, on or off. Its box keeps its size. */
  .e-switch:active .e-switch-input:not(:disabled) + .e-switch-track::after {
    --_thumb-lift: 0px;
  }

  /* On, the thumb travels to the end and keeps a neutral slab: it is the same small button face either way. The slab grey
     sits too close to the primary's own lightness to read against it, so on the primary it is drawn in ink. */
  .e-switch-input:checked + .e-switch-track::after {
    --_edge: var(--e-ink);

    transform: translateX(var(--_travel));
  }

  .e-switch-input:disabled + .e-switch-track {
    --_lift: 0px;

    border-color: transparent;
    background-color: var(--e-disabled-fill);
    box-shadow: none;
  }

  .e-switch-input:disabled + .e-switch-track::after {
    --_edge: var(--e-disabled-ink);
  }

  .e-switch-input[aria-invalid="true"]:not(:disabled) + .e-switch-track {
    --_ring: var(--e-danger);
  }

  @media (forced-colors: active) {
    .e-switch-track {
      border-color: ButtonText;
    }

    .e-switch-input:checked + .e-switch-track {
      forced-color-adjust: none;
      border-color: Highlight;
      background: Highlight;
    }

    /* The track opts out of forced colours, so its hover and press fills would show the theme's colours through. */
    .e-switch:hover .e-switch-input:checked:not(:disabled) + .e-switch-track,
    .e-switch:active .e-switch-input:checked:not(:disabled) + .e-switch-track {
      background-color: Highlight;
    }

    .e-switch-input:focus-visible + .e-switch-track {
      outline-color: Highlight;
    }

    .e-switch-track::after {
      forced-color-adjust: none;
      background: ButtonText;
    }

    .e-switch-input:checked + .e-switch-track::after {
      background: HighlightText;
    }

    .e-switch-input:disabled + .e-switch-track {
      --_dash: GrayText;
    }

    .e-switch-input:disabled + .e-switch-track::after {
      background: GrayText;
    }
  }

  :dir(rtl) .e-switch-input:checked + .e-switch-track::after {
    transform: translateX(calc(-1 * var(--_travel)));
  }
}
</style>
