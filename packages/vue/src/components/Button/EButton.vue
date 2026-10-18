<script setup lang="ts">
import EIcon from "../Icon/EIcon.vue";
import type { IconProp } from "../../icons/types.js";
import "../../styles/base.css";

withDefaults(
  defineProps<{
    /** `primary` is the one main action on a screen; `secondary` confirms; `outline` is for the other actions beside it; `danger` cancels or removes; `quiet` is an underlined text action. */
    variant?: "primary" | "secondary" | "outline" | "danger" | "quiet";
    /** An icon before the label. */
    icon?: IconProp;
    /** Full width. */
    block?: boolean;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
  }>(),
  { variant: "primary", type: "button" },
);

defineSlots<{
  /** The label: a verb that says what happens, like "Pay $162.40". */
  default(): unknown;
}>();
</script>

<template>
  <button
    :type="type"
    class="e-btn"
    :class="[variant !== 'primary' && `e-btn--${variant}`, block && 'e-btn--block']"
    :disabled="disabled"
  >
    <EIcon v-if="icon" :name="icon" />
    <slot />
  </button>
</template>

<style>
@layer e.primitives {
  .e-btn {
    --e-fill: var(--e-primary);
    --e-on-fill: var(--e-on-primary);
    --e-slab: color-mix(in srgb, var(--e-fill) 58%, #000);
    --e-hover: color-mix(in srgb, var(--e-fill) 88%, #000);
    --e-press: color-mix(in srgb, var(--e-fill) 78%, #000);

    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--e-space-2);
    height: var(--e-control-height);
    padding: 0 var(--e-space-4);
    border: var(--e-stroke-edge) solid var(--e-slab);
    border-radius: var(--e-radius-md);
    background: var(--e-fill);
    color: var(--e-on-fill);
    box-shadow: inset 0 -2px 0 0 var(--e-slab);
    font: 500 var(--e-text-md) / 1 var(--e-font-sans);
    letter-spacing: 0.01em;
    white-space: nowrap;
    text-decoration: none;
    cursor: pointer;
    transition:
      box-shadow var(--e-duration-tap) var(--e-easing-out),
      background-color var(--e-duration-tap) var(--e-easing-out);
  }

  .e-btn:hover {
    background: var(--e-hover);
  }

  .e-btn:active {
    background: var(--e-press);
    box-shadow: inset 0 2px 0 0 rgb(0 0 0 / 0.22);
    padding-top: 2px;
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
    background: color-mix(in srgb, var(--e-surface) 92%, #000);
    border-color: var(--e-ink);
    box-shadow: inset 0 -2px 0 0 var(--e-ink);
  }

  .e-btn--outline:active {
    background: color-mix(in srgb, var(--e-surface) 84%, #000);
    border-color: var(--e-ink);
    box-shadow: inset 0 2px 0 0 rgb(0 0 0 / 0.14);
  }

  .e-btn--quiet {
    border-color: transparent;
    background: transparent;
    color: var(--e-ink);
    box-shadow: none;
    padding-inline: var(--e-space-3);
    text-decoration: underline;
    text-underline-offset: 5px;
    text-decoration-thickness: var(--e-stroke-edge);
    text-decoration-color: var(--e-border-strong);
  }

  .e-btn--quiet:not([disabled]):hover {
    border-color: var(--e-wash-ring);
    background: var(--e-wash-hover);
    text-decoration-color: currentcolor;
  }

  .e-btn--quiet:not([disabled]):active {
    border-color: var(--e-ink);
    background: var(--e-wash-press);
    box-shadow: none;
    padding-top: 0;
  }

  .e-btn .e-icon {
    margin-inline-start: -2px;
  }

  .e-btn--block {
    width: 100%;
  }

  .e-btn[disabled] {
    cursor: not-allowed;
    background: transparent;
    color: var(--e-muted);
    border: var(--e-stroke-edge) dashed var(--e-border-strong);
    box-shadow: none;
    padding-top: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .e-btn {
      transition: none;
    }
  }

  /* Not part of the page when printed. The reference uses !important; a later rule in the same layer wins without it. */
  @media print {
    .e-btn {
      display: none;
    }
  }

  @media (forced-colors: active) {
    .e-btn {
      border: 2px solid ButtonText;
    }

    .e-btn[disabled] {
      border-color: GrayText;
      color: GrayText;
    }
  }
}
</style>
