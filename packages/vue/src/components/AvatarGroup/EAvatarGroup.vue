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
import EAvatar from "../Avatar/EAvatar.vue";
import { useConfig, useMessages } from "../../config.js";
import type { Size } from "../../composables/useSize.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The people, in order. Each is `{ name, src? }`. */
    items: AvatarGroupItem[];
    /** How many avatars show before the rest collapse into a "+N" tile. */
    max?: number;
    /** `sm` 32px, `md` 44px or `lg` 64px, for every avatar. */
    size?: Size;
    /** Names the group, instead of the list of names. */
    label?: string;
  }>(),
  { max: 4 },
);

const config = useConfig();
const t = useMessages();
const size = computed(() => props.size ?? "md");
const shown = computed(() => props.items.slice(0, Math.max(1, props.max)));
const rest = computed(() => props.items.length - shown.value.length);
/** "Ada, Grace and 3 more", in the order and with the joining word of the locale. */
const name = computed(
  () =>
    props.label ??
    new Intl.ListFormat(config.locale, { style: "long", type: "conjunction" }).format([
      ...shown.value.map((p) => p.name),
      ...(rest.value > 0 ? [t("nMore", { n: rest.value })] : []),
    ]),
);
</script>

<template>
  <!-- One image with one name: the avatars and the tile are the picture, so they are not announced one by one. -->
  <span class="e-avatar-group" role="img" :aria-label="name">
    <EAvatar v-for="(person, i) in shown" :key="i" :name="person.name" :src="person.src" :size="size" />
    <span v-if="rest > 0" class="e-avatar" :class="size !== 'md' && `e-avatar--${size === 'sm' ? 's' : 'l'}`">
      +{{ rest }}
    </span>
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
    box-shadow: 0 0 0 var(--e-stroke-ring) var(--e-surface);
  }
}
</style>
