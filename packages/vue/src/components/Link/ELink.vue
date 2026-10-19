<script setup lang="ts">
import EIcon from "../Icon/EIcon.vue";
import type { IconProp } from "../../icons/types.js";
import "../../styles/base.css";

defineProps<{
  /** Where the link goes. */
  href: string;
  /** Opens in a new tab. */
  external?: boolean;
  /** An icon before the text: a built-in name, a name from your icon set, or an icon component. */
  icon?: IconProp;
}>();

defineSlots<{
  /** The link text: say where it goes. */
  default(): unknown;
}>();
</script>

<template>
  <a
    class="e-link"
    :class="icon && 'e-link--icon'"
    :href="href"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noreferrer' : undefined"
  >
    <EIcon v-if="icon" :name="icon" />
    <slot />
  </a>
</template>

<style>
@layer e.primitives {
  .e-link {
    color: var(--e-primary);
    font-weight: 500;
    text-decoration: underline;
    text-decoration-thickness: var(--e-stroke-edge);
    text-underline-offset: 4px;
    text-decoration-color: var(--e-primary);
  }

  .e-link:hover {
    color: var(--e-ink);
    text-decoration-color: var(--e-ink);
  }

  .e-link:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-focus-gap);
    border-radius: var(--e-radius-sm);
  }

  .e-link--icon {
    display: inline-flex;
    align-items: center;
    gap: var(--e-space-2);
  }

  .e-link--icon .e-icon {
    width: 1.25em;
    height: 1.25em;
  }

  @media print {
    .e-link::after {
      content: " (" attr(href) ")";
      font-size: 0.85em;
    }
  }
}
</style>
