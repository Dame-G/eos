<script setup lang="ts">
import AeIcon from "../Icon/AeIcon.vue";
import type { IconName } from "../../icons/phosphor.js";
import "../../styles/base.css";

defineProps<{
  /** The glyph. */
  icon: IconName | (string & {});
  /** The accessible name. Write it as an action, such as "Download receipt". */
  label: string;
  disabled?: boolean;
}>();
</script>

<template>
  <button type="button" class="ae-icon-btn" :aria-label="label" :disabled="disabled">
    <AeIcon :name="icon" />
  </button>
</template>

<style>
@layer ae.primitives {
  .ae-icon-btn {
    display: inline-grid;
    place-items: center;
    flex: none;
    width: var(--ae-control-height);
    height: var(--ae-control-height);
    padding: 0;
    border: 0;
    border-radius: var(--ae-radius-md);
    background: transparent;
    color: var(--ae-ink);
    cursor: pointer;
    transition: background-color var(--ae-duration-tap) var(--ae-easing-out);
  }

  .ae-icon-btn:hover {
    background: var(--ae-wash-hover);
    box-shadow: inset 0 0 0 1px var(--ae-wash-ring);
  }

  .ae-icon-btn:active {
    background: var(--ae-wash-press);
    box-shadow: inset 0 0 0 1.5px var(--ae-ink);
  }

  @media (prefers-reduced-motion: reduce) {
    .ae-icon-btn {
      transition: none;
    }
  }

  /* Not part of the page when printed. The reference uses !important; a later rule in the same layer wins without it. */
  @media print {
    .ae-icon-btn {
      display: none;
    }
  }
}
</style>
