<script setup lang="ts">
import { computed, ref, watch } from "vue";
import AeFieldMessage from "../Field/AeFieldMessage.vue";
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
  /** Hide the label visually but keep it for screen readers, for a table cell. */
  bare?: boolean;
  disabled?: boolean;
  required?: boolean;
  /** What to fix. Shown under the row, with `aria-invalid`. */
  error?: string;
  /** The name submitted with a form. */
  name?: string;
  /** The value submitted with a form when checked. */
  value?: string;
  /** The id of the input; the label points at it. Generated when left out. */
  id?: string;
}>();

/** Whether the box is checked. */
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

/** The checkbox's own attributes, with the consumer's fall-through ones last. */
const inputBind = () => ({
  id: id.value,
  type: "checkbox" as const,
  class: "ae-check",
  checked: model.value,
  value: props.value,
  required: props.required,
  disabled: props.disabled,
  name: props.name,
  "aria-invalid": props.error ? ("true" as const) : undefined,
  ...attrs.input(props.error ? errorId.value : undefined),
});
const onChange = (e: Event) => (model.value = (e.target as HTMLInputElement).checked);

defineExpose({
  /** The `<input>` element. */
  input,
  /** Moves focus to the checkbox. */
  focus: () => input.value?.focus(),
});
</script>

<template>
  <div v-if="wrapped" class="ae-choice-wrap" :class="attrs.wrapper().class" :style="attrs.wrapper().style">
    <label class="ae-choice" :class="{ 'ae-choice--disabled': disabled }" :for="id">
      <input ref="input" v-bind="inputBind()" @change="onChange" />
      <span class="ae-choice-text">
        {{ label }}
        <span v-if="description" class="ae-choice-desc">{{ description }}</span>
      </span>
    </label>
    <AeFieldMessage :id="errorId" :error="error" />
  </div>
  <label
    v-else
    class="ae-choice"
    :class="[{ 'ae-choice--bare': bare, 'ae-choice--disabled': disabled }, attrs.wrapper().class]"
    :style="attrs.wrapper().style"
    :for="id"
  >
    <input ref="input" v-bind="inputBind()" @change="onChange" />
    <span v-if="bare" class="ae-sr">{{ label }}</span>
    <span v-else class="ae-choice-text">
      {{ label }}
      <span v-if="description" class="ae-choice-desc">{{ description }}</span>
    </span>
  </label>
</template>

<style>
@layer ae.controls {
  .ae-choice--bare {
    min-height: 0;
    padding: 0;
    gap: 0;
    justify-content: center;
  }

  .ae-choice-wrap {
    display: grid;
  }

  .ae-choice-wrap > .ae-field-error {
    margin-top: -6px;
  }
}
</style>
