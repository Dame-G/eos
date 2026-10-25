<script setup lang="ts">
import SpinnerRing from "../Spinner/SpinnerRing.vue";
import { focusInside } from "../../composables/focusInside.js";
import { sizeAttr, type EFieldSize } from "./fieldProps.js";
import "../../styles/base.css";
import "../../styles/controls/input.css";

/** Internal: the box around an input and what sits beside it (units, buttons, a spinner). One root, so it can be a Reka anchor's child. Not exported. */
defineProps<{
  invalid?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  loading?: boolean;
  size?: EFieldSize | undefined;
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
    :data-size="sizeAttr(size)"
    @click="focusInside"
  >
    <slot />
    <SpinnerRing v-if="loading" class="e-input-spin" />
  </div>
</template>
