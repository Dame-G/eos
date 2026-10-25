<script setup lang="ts">
import { h, type FunctionalComponent } from "vue";
import EIcon from "../Icon/EIcon.vue";
import ETooltip from "../Tooltip/ETooltip.vue";
import SpinnerRing from "../Spinner/SpinnerRing.vue";
import { useBusyButton } from "../../composables/useBusyButton.js";
import type { IconProp } from "../../icons/types.js";
import "../../styles/base.css";
import "../Button/button.css";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The glyph. */
    icon: IconProp;
    /** The accessible name, phrased as an action such as "Download receipt". */
    label: string;
    /** `quiet` has no fill and suits a row or a toolbar. The others are the `EButton` variants as a square. @default "quiet" */
    variant?: "quiet" | "primary" | "secondary" | "outline" | "danger";
    /** `sm` is a compact square, `lg` a larger one. Every size keeps a 44px target. @default "md" */
    size?: "sm" | "md" | "lg";
    /** Disables the button. */
    disabled?: boolean;
    /** Shows a spinner in place of the icon and ignores clicks while an action runs. The button stays focusable, is marked busy and "Loading" is announced. */
    loading?: boolean;
    /** `submit` submits a form. */
    type?: "button" | "submit" | "reset";
    /** Shows the label in a tooltip on hover and focus, for an icon that is not obvious. */
    tooltip?: boolean;
  }>(),
  { variant: "quiet", size: "md", type: "button" },
);

const { block: blockClick } = useBusyButton(() => props.loading);

const Wrap: FunctionalComponent = (_, { slots }) =>
  props.tooltip ? h(ETooltip, { label: props.label }, slots) : slots.default?.();
</script>

<template>
  <Wrap>
    <button
      v-bind="$attrs"
      :type="type"
      :class="[
        variant === 'quiet' ? 'e-icon-btn e-interact' : ['e-btn', `e-btn--${variant}`, 'e-btn--icon'],
        size !== 'md' && (variant === 'quiet' ? `e-icon-btn--${size}` : `e-btn--${size}`),
        loading && 'e-btn--loading',
      ]"
      :aria-label="label"
      :aria-busy="loading ? 'true' : undefined"
      :disabled="disabled"
      @click.capture="blockClick"
    >
      <SpinnerRing v-if="loading" class="e-btn-spinner" />
      <EIcon v-else :name="icon" />
    </button>
  </Wrap>
</template>

<style>
@layer e.primitives {
  .e-icon-btn {
    --_h: var(--e-control-height);

    display: inline-grid;
    place-items: center;
    flex: none;
    position: relative;
    width: var(--_h);
    height: var(--_h);
    padding: 0;
    border: 0;
    border-radius: var(--e-radius-md);
    background: transparent;
    color: var(--e-ink);
    cursor: pointer;
    transition: var(--e-transition-state);
  }

  .e-icon-btn--sm {
    --_h: var(--e-tap);
  }

  .e-icon-btn--lg {
    --_h: calc(var(--e-control-height) + var(--e-gap-snug));
  }

  /* A toggle that is on (`aria-pressed`) sits in the surface, like a pressed slab. */
  .e-icon-btn[aria-pressed="true"] {
    background: var(--e-wash-hover);
    box-shadow: var(--e-slab-sink);
  }

  .e-icon-btn:disabled {
    --_dash-inset: 0;

    background: var(--e-disabled-fill);
    color: var(--e-disabled-ink);
    cursor: not-allowed;
  }

  /* Busy, as on a quiet EButton: the soft tint and dashed edge of button.css, in the border colour. */
  .e-icon-btn.e-btn--loading {
    --_fill: var(--e-slab-ink);
    --_dash-inset: 0;

    color: var(--e-muted);
    cursor: not-allowed;
  }

  @media print {
    .e-icon-btn {
      display: none;
    }
  }

  @media (forced-colors: active) {
    .e-icon-btn:not(:disabled):hover,
    .e-icon-btn:not(:disabled):active {
      outline: var(--e-stroke-edge) solid Highlight;
      outline-offset: calc(-1 * var(--e-stroke-edge));
    }

    .e-icon-btn:disabled {
      outline-color: GrayText;
      color: GrayText;
    }
  }
}
</style>
