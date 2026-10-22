<script setup lang="ts">
import { computed, ref } from "vue";
import EComboboxBase from "./EComboboxBase.vue";
import type { EComboboxProps } from "./types.js";

const props = withDefaults(defineProps<EComboboxProps>(), { clearable: true });

defineEmits<{
  /** The text in the input changed, by typing or by choosing. Use it to fetch options from a server. */
  inputChange: [text: string];
}>();

/** The `value` of the chosen option, empty for nothing. With `multiple` it holds the chosen values in the order chosen (replaced, not mutated). With `freeform` it is the typed text, updated on every key. @default "" or [] */
const model = defineModel<string | string[]>();

/** Whether the list is open. Setting it moves no focus, and a disabled field never opens. */
const open = defineModel<boolean>("open", { default: false });

const base = ref<InstanceType<typeof EComboboxBase> | null>(null);
defineExpose({
  input: computed(() => base.value?.input ?? null),
  focus: () => base.value?.focus(),
});
</script>

<template>
  <EComboboxBase
    ref="base"
    v-bind="props"
    v-model="model"
    v-model:open="open"
    @input-change="(text: string) => $emit('inputChange', text)"
  />
</template>
