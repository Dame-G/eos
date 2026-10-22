<script setup lang="ts">
import EIcon from "../Icon/EIcon.vue";
import type { IconProp } from "../../icons/types.js";
import "../../styles/base.css";

defineProps<{
  /** The glyph. */
  icon: IconProp;
  /** The accessible name, phrased as an action such as "Download receipt". */
  label: string;
  /** Disables the button. */
  disabled?: boolean;
}>();
</script>

<template>
  <button type="button" class="e-icon-btn" :aria-label="label" :disabled="disabled">
    <EIcon :name="icon" />
  </button>
</template>

<style>
@layer e.primitives {
  .e-icon-btn {
    display: inline-grid;
    place-items: center;
    flex: none;
    width: var(--e-control-height);
    height: var(--e-control-height);
    padding: 0;
    border: 0;
    border-radius: var(--e-radius-md);
    background: transparent;
    color: var(--e-ink);
    cursor: pointer;
    transition: background-color var(--e-duration-tap) var(--e-easing-out);
  }

  .e-icon-btn:not(:disabled):hover {
    background: var(--e-wash-hover);
    box-shadow: inset 0 0 0 var(--e-stroke-card) var(--e-wash-ring);
  }

  .e-icon-btn:not(:disabled):active {
    background: var(--e-wash-press);
    box-shadow: inset 0 0 0 var(--e-stroke-edge) var(--e-ink);
  }

  .e-icon-btn:disabled {
    outline: var(--e-stroke-edge) dashed var(--e-border-strong);
    outline-offset: calc(-1 * var(--e-stroke-edge));
    color: var(--e-muted);
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    .e-icon-btn {
      transition: none;
    }
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
