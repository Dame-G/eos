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
  /** The id of the input; the label points at it. @default generated */
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

  .e-switch-track {
    --e-switch-w: 44px;
    --e-thumb: 16px;
    --e-thumb-inset: var(--e-space-1);
    --e-thumb-travel: calc(var(--e-switch-w) - var(--e-thumb) - 2 * var(--e-thumb-inset));
    --e-ring: var(--e-border-strong);

    position: relative;
    flex: none;
    width: var(--e-switch-w);
    height: 24px;
    box-sizing: border-box;
    border: var(--e-stroke-edge) solid var(--e-ring);
    border-radius: var(--e-radius-md);
    background: var(--e-surface-tint);
    background-clip: padding-box;
    transition:
      background-color var(--e-duration-tap) var(--e-easing-out),
      border-color var(--e-duration-tap) var(--e-easing-out);
  }

  .e-switch-track::after {
    content: "";
    position: absolute;
    top: 50%;
    inset-inline-start: calc(var(--e-thumb-inset) - var(--e-stroke-edge));
    width: var(--e-thumb);
    height: var(--e-thumb);
    margin-top: calc(var(--e-thumb) / -2);
    box-sizing: border-box;

    /* The thumb is a small button face with a slab under it. */
    border: var(--e-stroke-edge) solid color-mix(in srgb, var(--e-ink), var(--e-shade-slab));
    border-bottom-width: calc(var(--e-stroke-edge) + var(--e-depth));
    border-radius: var(--e-radius-sm);
    background: var(--e-ink);
    transition: transform var(--e-duration-move, 160ms) var(--e-easing-out);
  }

  .e-switch:hover .e-switch-input:not(:checked, :disabled) + .e-switch-track {
    --e-ring: var(--e-ink);

    background-color: color-mix(in srgb, var(--e-primary) 16%, var(--e-surface));
  }

  .e-switch-input:checked + .e-switch-track {
    --e-ring: var(--e-primary);

    background-color: var(--e-primary);
    background-clip: border-box;
  }

  .e-switch:hover .e-switch-input:checked:not(:disabled) + .e-switch-track {
    --e-ring: color-mix(in srgb, var(--e-primary), var(--e-shade-press));

    background-color: color-mix(in srgb, var(--e-primary), var(--e-shade-press));
  }

  .e-switch-input:checked + .e-switch-track::after {
    border-color: color-mix(in srgb, var(--e-on-primary), var(--e-shade-slab));
    background: var(--e-on-primary);
    transform: translateX(var(--e-thumb-travel));
  }

  .e-switch-input:disabled + .e-switch-track {
    border-color: transparent;
    outline: var(--e-stroke-edge) dashed var(--e-border-strong);
    outline-offset: calc(-1 * var(--e-stroke-edge));
    background-color: var(--e-surface-tint);
  }

  .e-switch-input:disabled + .e-switch-track::after {
    border-color: var(--e-muted);
    border-bottom-width: var(--e-stroke-edge);
    background: var(--e-muted);
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
    transform: translateX(calc(-1 * var(--e-thumb-travel)));
  }
}
</style>
