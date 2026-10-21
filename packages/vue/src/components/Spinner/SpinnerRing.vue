<script setup lang="ts">
import "../../styles/base.css";
</script>

<template>
  <svg class="e-ring" viewBox="0 0 24 24" aria-hidden="true">
    <circle class="e-ring-track" cx="12" cy="12" r="9" pathLength="36" />
    <circle class="e-ring-arc" cx="12" cy="12" r="9" pathLength="36" />
  </svg>
</template>

<style>
@layer e.primitives {
  /* The bare ring that ESpinner and a loading EButton share: no role and no text, so it carries no announcement of its own. It takes the colour of the text it sits in and is as big as the text, unless a rule sets its size. A solid arc travels round a still track of faint dashes: the progress bar bent into a ring. */
  .e-ring {
    flex: none;
    width: 1em;
    height: 1em;
    fill: none;
    stroke-width: 4.5;
  }

  .e-ring-track {
    stroke: color-mix(in srgb, currentcolor 22%, transparent);
    stroke-dasharray: 1.5 1.5;
  }

  .e-ring-arc {
    stroke: currentcolor;
    stroke-linecap: round;
    stroke-dasharray: 11 25;
    transform-origin: center;
    animation: e-spin 0.9s linear infinite;
  }

  @keyframes e-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .e-ring-arc {
      animation-duration: 3s;
    }
  }

  @media (forced-colors: active) {
    .e-ring-track {
      stroke: GrayText;
    }

    .e-ring-arc {
      stroke: Highlight;
    }
  }
}
</style>
