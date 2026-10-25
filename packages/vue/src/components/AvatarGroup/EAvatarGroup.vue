<script lang="ts">
export interface AvatarGroupItem {
  /** The person's name. */
  name: string;
  /** A photo URL. The initials show without it. */
  src?: string;
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import EAvatar, { avatarSizeClass } from "../Avatar/EAvatar.vue";
import { useMessages } from "../../config.js";
import { useLocale } from "../../composables/useLocale.js";
import type { Size } from "../../types.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The people, in order. Each is `{ name, src? }`. */
    items: AvatarGroupItem[];
    /** How many avatars show before the rest collapse into a "+N" tile. With one person over, all of them show, since a "+1" tile would take the same room. */
    max?: number;
    /** `sm` 32px, `md` 44px or `lg` 64px, for every avatar. */
    size?: Extract<Size, "sm" | "md" | "lg">;
    /** Names the group, instead of the list of names. */
    label?: string;
  }>(),
  { max: 4, size: "md" },
);

const t = useMessages();
const loc = useLocale();
/** A "+1" tile would take the place the one person left over fits in, so the tile only stands for two or more. */
const shown = computed(() => {
  const max = Math.max(1, props.max);
  return props.items.length <= max + 1 ? props.items : props.items.slice(0, max);
});
const rest = computed(() => props.items.length - shown.value.length);
/** A key per person that survives the list changing: the photo or the name, made unique. */
const keys = computed(() => {
  const seen = new Map<string, number>();
  return shown.value.map((p) => {
    const base = p.src ?? p.name;
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    return n ? `${base}#${n}` : base;
  });
});
/** "Ada, Grace and 3 more", in the order and with the joining word of the locale. */
const name = computed(
  () =>
    props.label ??
    loc.formatList([...shown.value.map((p) => p.name), ...(rest.value > 0 ? [t("nMore", { n: rest.value })] : [])]),
);
</script>

<template>
  <!-- One image with one name: the avatars and the tile are the picture, so they are not announced one by one. -->
  <span class="e-avatar-group" role="img" :aria-label="name">
    <EAvatar v-for="(person, i) in shown" :key="keys[i]" :name="person.name" :src="person.src" :size="size" />
    <span v-if="rest > 0" class="e-avatar" :class="avatarSizeClass(size)">+{{ rest }}</span>
  </span>
</template>

<style>
@layer e.primitives {
  .e-avatar-group {
    display: inline-flex;
    align-items: center;
  }

  /* The overlap: each avatar covers the edge of the one before it, and a ring of the page colour keeps them apart. */
  .e-avatar-group > * + * {
    margin-inline-start: calc(-1 * var(--e-gap-snug));
  }

  .e-avatar-group > .e-avatar {
    box-shadow: 0 0 0 var(--e-stroke-edge) var(--e-surface);
  }
}
</style>
