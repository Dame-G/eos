<script setup lang="ts">
import { computed, ref, watch } from "vue";
import EFieldMessage from "../Field/EFieldMessage.vue";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";
import "./choice.css";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  /** What the person agrees to or turns on. */
  label: string;
  /** A line of detail under the label. */
  description?: string;
  /** A mixed state, such as select-all with some rows chosen. */
  indeterminate?: boolean;
  /** Hide the label visually but keep it for screen readers, for a table cell. No error text. */
  bare?: boolean;
  /** Not focusable and not submitted. */
  disabled?: boolean;
  /** The `required` attribute. */
  required?: boolean;
  /** What to fix. Shown under the row; sets `aria-invalid`. */
  error?: string;
  /** The name submitted with a form. */
  name?: string;
  /** The value submitted with a form when checked. */
  value?: string;
  /** The id of the input; the label points at it. @default generated */
  id?: string;
}>();

/** Whether it is checked. */
const model = defineModel<boolean>({ default: false });

const id = useUid(() => props.id);
const errorId = computed(() => `${id.value}-hint`);
const wrapped = computed(() => !!props.error && !props.bare);
const input = ref<HTMLInputElement | null>(null);
const attrs = useFieldAttrs();

watch(
  () => [props.indeterminate, input.value] as const,
  ([mixed, el]) => {
    if (el) el.indeterminate = !!mixed;
  },
  { flush: "post", immediate: true },
);

const inputBind = () => ({
  id: id.value,
  type: "checkbox" as const,
  class: "e-check",
  checked: model.value,
  value: props.value,
  required: props.required,
  disabled: props.disabled,
  name: props.name,
  "aria-invalid": props.error ? ("true" as const) : undefined,
  ...attrs.input(wrapped.value ? errorId.value : undefined),
});
const onChange = (e: Event) => (model.value = (e.target as HTMLInputElement).checked);

defineExpose({
  input,
  focus: () => input.value?.focus(),
});
</script>

<template>
  <div v-if="wrapped" class="e-choice-wrap" :class="attrs.wrapper().class" :style="attrs.wrapper().style">
    <label class="e-choice" :class="{ 'e-choice--disabled': disabled }" :for="id">
      <input ref="input" v-bind="inputBind()" @change="onChange" />
      <span class="e-choice-text">
        {{ label }}
        <span v-if="description" class="e-choice-desc">{{ description }}</span>
      </span>
    </label>
    <EFieldMessage :id="errorId" :error="error" />
  </div>
  <label
    v-else
    class="e-choice"
    :class="[{ 'e-choice--bare': bare, 'e-choice--disabled': disabled }, attrs.wrapper().class]"
    :style="attrs.wrapper().style"
    :for="id"
  >
    <input ref="input" v-bind="inputBind()" @change="onChange" />
    <span v-if="bare" class="e-sr">{{ label }}</span>
    <span v-else class="e-choice-text">
      {{ label }}
      <span v-if="description" class="e-choice-desc">{{ description }}</span>
    </span>
  </label>
</template>

<style>
@layer e.controls {
  .e-choice--bare {
    min-height: 0;
    padding: 0;
    gap: 0;
    justify-content: center;
  }

  .e-choice-wrap {
    display: grid;
  }

  .e-choice-wrap > .e-field-error {
    margin-top: calc(var(--e-space-1) - var(--e-space-2) - var(--e-focus-gap));
  }
}
</style>
