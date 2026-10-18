<script setup lang="ts">
import { computed, ref, watch } from "vue";
import "../../styles/base.css";

const props = defineProps<{
  /** The person's name. Screen readers read it; the initials come from it. */
  name: string;
  /** A photo URL. If it fails to load, the initials appear. */
  src?: string;
  /** 28px, for rows. */
  small?: boolean;
  /** 56px, for a practitioner on an appointment card or a profile. */
  large?: boolean;
}>();

const failed = ref(false);
watch(
  () => props.src,
  () => (failed.value = false),
);

const initials = computed(() => {
  const parts = String(props.name || "?")
    .split(/\s+/)
    .filter(Boolean);
  const first = [...(parts[0] ?? "?")][0] ?? "?";
  const last = parts.length > 1 ? ([...parts[parts.length - 1]!][0] ?? "") : "";
  return (first + last).toUpperCase();
});
</script>

<template>
  <span class="ae-avatar" :class="{ 'ae-avatar--s': small, 'ae-avatar--l': large }" role="img" :aria-label="name">
    <img v-if="src && !failed" class="ae-avatar-img" :src="src" alt="" @error="failed = true" />
    <template v-else>{{ initials }}</template>
  </span>
</template>

<style>
@layer ae.primitives {
  .ae-avatar {
    display: inline-grid;
    place-items: center;
    flex: none;
    width: 40px;
    height: 40px;
    overflow: hidden;
    border: var(--ae-stroke-edge) solid var(--ae-border-strong);
    border-radius: var(--ae-radius-md);
    background: var(--ae-surface-tint);
    color: var(--ae-primary);
    font: 600 var(--ae-text-sm) / 1 var(--ae-font-mono);
    letter-spacing: 0.02em;
  }

  .ae-avatar--s {
    width: 28px;
    height: 28px;
    font-size: var(--ae-text-xs);
    border-radius: var(--ae-radius-sm);
  }

  .ae-avatar--l {
    width: 56px;
    height: 56px;
    font-size: var(--ae-text-lg);
  }

  .ae-avatar-img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
