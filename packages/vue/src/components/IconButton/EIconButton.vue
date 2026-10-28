<script setup lang="ts">
import { computed, h, type Component, type FunctionalComponent } from "vue";
import EIcon from "../Icon/EIcon.vue";
import ETooltip from "../Tooltip/ETooltip.vue";
import SpinnerRing from "../Spinner/SpinnerRing.vue";
import { useBusyButton } from "../../composables/useBusyButton.js";
import type { IconProp } from "../../icons/types.js";
import { hasLinkTarget, linkTarget } from "../../composables/useLink.js";
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
    /** `xs` is a dense square for a compact row (its hit area is still 44px), `sm` a compact square, `lg` a larger one. @default "md" */
    size?: "xs" | "sm" | "md" | "lg";
    /** Makes it a link to this address, for an icon that goes to a page. Give `href` or, with a `linkComponent`, `to`. */
    href?: string;
    /** A router location, passed to `linkComponent` as `to` (for `RouterLink`). Use it instead of `href`. */
    to?: unknown;
    /** What renders a link: `RouterLink` or any component that takes `href` or `to` and a default slot. */
    linkComponent?: string | Component;
    /** Marks it as the page you are on (`aria-current="page"`). Only a link has a current page. */
    current?: boolean;
    /** Disables the button. */
    disabled?: boolean;
    /** Shows a spinner in place of the icon and ignores clicks while an action runs. The button stays focusable, is marked busy and "Loading" is announced. */
    loading?: boolean;
    /** `submit` submits a form. */
    type?: "button" | "submit" | "reset";
    /** Shows the label in a tooltip on hover and focus, for an icon that is not obvious. */
    tooltip?: boolean;
  }>(),
  { variant: "quiet", size: "md", type: "button", linkComponent: "a" },
);

const linked = computed(() => hasLinkTarget(props));
const target = computed(() => linkTarget(props, props.linkComponent));

const { block: blockClick } = useBusyButton(
  () => props.loading,
  () => props.loading || (linked.value && props.disabled),
);

const Wrap: FunctionalComponent = (_, { slots }) =>
  props.tooltip ? h(ETooltip, { label: props.label }, slots) : slots.default?.();
</script>

<template>
  <Wrap>
    <component
      :is="linked ? linkComponent : 'button'"
      v-bind="{ ...$attrs, ...(linked ? target : { type }) }"
      :class="[
        variant === 'quiet' ? 'e-icon-btn e-interact' : ['e-btn', `e-btn--${variant}`, 'e-btn--icon'],
        size !== 'md' && (variant === 'quiet' ? `e-icon-btn--${size}` : `e-btn--${size}`),
        linked && 'e-icon-btn--link',
        loading && 'e-btn--loading',
      ]"
      :aria-label="label"
      :aria-busy="loading ? 'true' : undefined"
      :aria-current="linked && current ? 'page' : undefined"
      :aria-disabled="linked && (disabled || loading) ? 'true' : undefined"
      :tabindex="linked && disabled ? -1 : undefined"
      :disabled="linked ? undefined : disabled"
      @click.capture="blockClick"
      @auxclick.capture="blockClick"
    >
      <SpinnerRing v-if="loading" class="e-btn-spinner" />
      <EIcon v-else :name="icon" />
    </component>
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

  .e-icon-btn--link {
    text-decoration: none;
  }

  .e-icon-btn--xs {
    --_h: calc(var(--e-chip-height) + var(--e-gap-snug));
  }

  .e-icon-btn--xs::after {
    content: "";
    position: absolute;
    inset-block-start: calc(50% - var(--e-tap) / 2);
    inset-inline: calc((var(--_h) - var(--e-tap)) / 2);
    block-size: var(--e-tap);
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
    box-shadow: var(--e-shadow-sink);
  }

  /* The page you are on, for a link: the same sunk face as a toggle that is on. */
  .e-icon-btn[aria-current="page"] {
    background: var(--e-wash-hover);
    box-shadow: var(--e-shadow-sink);
  }

  .e-icon-btn:disabled,
  .e-icon-btn[aria-disabled="true"] {
    background: transparent;
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
      --_dash: GrayText;

      color: GrayText;
    }
  }
}
</style>
