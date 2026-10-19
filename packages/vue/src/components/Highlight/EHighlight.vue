<script setup lang="ts">
import "../../styles/base.css";

defineProps<{
  /** Renders a `code` element in the mono font, for a name, value or snippet inside a sentence. Without it the element is a `mark`, for a word worth noticing. */
  code?: boolean;
}>();

defineSlots<{
  /** The text to mark. */
  default(): unknown;
}>();
</script>

<template>
  <code v-if="code" class="e-highlight e-highlight--code"><slot /></code>
  <mark v-else class="e-highlight"><slot /></mark>
</template>

<style>
@layer e.primitives {
  .e-highlight {
    padding: 0 0.2em;
    border-radius: 0.15em;
    background: linear-gradient(
      to bottom,
      transparent 18%,
      color-mix(in srgb, var(--e-secondary) 38%, transparent) 18% 94%,
      transparent 94%
    );
    box-decoration-break: clone;
    -webkit-box-decoration-break: clone;
    color: var(--e-ink);
    font-weight: 500;
  }

  .e-highlight--code {
    font-family: var(--e-font-mono);
    font-size: 0.9em;
  }

  @media (forced-colors: active) {
    .e-highlight {
      forced-color-adjust: none;
      background: Highlight;
      color: HighlightText;
    }
  }
}
</style>
