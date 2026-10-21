<script setup lang="ts">
import EIcon from "../Icon/EIcon.vue";
import type { IconProp } from "../../icons/types.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** `primary` is the one main action on a screen; `secondary` confirms; `outline` is for the other actions beside it; `danger` cancels or removes; `quiet` is an underlined text action. */
    variant?: "primary" | "secondary" | "outline" | "danger" | "quiet";
    /** An icon before the label: a name such as `download`, or a component. */
    icon?: IconProp;
    /** Full width. */
    block?: boolean;
    /** Dashed and unfilled; not focusable, ignores clicks. With `href` the link gets `aria-disabled="true"` and `tabindex="-1"` and does not navigate. */
    disabled?: boolean;
    /** Set `submit` on the one that submits a form. */
    type?: "button" | "submit" | "reset";
    /** Renders a link that looks like the button, for a destination rather than an action (a call to action that goes to a page). Space does not follow it. */
    href?: string;
    /** With `href`: opens in a new tab. */
    external?: boolean;
    /** Swaps the icon for a spinner, flattens the face, dashes its edge and animates stripes across it, and ignores clicks while an action runs. The button keeps its width and stays focusable, and is announced as busy. */
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
    <svg v-if="loading" class="e-btn-spinner" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /></svg>
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
    <svg v-if="loading" class="e-btn-spinner" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /></svg>
    <EIcon v-else-if="icon" :name="icon" />
    <slot />
  </button>
</template>

<style>
@layer e.primitives {
  .e-btn {
    --e-fill: var(--e-primary);
    --e-on-fill: var(--e-on-primary);
    --e-slab: color-mix(in srgb, var(--e-fill), var(--e-shade-slab));
    --e-hover: color-mix(in srgb, var(--e-fill), var(--e-shade-hover));
    --e-press: color-mix(in srgb, var(--e-fill), var(--e-shade-press));

    /* One rounded box, one control height tall, drawn as a single border with the fill stopped inside it, so the corner pixels carry the edge colour alone. The slab is the bottom edge made thicker by the lift: with the corner radius it tapers up the curve to the width of the side edge, which gives the raised look. Pressing sinks the face over it. */
    --e-lift: var(--e-depth);
    --e-ring: var(--e-slab);

    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--e-space-2);
    height: var(--e-control-height);
    padding: 0 calc(var(--e-space-4) - var(--e-stroke-edge));
    box-sizing: border-box;
    border: var(--e-stroke-edge) solid var(--e-ring);
    border-bottom-width: calc(var(--e-stroke-edge) + var(--e-lift));
    border-radius: var(--e-radius-md);
    background-color: var(--e-fill);
    background-clip: padding-box;
    color: var(--e-on-fill);
    font: 500 var(--e-text-md) / 1 var(--e-font-sans);
    letter-spacing: 0.01em;
    white-space: nowrap;
    text-decoration: none;
    cursor: pointer;
    transition:
      border-color var(--e-duration-tap) var(--e-easing-out),
      border-bottom-width var(--e-duration-tap) var(--e-easing-out),
      background-color var(--e-duration-tap) var(--e-easing-out);
  }

  .e-btn:hover {
    --e-slab: color-mix(in srgb, var(--e-hover), var(--e-shade-slab));

    background-color: var(--e-hover);
  }

  .e-btn:active {
    --e-lift: 0px;

    background-color: var(--e-press);
  }

  .e-btn--secondary {
    --e-fill: var(--e-secondary);
    --e-on-fill: var(--e-on-secondary);
  }

  .e-btn--danger {
    --e-fill: var(--e-danger);
    --e-on-fill: var(--e-on-danger);
  }

  .e-btn--outline {
    --e-fill: var(--e-surface);
    --e-on-fill: var(--e-ink);
    --e-slab: var(--e-border-strong);
  }

  .e-btn--outline:hover {
    --e-ring: var(--e-ink);
    --e-slab: var(--e-ink);

    background-color: color-mix(in srgb, var(--e-surface), var(--e-shade-hover));
  }

  .e-btn--outline:active {
    --e-ring: var(--e-ink);
    --e-slab: var(--e-ink);

    background-color: color-mix(in srgb, var(--e-surface), var(--e-shade-press));
  }

  .e-btn--quiet {
    --e-ring: transparent;
    --e-lift: 0px;

    background: transparent;
    color: var(--e-ink);
    padding-inline: calc(var(--e-space-3) - var(--e-stroke-edge));
    text-decoration: underline;
    text-underline-offset: 5px;
    text-decoration-thickness: var(--e-stroke-edge);
    text-decoration-color: var(--e-border-strong);
  }

  .e-btn--quiet:not([disabled], [aria-disabled="true"]):hover {
    --e-ring: var(--e-wash-ring);

    background: var(--e-wash-hover);
    text-decoration-color: currentcolor;
  }

  .e-btn--quiet:not([disabled], [aria-disabled="true"]):active {
    --e-ring: var(--e-ink);

    background: var(--e-wash-press);
    transform: none;
  }

  .e-btn .e-icon,
  .e-btn-spinner {
    margin-inline-start: calc(-0.5 * var(--e-space-1));
  }

  .e-btn-spinner {
    flex: none;
    width: 1.125em;
    height: 1.125em;
    fill: none;
    stroke: currentcolor;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-dasharray: 36 56;
    animation: e-btn-spin 0.9s linear infinite;
  }

  /* Busy reads as unavailable and in progress: a soft tint of the button's colour with a dashed edge like a disabled button, and stripes that move. The face grows over its slab, so the button stays one control height tall. The edge is a pseudo-element, so a page's focus reset cannot remove it. */
  .e-btn--loading {
    --e-lift: 0px;
    --e-tint: var(--e-fill);
    --e-busy: color-mix(in srgb, var(--e-tint) 80%, var(--e-ink));
  }

  .e-btn--outline.e-btn--loading {
    --e-tint: var(--e-border-strong);
  }

  .e-btn--loading,
  .e-btn--loading:hover,
  .e-btn--loading:active {
    background-color: color-mix(in srgb, var(--e-tint) 14%, var(--e-surface));
    background-image: repeating-linear-gradient(135deg, transparent 0 8px, color-mix(in srgb, var(--e-tint) 20%, transparent) 8px 16px);
    background-size: 22.63px 22.63px;
    border-color: transparent;
    color: var(--e-busy);
    transform: none;
    cursor: not-allowed;
    animation: e-btn-stripes 0.8s linear infinite;
  }

  .e-btn--loading::before {
    content: "";
    position: absolute;
    inset: 0;
    border: var(--e-stroke-edge) dashed var(--e-busy);
    border-radius: inherit;
    pointer-events: none;
  }

  @keyframes e-btn-stripes {
    to {
      background-position-x: 22.63px;
    }
  }

  @keyframes e-btn-spin {
    to {
      transform: rotate(360deg);
    }
  }

  .e-btn--block {
    width: 100%;
  }

  /* A toggle: any button with aria-pressed="true" reads as selected. */
  .e-btn[aria-pressed="true"],
  .e-btn[aria-pressed="true"]:hover,
  .e-btn[aria-pressed="true"]:active {
    --e-slab: var(--e-primary);
    --e-ring: var(--e-primary);

    background-color: var(--e-surface-hover);
    color: var(--e-primary);
  }

  .e-btn[disabled],
  .e-btn[aria-disabled="true"] {
    --e-lift: 0px;

    cursor: not-allowed;
    background: transparent;
    color: var(--e-muted);
    outline: var(--e-stroke-edge) dashed var(--e-border-strong);
    outline-offset: calc(-1 * var(--e-stroke-edge));
    border-color: transparent;
    transform: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .e-btn {
      transition: none;
    }

    .e-btn-spinner {
      animation-duration: 3s;
    }

    .e-btn--loading {
      animation: none;
    }
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
