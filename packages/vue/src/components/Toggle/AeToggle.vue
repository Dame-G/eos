<script setup lang="ts">
import AeButton from "../Button/AeButton.vue";
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
  <AeButton
    variant="outline"
    class="ae-toggle"
    :icon="icon"
    :disabled="disabled"
    :aria-pressed="model ? 'true' : 'false'"
    @click="model = !model"
  >
    <slot />
  </AeButton>
</template>

<style>
@layer ae.composites {
  .ae-toggle[aria-pressed="true"] {
    background: var(--ae-surface-tint);
    color: var(--ae-primary);
    box-shadow: inset 0 0 0 2px var(--ae-primary);
  }

  @media (forced-colors: active) {
    .ae-toggle[aria-pressed="true"] {
      forced-color-adjust: none;
      background: Highlight;
      color: HighlightText;
    }
  }
}
</style>
