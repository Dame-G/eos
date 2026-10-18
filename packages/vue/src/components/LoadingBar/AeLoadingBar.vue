<script setup lang="ts">
import { useMessages } from "../../config.js";
import "../../styles/base.css";

defineProps<{
  /** What is loading. Screen readers hear it as a progress bar; defaults to "Loading". */
  label?: string;
}>();

const t = useMessages();
</script>

<template>
  <div class="ae-loadbar" role="progressbar" :aria-label="label || t('loading')" aria-busy="true">
    <span class="ae-loadbar-fill"></span>
  </div>
</template>

<style>
@layer ae.primitives {
  .ae-loadbar {
    position: relative;
    height: 8px;
    overflow: hidden;
    border-radius: var(--ae-radius-pill);
    background: var(--ae-surface-tint);
    box-shadow: inset 0 0 0 1px var(--ae-border-strong);
  }

  .ae-loadbar-fill {
    position: absolute;
    inset: 0 auto 0 0;
    width: 40%;
    border-radius: var(--ae-radius-pill);
    background: var(--ae-primary);
    animation: ae-load 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }

  @keyframes ae-load {
    from {
      transform: translateX(-100%);
    }

    to {
      transform: translateX(250%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ae-loadbar-fill {
      width: 100%;
      animation: none;
      background: repeating-linear-gradient(135deg, var(--ae-primary) 0 8px, transparent 8px 16px);
    }
  }

  @media (forced-colors: active) {
    .ae-loadbar {
      border: 1px solid CanvasText;
    }

    .ae-loadbar-fill {
      background: Highlight;
    }
  }
}
</style>
