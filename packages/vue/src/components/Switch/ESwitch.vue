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
  /** Disables the switch. */
  disabled?: boolean;
  /** The name submitted with a form. */
  name?: string;
  /** The value submitted with a form when on. */
  value?: string;
  /** The id of the input, which the label points at. @default generated */
  id?: string;
}>();

/** On or off. */
const model = defineModel<boolean>({ default: false });

const id = useUid(() => props.id);
const input = ref<HTMLInputElement | null>(null);
const attrs = useFieldAttrs();

defineExpose({
  input,
  focus: () => input.value?.focus(),
});
</script>

<template>
  <label
    class="e-choice e-switch"
    :class="[{ 'e-choice--disabled': disabled }, attrs.wrapper().class]"
    :style="attrs.wrapper().style"
    :for="id"
  >
    <input
      :id="id"
      ref="input"
      type="checkbox"
      role="switch"
      class="e-switch-input"
      :name="name"
      :value="value"
      :checked="model"
      :disabled="disabled"
      v-bind="attrs.input()"
      @change="model = ($event.target as HTMLInputElement).checked"
    />
    <span class="e-switch-track" aria-hidden="true" />
    <span class="e-choice-text">
      {{ label }}
      <span v-if="description" class="e-choice-desc">{{ description }}</span>
    </span>
  </label>
</template>

<style>
@layer e.controls {
  .e-switch-input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
  }

  /* A pressed-in track with a small button face for the thumb. The sizes follow the checkbox, so they grow with the text scale. */
  .e-switch-track {
    --_w: calc(2 * var(--e-check-size) - var(--e-space-1));
    --_thumb: calc(var(--e-check-size) - 2 * var(--e-space-1));
    --_inset: var(--e-space-1);
    --_travel: calc(var(--_w) - var(--_thumb) - 2 * var(--_inset));
    --_ring: var(--e-border-strong);

    position: relative;
    flex: none;
    width: var(--_w);
    height: var(--e-check-size);
    box-sizing: border-box;
    border: var(--e-stroke-edge) solid var(--_ring);
    border-radius: var(--e-radius-md);
    background: var(--e-surface-tint);
    background-clip: padding-box;
    box-shadow: var(--e-well);
    transition:
      background-color var(--e-duration-tap) var(--e-easing-out),
      border-color var(--e-duration-tap) var(--e-easing-out);
  }

  .e-switch-track::after {
    content: "";
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: calc(var(--_inset) - var(--e-stroke-edge));
    width: var(--_thumb);
    height: var(--_thumb);
    margin-block-start: calc(var(--_thumb) / -2);
    box-sizing: border-box;

    /* The thumb is a small button face with a slab under it. */
    border: var(--e-stroke-edge) solid var(--e-slab-ink);
    border-bottom-width: calc(var(--e-stroke-edge) + 0.6 * var(--e-depth));
    border-radius: var(--e-radius-sm);
    background: var(--e-ink);
    transition: transform var(--e-duration-move) var(--e-easing-out);
  }

  .e-switch:hover .e-switch-input:not(:checked, :disabled) + .e-switch-track {
    --_ring: var(--e-ink);

    background-color: var(--e-primary-soft);
  }

  .e-switch-input:checked + .e-switch-track {
    --_ring: var(--e-primary-slab);

    background-color: var(--e-primary);
    background-clip: border-box;
  }

  .e-switch:hover .e-switch-input:checked:not(:disabled) + .e-switch-track {
    --_ring: var(--e-primary-press);

    background-color: var(--e-primary-hover);
  }

  .e-switch-input:checked + .e-switch-track::after {
    border-color: var(--e-primary-slab);
    background: var(--e-on-primary);
    transform: translateX(var(--_travel));
  }

  .e-switch-input:disabled + .e-switch-track {
    border-color: transparent;
    outline: var(--e-stroke-edge) dashed var(--e-border-strong);
    outline-offset: calc(-1 * var(--e-stroke-edge));
    background-color: var(--e-disabled-fill);
    box-shadow: none;
  }

  .e-switch-input:disabled + .e-switch-track::after {
    border-color: var(--e-disabled-ink);
    border-bottom-width: var(--e-stroke-edge);
    background: var(--e-disabled-ink);
  }

  @media (prefers-reduced-motion: reduce) {
    .e-switch-track::after {
      transition: none;
    }
  }

  @media (forced-colors: active) {
    .e-switch-input:checked + .e-switch-track {
      forced-color-adjust: none;
      background: Highlight;
    }

    .e-switch-track::after {
      forced-color-adjust: none;
      background: ButtonText;
    }
  }

  :dir(rtl) .e-switch-input:checked + .e-switch-track::after {
    transform: translateX(calc(-1 * var(--_travel)));
  }
}
</style>
