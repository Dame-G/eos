<script setup lang="ts">
import SpinnerRing from "../Spinner/SpinnerRing.vue";
import { focusInside } from "../../composables/useFocusInside.js";
import type { EFieldSize } from "./fieldProps.js";
import "../../styles/base.css";
import "../TextField/input.css";

defineProps<{
  invalid?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  loading?: boolean;
  size?: EFieldSize;
}>();

defineSlots<{
  /** The input, with units and buttons beside it. */
  default(): unknown;
}>();
</script>

<template>
  <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
  <div
    class="e-input-wrap"
    :data-invalid="invalid ? '' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    :data-size="size && size !== 'md' ? size : undefined"
    @click="focusInside"
  >
    <slot />
    <SpinnerRing v-if="loading" class="e-input-spin" />
  </div>
</template>
