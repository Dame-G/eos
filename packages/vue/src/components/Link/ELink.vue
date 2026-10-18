<script setup lang="ts">
import "../../styles/base.css";

defineProps<{
  /** Where the link goes. */
  href: string;
  /** Opens in a new tab. */
  external?: boolean;
}>();

defineSlots<{
  /** The link text: say where it goes. */
  default(): unknown;
}>();
</script>

<template>
  <a class="e-link" :href="href" :target="external ? '_blank' : undefined" :rel="external ? 'noreferrer' : undefined">
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

  @media print {
    .e-link::after {
      content: " (" attr(href) ")";
      font-size: 0.85em;
    }
  }
}
</style>
