<script setup lang="ts">
import { computed, ref } from "vue";
import EFieldFlag from "../Field/EFieldFlag.vue";
import EFieldMessage from "../Field/EFieldMessage.vue";
import { keepIfReadonly, useChoiceMessage } from "../Checkbox/useChoiceMessage.js";
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
  /** Disables the switch. It cannot take focus and is not submitted. */
  disabled?: boolean;
  /** Shows the state but blocks flipping it. The switch stays focusable and is still submitted. */
  readonly?: boolean;
  /** Sets the `required` attribute and shows "Required" beside the label. */
  required?: boolean;
  /** Shows "Optional" beside the label. Only the rarer of required and optional needs a flag. */
  optional?: boolean;
  /** Help under the row, linked with `aria-describedby`. */
  hint?: string;
  /** Shows what to fix under the row, in place of the hint, and sets `aria-invalid`. */
  error?: string;
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
const descId = computed(() => `${id.value}-desc`);
const message = computed(() => ({ hint: props.hint, error: props.error }));
const { messageId, describedBy } = useChoiceMessage(id, message);
const input = ref<HTMLInputElement | null>(null);
const attrs = useFieldAttrs();
const guard = keepIfReadonly(() => props.readonly);

defineExpose({
  input,
  focus: () => input.value?.focus(),
});
</script>

<template>
  <div class="e-choice-wrap" :class="attrs.wrapper().class" :style="attrs.wrapper().style">
    <label class="e-choice e-switch" :class="{ 'e-choice--disabled': disabled }" :for="id">
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
        :required="required"
        :aria-readonly="readonly ? 'true' : undefined"
        :aria-invalid="error ? 'true' : undefined"
        v-bind="attrs.input(describedBy(description && descId))"
        @click="guard"
        @change="model = ($event.target as HTMLInputElement).checked"
      />
      <span class="e-switch-track" aria-hidden="true" />
      <span class="e-choice-text">
        <span class="e-choice-label">
          {{ label }}
          <EFieldFlag :required="required" :optional="optional" />
        </span>
        <!-- Visible under the label, but kept out of its accessible name: the input points at it with aria-describedby. -->
        <span v-if="description" :id="descId" class="e-choice-desc" aria-hidden="true">{{ description }}</span>
      </span>
    </label>
    <EFieldMessage :id="messageId" :error="error" :hint="hint" />
  </div>
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
    --_w: calc(2 * var(--e-check-size) - var(--e-gap-tight));
    --_thumb: calc(var(--e-check-size) - 2 * var(--e-gap-tight));
    --_inset: var(--e-gap-tight);
    --_travel: calc(var(--_w) - var(--_thumb) - 2 * var(--_inset));
    --_ring: var(--e-border-strong);

    position: relative;
    flex: none;
    width: var(--_w);
    height: var(--e-check-size);
    box-sizing: border-box;
    border: var(--e-stroke-edge) solid var(--_ring);
    border-radius: var(--e-radius-sm);
    background: var(--e-surface-tint);
    background-clip: padding-box;
    box-shadow: var(--e-well);
    transition: var(--e-transition-state);
  }

  .e-switch-track::after {
    --_lift: var(--e-slab-thin);

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
    border-bottom-width: calc(var(--e-stroke-edge) + var(--_lift));

    /* Concentric with the track: the thumb's edge is `--_inset` inside the track's outer edge, border included. */
    border-radius: max(0px, calc(var(--e-radius-sm) - var(--_inset)));
    background: var(--e-ink);
    transition:
      transform var(--e-duration-move) var(--e-easing-out),
      border-bottom-width var(--e-duration-tap) var(--e-easing-out);
  }

  .e-switch:hover .e-switch-input:not(:checked, :disabled) + .e-switch-track {
    --_ring: var(--e-wash-ring);

    background-color: var(--e-primary-soft);
  }

  .e-switch:active .e-switch-input:not(:checked, :disabled) + .e-switch-track {
    --_ring: var(--e-ink);
  }

  /* Off, the track is pressed in. On, it is a raised primary face, as a checked box or radio is, so the well goes. */
  .e-switch-input:checked + .e-switch-track {
    --_ring: var(--e-primary-slab);

    background-color: var(--e-primary);
    background-clip: border-box;
    box-shadow: none;
  }

  .e-switch:hover .e-switch-input:checked:not(:disabled) + .e-switch-track {
    background-color: var(--e-primary-hover);
  }

  .e-switch:active .e-switch-input:checked:not(:disabled) + .e-switch-track {
    background-color: var(--e-primary-press);
  }

  .e-switch:active .e-switch-input:not(:disabled) + .e-switch-track::after {
    --_lift: 0px;
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
    --_lift: 0px;

    border-color: var(--e-disabled-ink);
    background: var(--e-disabled-ink);
  }

  .e-switch-input[aria-invalid="true"]:not(:disabled) + .e-switch-track {
    --_ring: var(--e-danger);
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
