<script setup lang="ts">
import { ref } from "vue";
import AeComboboxBase from "../Combobox/AeComboboxBase.vue";
import type { AeComboboxProps } from "../Combobox/types.js";

const props = withDefaults(defineProps<AeComboboxProps>(), { clearable: true });

defineEmits<{
  /** The text in the input changed, by typing or by choosing. Use it to fetch options from a server. */
  inputChange: [text: string];
}>();

/** The values of the chosen options, in the order they were chosen. */
const model = defineModel<string[]>({ default: () => [] });

const base = ref<InstanceType<typeof AeComboboxBase> | null>(null);
defineExpose({
  /** The `<input>` element. */
  input: () => base.value?.input ?? null,
  /** Puts the cursor in the input. */
  focus: () => base.value?.focus(),
});
</script>

<template>
  <AeComboboxBase
    ref="base"
    v-bind="props"
    v-model="model"
    mode="multiple"
    @input-change="(text: string) => $emit('inputChange', text)"
  />
</template>

<style>
@layer ae.controls {
  /* Everything is drawn by AeComboboxBase, with the rules in Combobox/AeComboboxBase.vue. */
}
</style>
