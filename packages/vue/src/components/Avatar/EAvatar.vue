<script setup lang="ts">
import { computed, ref, watch } from "vue";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The person's name. Screen readers read it; the initials are the first letters of its first and last word. */
    name: string;
    /** A photo URL. If it fails to load, the initials appear. */
    src?: string;
    /** 32px, for rows and bars. */
    small?: boolean;
    /** 64px, for a profile or practitioner on an appointment card. The default is 44px. */
    large?: boolean;
    /** `button` renders a `button` with `type="button"`, a pointer cursor and a focus ring, named by `name`, such as the `trigger` of an `EMenu`. */
    as?: "span" | "button";
  }>(),
  { as: "span" },
);

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
  <component
    :is="as"
    class="e-avatar"
    :class="{ 'e-avatar--s': small, 'e-avatar--l': large, 'e-avatar--button': as === 'button' }"
    :type="as === 'button' ? 'button' : undefined"
    :role="as === 'button' ? undefined : 'img'"
    :aria-label="as === 'button' ? undefined : name"
  >
    <img v-if="src && !failed" class="e-avatar-img" :src="src" alt="" @error="failed = true" />
    <span v-else-if="as === 'button'" aria-hidden="true">{{ initials }}</span>
    <template v-else>{{ initials }}</template>
    <span v-if="as === 'button'" class="e-sr">{{ name }}</span>
  </component>
</template>

<style>
@layer e.primitives {
  .e-avatar {
    --e-ring: var(--e-border-strong);

    position: relative;
    display: inline-grid;
    place-items: center;
    flex: none;
    box-sizing: border-box;
    width: var(--e-tap, 44px);
    height: var(--e-tap, 44px);
    overflow: hidden;
    border: var(--e-stroke-edge) solid var(--e-ring);
    border-radius: var(--e-radius-md);
    background: var(--e-surface-tint);
    background-clip: padding-box;
    color: var(--e-primary);
    font: 600 var(--e-text-sm) / 1 var(--e-font-mono);
    letter-spacing: 0.02em;
    transition: border-color var(--e-duration-tap) var(--e-easing-out);
  }

  .e-avatar--button {
    position: relative;
    padding: 0;
    cursor: pointer;
  }

  .e-avatar--button:hover {
    --e-ring: var(--e-ink);
  }

  .e-avatar--button:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-focus-gap);
  }

  @media (prefers-reduced-motion: reduce) {
    .e-avatar--button {
      transition: none;
    }
  }

  .e-avatar--s {
    width: 32px;
    height: 32px;
    font-size: var(--e-text-xs);
    border-radius: var(--e-radius-sm);
  }

  .e-avatar--l {
    width: 64px;
    height: 64px;
    font-size: var(--e-text-lg);
  }

  .e-avatar-img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (forced-colors: active) {
    .e-avatar {
      border-color: CanvasText;
      outline-color: CanvasText;
      color: CanvasText;
    }

    .e-avatar--button:focus-visible {
      outline-color: Highlight;
    }
  }
}
</style>
