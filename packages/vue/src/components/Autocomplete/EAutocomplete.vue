<script setup lang="ts">
import { ref } from "vue";
import EComboboxBase from "../Combobox/EComboboxBase.vue";
import type { EComboboxProps } from "../Combobox/types.js";

const props = withDefaults(defineProps<EComboboxProps>(), { clearable: true });

defineEmits<{
  /** The text in the input changed, by typing or by choosing a suggestion. Use it to fetch suggestions from a server. */
  inputChange: [text: string];
}>();

/** The text. Suggestions fill it in; anything typed is accepted. */
const model = defineModel<string>({ default: "" });

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
    mode="free"
    @input-change="(text: string) => $emit('inputChange', text)"
  />
</template>

<style>
@layer e.controls {
  /* Everything is drawn by EComboboxBase, with the rules in Combobox/EComboboxBase.vue. */
}
</style>
