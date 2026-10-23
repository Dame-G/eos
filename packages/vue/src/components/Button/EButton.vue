<script setup lang="ts">
import EIcon from "../Icon/EIcon.vue";
import SpinnerRing from "../Spinner/SpinnerRing.vue";
import type { IconProp } from "../../icons/types.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** `primary` is the one main action on a screen. `secondary` confirms. `outline` is for the other actions beside it. `danger` cancels or removes. `quiet` is an underlined text action. */
    variant?: "primary" | "secondary" | "outline" | "danger" | "quiet";
    /** Shows an icon before the label, as a name such as `download` or as a component. */
    icon?: IconProp;
    /** Makes the button fill the width of its container. */
    block?: boolean;
    /** Stops the button taking focus and ignores clicks. With `href` the link gets `aria-disabled="true"` and `tabindex="-1"` and does not navigate. */
    disabled?: boolean;
    /** `submit` submits a form. Use it on the one button that submits. */
    type?: "button" | "submit" | "reset";
    /** Renders a link that looks like the button, for a destination rather than an action (a call to action that goes to a page). A link does not activate on Space, like a native link. */
    href?: string;
    /** Opens the link in a new tab. Needs `href`. */
    external?: boolean;
    /** Shows a spinner in place of the icon and ignores clicks while an action runs. The button stays focusable and is announced as busy. */
    loading?: boolean;
  }>(),
  { variant: "primary", type: "button" },
);

defineSlots<{
  /** The label: a verb that says what happens, like "Pay $162.40". */
  default(): unknown;
}>();

function blockWhenDisabled(event: Event) {
  if (!props.disabled && !props.loading) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}
</script>

<template>
  <a
    v-if="href"
    :href="href"
    class="e-btn"
    :class="[variant !== 'primary' && `e-btn--${variant}`, block && 'e-btn--block', loading && 'e-btn--loading']"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noreferrer' : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
    :aria-busy="loading ? 'true' : undefined"
    :tabindex="disabled ? -1 : undefined"
    @click.capture="blockWhenDisabled"
    @auxclick.capture="blockWhenDisabled"
  >
    <SpinnerRing v-if="loading" class="e-btn-spinner" />
    <EIcon v-else-if="icon" :name="icon" />
    <slot />
  </a>
  <button
    v-else
    :type="type"
    class="e-btn"
    :class="[variant !== 'primary' && `e-btn--${variant}`, block && 'e-btn--block', loading && 'e-btn--loading']"
    :disabled="disabled"
    :aria-busy="loading ? 'true' : undefined"
    @click.capture="blockWhenDisabled"
  >
    <SpinnerRing v-if="loading" class="e-btn-spinner" />
    <EIcon v-else-if="icon" :name="icon" />
    <slot />
  </button>
</template>

<style>
@layer e.primitives {
  .e-btn {
    --_fill: var(--e-primary);
    --_on: var(--e-on-primary);
    --_hover: var(--e-primary-hover);
    --_press: var(--e-primary-press);
    --_slab: var(--e-primary-slab);

    /* One border, one control height tall. The slab is the bottom edge made thicker by the lift, and the radius tapers it up the corners. Pressing sinks the face over it. */
    --_lift: var(--e-depth);
    --_ring: var(--_slab);

    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--e-space-2);
    height: var(--e-control-height);
    padding: 0 calc(var(--e-space-4) - var(--e-stroke-edge));
    box-sizing: border-box;
    border: var(--e-stroke-edge) solid var(--_ring);
    border-bottom-width: calc(var(--e-stroke-edge) + var(--_lift));
    border-radius: var(--e-radius-md);
    background-color: var(--_fill);

    /* A solid face runs under its border so no page colour shows between them. */
    background-clip: border-box;
    color: var(--_on);
    font: var(--e-weight-medium) var(--e-text-md) / 1 var(--e-font-sans);
    letter-spacing: 0.01em;
    white-space: nowrap;
    text-decoration: none;
    cursor: pointer;
    transition:
      border-color var(--e-duration-tap) var(--e-easing-out),
      background-color var(--e-duration-tap) var(--e-easing-out);
  }

  .e-btn:hover {
    background-color: var(--_hover);
  }

  .e-btn:active {
    --_lift: 0px;

    background-color: var(--_press);
  }

  .e-btn--secondary {
    --_fill: var(--e-secondary);
    --_on: var(--e-on-secondary);
    --_hover: var(--e-secondary-hover);
    --_press: var(--e-secondary-press);
    --_slab: var(--e-secondary-slab);
  }

  .e-btn--danger {
    --_fill: var(--e-danger);
    --_on: var(--e-on-danger);
    --_hover: var(--e-danger-hover);
    --_press: var(--e-danger-press);
    --_slab: var(--e-danger-slab);
  }

  .e-btn--outline {
    --_fill: var(--e-surface);
    --_on: var(--e-ink);
    --_hover: var(--e-surface-hover);
    --_press: var(--e-surface-press);
    --_slab: var(--e-border-strong);

    background-clip: padding-box;
  }

  .e-btn--outline:hover,
  .e-btn--outline:active {
    --_ring: var(--e-ink);
    --_slab: var(--e-ink);
  }

  .e-btn--quiet {
    --_ring: transparent;
    --_lift: 0px;

    background: transparent;
    color: var(--e-ink);
    padding-inline: calc(var(--e-space-3) - var(--e-stroke-edge));
    text-decoration: underline;
    text-underline-offset: 5px;
    text-decoration-thickness: var(--e-stroke-edge);
    text-decoration-color: var(--e-border-strong);
  }

  .e-btn--quiet:not([disabled], [aria-disabled="true"]):hover {
    --_ring: var(--e-wash-ring);

    background: var(--e-wash-hover);
    text-decoration-color: currentcolor;
  }

  .e-btn--quiet:not([disabled], [aria-disabled="true"]):active {
    --_ring: var(--e-ink);

    background: var(--e-wash-press);
  }

  .e-btn .e-icon,
  .e-btn-spinner {
    margin-inline-start: calc(-0.5 * var(--e-space-1));
  }

  .e-btn .e-btn-spinner {
    width: 1.125em;
    height: 1.125em;
  }

  /* Busy reads as unavailable and in progress: a soft tint of the button's colour with a dashed edge like a disabled button, and the spinner. The edge is a pseudo-element, so a page's focus reset cannot remove it. */
  .e-btn--loading {
    --_lift: 0px;
    --_tint: var(--_fill);
    --_busy: color-mix(in srgb, var(--_tint) 80%, var(--e-ink));
  }

  .e-btn--outline.e-btn--loading {
    --_tint: var(--e-border-strong);
  }

  .e-btn--loading,
  .e-btn--loading:hover,
  .e-btn--loading:active {
    background-color: color-mix(in srgb, var(--_tint) 14%, var(--e-surface));
    background-clip: padding-box;
    border-color: transparent;
    color: var(--_busy);
    cursor: not-allowed;
  }

  .e-btn--loading::before {
    content: "";
    position: absolute;
    inset: calc(-1 * var(--e-stroke-edge));
    border: var(--e-stroke-edge) dashed var(--_busy);
    border-radius: inherit;
    pointer-events: none;
  }

  .e-btn--block {
    width: 100%;
  }

  /* A toggle: any button with aria-pressed="true" reads as selected, a primary slab under a washed face. */
  .e-btn[aria-pressed="true"],
  .e-btn[aria-pressed="true"]:hover,
  .e-btn[aria-pressed="true"]:active {
    --_slab: var(--e-primary);
    --_ring: var(--e-primary);

    background-color: var(--e-surface-hover);
    color: var(--e-primary);
  }

  .e-btn[disabled],
  .e-btn[aria-disabled="true"] {
    --_lift: 0px;

    cursor: not-allowed;
    background: var(--e-disabled-fill);
    color: var(--e-disabled-ink);
    outline: var(--e-stroke-edge) dashed var(--e-border-strong);
    outline-offset: calc(-1 * var(--e-stroke-edge));
    border-color: transparent;
  }

  @media print {
    .e-btn {
      display: none;
    }
  }

  @media (forced-colors: active) {
    .e-btn {
      border: var(--e-stroke-focus) solid ButtonText;
    }

    .e-btn[aria-pressed="true"] {
      forced-color-adjust: none;
      background: Highlight;
      color: HighlightText;
    }

    .e-btn[disabled],
    .e-btn[aria-disabled="true"] {
      outline-color: GrayText;
      color: GrayText;
    }
  }
}
</style>
