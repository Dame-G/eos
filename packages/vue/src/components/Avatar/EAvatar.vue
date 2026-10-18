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
  <span class="e-avatar" :class="{ 'e-avatar--s': small, 'e-avatar--l': large }" role="img" :aria-label="name">
    <img v-if="src && !failed" class="e-avatar-img" :src="src" alt="" @error="failed = true" />
    <template v-else>{{ initials }}</template>
  </span>
</template>

<style>
@layer e.primitives {
  .e-avatar {
    display: inline-grid;
    place-items: center;
    flex: none;
    width: 40px;
    height: 40px;
    overflow: hidden;
    border: var(--e-stroke-edge) solid var(--e-border-strong);
    border-radius: var(--e-radius-md);
    background: var(--e-surface-tint);
    color: var(--e-primary);
    font: 600 var(--e-text-sm) / 1 var(--e-font-mono);
    letter-spacing: 0.02em;
  }

  .e-avatar--s {
    width: 28px;
    height: 28px;
    font-size: var(--e-text-xs);
    border-radius: var(--e-radius-sm);
  }

  .e-avatar--l {
    width: 56px;
    height: 56px;
    font-size: var(--e-text-lg);
  }

  .e-avatar-img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}
</style>
