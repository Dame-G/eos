<script setup lang="ts">
import EButton from "../Button/EButton.vue";
import type { IconName } from "../../icons/phosphor.js";
import "../../styles/base.css";

defineProps<{
  /** An icon before the label. */
  icon?: IconName | (string & {});
  disabled?: boolean;
}>();

defineSlots<{
  /** The label. It names the option, so keep it the same in both states. */
  default(): unknown;
}>();

/** Whether the button is pressed. */
const model = defineModel<boolean>({ default: false });
</script>

<template>
  <EButton
    variant="outline"
    class="e-toggle"
    :icon="icon"
    :disabled="disabled"
    :aria-pressed="model ? 'true' : 'false'"
    @click="model = !model"
  >
    <slot />
  </EButton>
</template>

<style>
@layer e.composites {
  .e-toggle[aria-pressed="true"] {
    background: var(--e-surface-tint);
    color: var(--e-primary);
    box-shadow: inset 0 0 0 2px var(--e-primary);
  }

  @media (forced-colors: active) {
    .e-toggle[aria-pressed="true"] {
      forced-color-adjust: none;
      background: Highlight;
      color: HighlightText;
    }
  }
}
</style>
