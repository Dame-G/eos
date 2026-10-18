<script setup lang="ts">
import { ref } from "vue";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";
import "../Checkbox/choice.css";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  /** The setting, named by what it does. */
  label: string;
  /** A line of detail under the label. */
  description?: string;
  disabled?: boolean;
  /** The name submitted with a form. */
  name?: string;
  /** The value submitted with a form when on. */
  value?: string;
  /** The id of the input; the label points at it. Generated when left out. */
  id?: string;
}>();

/** Whether the switch is on. */
const model = defineModel<boolean>({ default: false });

const id = useUid(() => props.id);
const input = ref<HTMLInputElement | null>(null);
const attrs = useFieldAttrs();

defineExpose({
  /** The `<input>` element. */
  input,
  /** Moves focus to the switch. */
  focus: () => input.value?.focus(),
});
</script>

<template>
  <label
    class="ae-choice ae-switch"
    :class="[{ 'ae-choice--disabled': disabled }, attrs.wrapper().class]"
    :style="attrs.wrapper().style"
    :for="id"
  >
    <input
      :id="id"
      ref="input"
      type="checkbox"
      role="switch"
      class="ae-switch-input"
      :name="name"
      :value="value"
      :checked="model"
      :disabled="disabled"
      v-bind="attrs.input()"
      @change="model = ($event.target as HTMLInputElement).checked"
    />
    <span class="ae-switch-track" aria-hidden="true" />
    <span class="ae-choice-text">
      {{ label }}
      <span v-if="description" class="ae-choice-desc">{{ description }}</span>
    </span>
  </label>
</template>

<style>
@layer ae.controls {
  .ae-switch-input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
  }

  .ae-switch-track {
    position: relative;
    flex: none;
    width: 44px;
    height: 24px;
    border: var(--ae-stroke-edge) solid var(--ae-border-strong);
    border-radius: var(--ae-radius-pill);
    background: var(--ae-surface-tint);
    transition:
      background-color var(--ae-duration-tap) var(--ae-easing-out),
      border-color var(--ae-duration-tap) var(--ae-easing-out);
  }

  .ae-switch-track::after {
    content: "";
    position: absolute;
    top: 50%;
    inset-inline-start: 3px;
    width: 14px;
    height: 14px;
    margin-top: -7px;
    border-radius: 50%;
    background: var(--ae-ink);
    transition: transform var(--ae-duration-move, 160ms) var(--ae-easing-out);
  }

  .ae-switch:hover .ae-switch-track {
    border-color: var(--ae-ink);
  }

  .ae-switch-input:checked + .ae-switch-track {
    background: var(--ae-primary);
    border-color: var(--ae-primary);
  }

  .ae-switch-input:checked + .ae-switch-track::after {
    background: var(--ae-on-primary);
    transform: translateX(20px);
  }

  .ae-switch-input:disabled + .ae-switch-track {
    border-style: dashed;
    background: var(--ae-surface-tint);
  }

  .ae-switch-input:disabled + .ae-switch-track::after {
    background: var(--ae-muted);
  }

  @media (prefers-reduced-motion: reduce) {
    .ae-switch-track::after {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .ae-switch-input:checked + .ae-switch-track {
      forced-color-adjust: none;
      background: Highlight;
    }

    .ae-switch-track::after {
      forced-color-adjust: none;
      background: ButtonText;
    }
  }

  :dir(rtl) .ae-switch-input:checked + .ae-switch-track::after {
    transform: translateX(-20px);
  }
}
</style>
