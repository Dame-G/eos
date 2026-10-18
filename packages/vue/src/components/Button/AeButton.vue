<script setup lang="ts">
import AeIcon from "../Icon/AeIcon.vue";
import type { IconName } from "../../icons/phosphor.js";
import "../../styles/base.css";

withDefaults(
  defineProps<{
    /** `primary` is the one main action on a screen; `secondary` confirms; `outline` is for the other actions beside it; `danger` cancels or removes; `quiet` is an underlined text action. */
    variant?: "primary" | "secondary" | "outline" | "danger" | "quiet";
    /** An icon before the label. */
    icon?: IconName | (string & {});
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
    class="ae-btn"
    :class="[variant !== 'primary' && `ae-btn--${variant}`, block && 'ae-btn--block']"
    :disabled="disabled"
  >
    <AeIcon v-if="icon" :name="icon" />
    <slot />
  </button>
</template>

<style>
@layer ae.primitives {
  .ae-btn {
    --ae-fill: var(--ae-primary);
    --ae-on-fill: var(--ae-on-primary);
    --ae-slab: color-mix(in srgb, var(--ae-fill) 58%, #000);
    --ae-hover: color-mix(in srgb, var(--ae-fill) 88%, #000);
    --ae-press: color-mix(in srgb, var(--ae-fill) 78%, #000);

    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--ae-space-2);
    height: var(--ae-control-height);
    padding: 0 var(--ae-space-4);
    border: var(--ae-stroke-edge) solid var(--ae-slab);
    border-radius: var(--ae-radius-md);
    background: var(--ae-fill);
    color: var(--ae-on-fill);
    box-shadow: inset 0 -2px 0 0 var(--ae-slab);
    font: 500 var(--ae-text-md) / 1 var(--ae-font-sans);
    letter-spacing: 0.01em;
    white-space: nowrap;
    text-decoration: none;
    cursor: pointer;
    transition:
      box-shadow var(--ae-duration-tap) var(--ae-easing-out),
      background-color var(--ae-duration-tap) var(--ae-easing-out);
  }

  .ae-btn:hover {
    background: var(--ae-hover);
  }

  .ae-btn:active {
    background: var(--ae-press);
    box-shadow: inset 0 2px 0 0 rgb(0 0 0 / 0.22);
    padding-top: 2px;
  }

  .ae-btn--secondary {
    --ae-fill: var(--ae-secondary);
    --ae-on-fill: var(--ae-on-secondary);
  }

  .ae-btn--danger {
    --ae-fill: var(--ae-danger);
    --ae-on-fill: var(--ae-on-danger);
  }

  .ae-btn--outline {
    --ae-fill: var(--ae-surface);
    --ae-on-fill: var(--ae-ink);
    --ae-slab: var(--ae-border-strong);
  }

  .ae-btn--outline:hover {
    background: color-mix(in srgb, var(--ae-surface) 92%, #000);
    border-color: var(--ae-ink);
    box-shadow: inset 0 -2px 0 0 var(--ae-ink);
  }

  .ae-btn--outline:active {
    background: color-mix(in srgb, var(--ae-surface) 84%, #000);
    border-color: var(--ae-ink);
    box-shadow: inset 0 2px 0 0 rgb(0 0 0 / 0.14);
  }

  .ae-btn--quiet {
    border-color: transparent;
    background: transparent;
    color: var(--ae-ink);
    box-shadow: none;
    padding-inline: var(--ae-space-3);
    text-decoration: underline;
    text-underline-offset: 5px;
    text-decoration-thickness: var(--ae-stroke-edge);
    text-decoration-color: var(--ae-border-strong);
  }

  .ae-btn--quiet:not([disabled]):hover {
    border-color: var(--ae-wash-ring);
    background: var(--ae-wash-hover);
    text-decoration-color: currentcolor;
  }

  .ae-btn--quiet:not([disabled]):active {
    border-color: var(--ae-ink);
    background: var(--ae-wash-press);
    box-shadow: none;
    padding-top: 0;
  }

  .ae-btn .ae-icon {
    margin-inline-start: -2px;
  }

  .ae-btn--block {
    width: 100%;
  }

  .ae-btn[disabled] {
    cursor: not-allowed;
    background: transparent;
    color: var(--ae-muted);
    border: var(--ae-stroke-edge) dashed var(--ae-border-strong);
    box-shadow: none;
    padding-top: 0;
  }

  @media (forced-colors: active) {
    .ae-btn {
      border: 2px solid ButtonText;
    }

    .ae-btn[disabled] {
      border-color: GrayText;
      color: GrayText;
    }
  }
}
</style>
