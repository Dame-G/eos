<script setup lang="ts" generic="T extends string = string, M extends boolean = false">
import { computed, ref } from "vue";
import EField from "../Field/EField.vue";
import type { EFieldCommonProps } from "../Field/fieldProps.js";
import type { ELabelProps } from "../Field/labelProps.js";
import ESelectControl from "./ESelectControl.vue";
import { normalizeOptions } from "./options.js";
import type { ESelectFields } from "./selectProps.js";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import "../../styles/base.css";

defineOptions({ inheritAttrs: false });

const props = defineProps<ELabelProps & Omit<EFieldCommonProps, "hideLabel"> & ESelectFields<T, M>>();

/** The chosen option's `value`, or an empty string for nothing. With `multiple` it is the array of chosen values, in the order chosen, and `[]` for nothing. */
const model = defineModel<M extends true ? T[] : T | "">();

/** Whether the list is open. A disabled or read-only field never opens. */
const open = defineModel<boolean>("open", { default: false });

const attrs = useFieldAttrs();
const control = ref<InstanceType<typeof ESelectControl> | null>(null);
const options = computed(() => normalizeOptions<T>(props.options));
const current = computed<string | string[]>(() => {
  const v = model.value as string | string[] | undefined;
  return props.multiple ? (Array.isArray(v) ? v : []) : typeof v === "string" ? v : "";
});

type FieldSlot = { id: string; ariaInvalid: "true" | undefined; ariaDescribedby: string | undefined };
function triggerAttrs(field?: FieldSlot) {
  return {
    id: field?.id ?? props.id,
    "aria-invalid": field?.ariaInvalid,
    "aria-label": props.bare ? (props.ariaLabel ?? props.label) : undefined,
    ...attrs.input(field?.ariaDescribedby),
  };
}
const bind = (field?: FieldSlot) => ({
  options: options.value,
  placeholder: props.placeholder,
  disabled: props.disabled,
  readonly: props.readonly,
  required: props.required,
  multiple: props.multiple,
  clearable: props.clearable,
  loading: props.loading,
  name: props.name,
  form: attrs.form(),
  label: field ? props.label : (props.ariaLabel ?? props.label),
  triggerAttrs: triggerAttrs(field),
});
defineExpose({
  input: computed(() => control.value?.trigger ?? null),
  focus: () => control.value?.trigger?.focus(),
});
</script>

<template>
  <div v-if="bare" v-bind="attrs.wrapper()">
    <ESelectControl
      ref="control"
      v-bind="bind()"
      v-model:open="open"
      :model-value="current"
      @update:model-value="model = $event as never"
    />
  </div>
  <EField
    v-else
    v-bind="attrs.wrapper()"
    :id="id"
    :label="label ?? ''"
    :hide-label="hideLabel"
    :hint="hint"
    :error="error"
    :required="required"
    :optional="optional"
  >
    <template #default="field">
      <ESelectControl
        ref="control"
        v-bind="bind(field)"
        v-model:open="open"
        :model-value="current"
        @update:model-value="model = $event as never"
      />
    </template>
  </EField>
</template>
