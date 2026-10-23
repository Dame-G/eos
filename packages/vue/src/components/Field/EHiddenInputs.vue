<script setup lang="ts">
/** Internal: the hidden inputs that post a list of values under one name (ESelect, ECombobox). Not exported. */
defineProps<{
  /** Posts nothing without a name. */
  name?: string | undefined;
  values: readonly (string | number | null | undefined)[];
  /** A disabled control posts nothing. */
  disabled?: boolean | undefined;
  /** The consumer's `form` attribute, so the inputs join a form they are not inside. */
  form?: string | undefined;
}>();
</script>

<template>
  <template v-if="name">
    <input
      v-for="(v, k) in values"
      :key="k"
      type="hidden"
      :name="name"
      :value="v ?? ''"
      :disabled="disabled || undefined"
      :form="form"
    />
  </template>
</template>
