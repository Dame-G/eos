<script setup lang="ts">
import { ref } from "vue";
import EComboboxBase from "../Combobox/EComboboxBase.vue";
import type { EComboboxProps } from "../Combobox/types.js";

const props = withDefaults(defineProps<EComboboxProps>(), { clearable: true });

defineEmits<{
  /** The text in the input changed, by typing or by choosing. Use it to fetch options from a server. */
  inputChange: [text: string];
}>();

/** The values of the chosen options, in the order they were chosen. */
const model = defineModel<string[]>({ default: () => [] });

/** Whether the list is open. */
const open = defineModel<boolean>("open", { default: false });

const base = ref<InstanceType<typeof EComboboxBase> | null>(null);
defineExpose({
  /** The `<input>` element. */
  input: () => base.value?.input ?? null,
  /** Puts the cursor in the input. */
  focus: () => base.value?.focus(),
});
</script>

<template>
  <EComboboxBase
    ref="base"
    v-bind="props"
    v-model="model"
    v-model:open="open"
    mode="multiple"
    @input-change="(text: string) => $emit('inputChange', text)"
  />
</template>

<style>
@layer e.controls {
  /* Everything is drawn by EComboboxBase, with the rules in Combobox/EComboboxBase.vue. */
}
</style>
