<script setup lang="ts">
import { ref } from "vue";
import EComboboxBase from "../Combobox/EComboboxBase.vue";
import type { EComboboxProps } from "../Combobox/types.js";

const props = withDefaults(defineProps<EComboboxProps>(), { clearable: true });

defineEmits<{
  /** The text in the input changed, by typing or by choosing a suggestion. Use it to fetch suggestions from a server. */
  inputChange: [text: string];
}>();

const model = defineModel<string>({ default: "" });

const open = defineModel<boolean>("open", { default: false });

const base = ref<InstanceType<typeof EComboboxBase> | null>(null);
defineExpose({
  input: () => base.value?.input ?? null,
  focus: () => base.value?.focus(),
});
</script>

<template>
  <EComboboxBase
    ref="base"
    v-bind="props"
    v-model="model"
    v-model:open="open"
    mode="free"
    @input-change="(text: string) => $emit('inputChange', text)"
  />
</template>
