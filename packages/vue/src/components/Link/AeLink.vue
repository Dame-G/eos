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
  <a class="ae-link" :href="href" :target="external ? '_blank' : undefined" :rel="external ? 'noreferrer' : undefined">
    <slot />
  </a>
</template>

<style>
@layer ae.primitives {
  .ae-link {
    color: var(--ae-primary);
    font-weight: 500;
    text-decoration: underline;
    text-decoration-thickness: var(--ae-stroke-edge);
    text-underline-offset: 4px;
    text-decoration-color: var(--ae-primary);
  }

  .ae-link:hover {
    color: var(--ae-ink);
    text-decoration-color: var(--ae-ink);
  }

  .ae-link:focus-visible {
    outline: var(--ae-stroke-focus) solid var(--ae-focus-ring);
    outline-offset: var(--ae-focus-gap);
    border-radius: var(--ae-radius-sm);
  }

  @media print {
    .ae-link::after {
      content: " (" attr(href) ")";
      font-size: 0.85em;
    }
  }
}
</style>
