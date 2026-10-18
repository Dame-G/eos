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
  <div class="e-loadbar" role="progressbar" :aria-label="label || t('loading')" aria-busy="true">
    <span class="e-loadbar-fill"></span>
  </div>
</template>

<style>
@layer e.primitives {
  .e-loadbar {
    position: relative;
    height: 8px;
    overflow: hidden;
    border-radius: var(--e-radius-pill);
    background: var(--e-surface-tint);
    box-shadow: inset 0 0 0 1px var(--e-border-strong);
  }

  .e-loadbar-fill {
    position: absolute;
    inset: 0 auto 0 0;
    width: 40%;
    border-radius: var(--e-radius-pill);
    background: var(--e-primary);
    animation: e-load 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  }

  @keyframes e-load {
    from {
      transform: translateX(-100%);
    }

    to {
      transform: translateX(250%);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .e-loadbar-fill {
      width: 100%;
      animation: none;
      background: repeating-linear-gradient(135deg, var(--e-primary) 0 8px, transparent 8px 16px);
    }
  }

  @media (forced-colors: active) {
    .e-loadbar {
      border: 1px solid CanvasText;
    }

    .e-loadbar-fill {
      background: Highlight;
    }
  }
}
</style>
