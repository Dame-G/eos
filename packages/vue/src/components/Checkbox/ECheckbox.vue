<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
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
  /** Hides the label from the page and keeps it for screen readers, for a table cell. It shows no error text. */
  bare?: boolean;
  /** Disables the checkbox. It cannot take focus and is not submitted. */
  disabled?: boolean;
  /** Sets the `required` attribute. */
  required?: boolean;
  /** Shows what to fix under the row and sets `aria-invalid`. */
  error?: string;
  /** The name submitted with a form. */
  name?: string;
  /** The value submitted with a form when checked. */
  value?: string;
  /** The `id` of the input, which the label points at. @default generated */
  id?: string;
}>();

/** Whether it is checked. */
const model = defineModel<boolean>({ default: false });

const id = useUid(() => props.id);
const errorId = computed(() => `${id.value}-hint`);
const descId = computed(() => `${id.value}-desc`);
const shownError = computed(() => (props.bare ? undefined : props.error));
const shownDescription = computed(() => (props.bare ? undefined : props.description));
const describedBy = computed(
  () =>
    [shownError.value && errorId.value, shownDescription.value && descId.value].filter(Boolean).join(" ") || undefined,
);
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
  ...attrs.input(describedBy.value),
});

// A click clears the native mixed state and checks the box. The props stay the truth: put both back once the parent has answered.
function onChange(e: Event) {
  const el = e.target as HTMLInputElement;
  model.value = el.checked;
  void nextTick(() => {
    el.checked = model.value;
    el.indeterminate = !!props.indeterminate;
  });
}

defineExpose({
  input,
  focus: () => input.value?.focus(),
});
</script>

<template>
  <div class="e-choice-wrap" :class="attrs.wrapper().class" :style="attrs.wrapper().style">
    <label class="e-choice" :class="{ 'e-choice--bare': bare, 'e-choice--disabled': disabled }" :for="id">
      <input ref="input" v-bind="inputBind()" @change="onChange" />
      <span v-if="bare" class="e-sr">{{ label }}</span>
      <span v-else class="e-choice-text">
        {{ label }}
        <!-- Visible under the label, but kept out of its accessible name: the input points at it with aria-describedby. -->
        <span v-if="shownDescription" :id="descId" class="e-choice-desc" aria-hidden="true">{{ description }}</span>
      </span>
    </label>
    <EFieldMessage v-if="shownError" :id="errorId" :error="shownError" />
  </div>
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
    margin-top: calc(var(--e-space-1) - var(--e-space-2) - var(--e-stroke-focus));
  }
}
</style>
