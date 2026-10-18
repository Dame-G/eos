<script setup lang="ts">
import { ref } from "vue";
import AeComboboxBase from "./AeComboboxBase.vue";
import type { AeComboboxProps } from "./types.js";

const props = withDefaults(defineProps<AeComboboxProps>(), { clearable: true });

defineEmits<{
  /** The text in the input changed, by typing or by choosing. Use it to fetch options from a server. */
  inputChange: [text: string];
}>();

/** The value of the chosen option. An empty string is nothing chosen. */
const model = defineModel<string>({ default: "" });

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
    mode="single"
    @input-change="(text: string) => $emit('inputChange', text)"
  />
</template>
