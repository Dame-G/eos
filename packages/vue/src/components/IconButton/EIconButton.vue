<script setup lang="ts">
import EIcon from "../Icon/EIcon.vue";
import type { IconProp } from "../../icons/types.js";
import "../../styles/base.css";

defineProps<{
  /** The glyph. */
  icon: IconProp;
  /** The accessible name. Write it as an action, such as "Download receipt". */
  label: string;
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

  .e-icon-btn:hover {
    background: var(--e-wash-hover);
    box-shadow: inset 0 0 0 1px var(--e-wash-ring);
  }

  .e-icon-btn:active {
    background: var(--e-wash-press);
    box-shadow: inset 0 0 0 1.5px var(--e-ink);
  }

  @media (prefers-reduced-motion: reduce) {
    .e-icon-btn {
      transition: none;
    }
  }

  /* Not part of the page when printed. The reference uses !important; a later rule in the same layer wins without it. */
  @media print {
    .e-icon-btn {
      display: none;
    }
  }
}
</style>
