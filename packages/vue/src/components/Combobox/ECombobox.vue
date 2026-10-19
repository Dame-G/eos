<script setup lang="ts">
import { ref } from "vue";
import EComboboxBase from "./EComboboxBase.vue";
import type { EComboboxProps } from "./types.js";

const props = withDefaults(defineProps<EComboboxProps>(), { clearable: true });

defineEmits<{
  /** The text in the input changed, by typing or by choosing. Use it to fetch options from a server. */
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
    mode="single"
    @input-change="(text: string) => $emit('inputChange', text)"
  />
</template>
