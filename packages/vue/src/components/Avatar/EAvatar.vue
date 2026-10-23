<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useMessages } from "../../config.js";
import { useSize, type Size } from "../../composables/useSize.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The person's name. Screen readers read it, and the initials are the first letter (a whole character, so a Chinese, Japanese, Korean or emoji one is never cut in two) of its first and last word. */
    name: string;
    /** A photo URL. The initials show if it fails to load. */
    src?: string;
    /** `sm` (32px) for rows and bars, `md` (44px), `lg` (64px) for a profile or a practitioner on an appointment card. */
    size?: Size;
    /** Makes the avatar smaller. Same as `size="sm"`. */
    small?: boolean;
    /** Makes the avatar larger. Same as `size="lg"`. */
    large?: boolean;
    /** A presence dot at the corner. The name is read with it, as "Ada Lovelace, Online". */
    status?: "online" | "away" | "busy" | "offline";
    /** `button` renders a `button` with `type="button"`, named by `name`, for use as the `trigger` of an `EMenu`, for example. */
    as?: "span" | "button";
  }>(),
  { as: "span" },
);

const t = useMessages();
const size = useSize(props, "EAvatar");
const failed = ref(false);
watch(
  () => props.src,
  () => (failed.value = false),
);

/** The first grapheme cluster, so a surrogate pair, a combining mark or an emoji sequence stays whole. */
function first(word: string): string {
  const Segmenter = (Intl as { Segmenter?: typeof Intl.Segmenter }).Segmenter;
  if (Segmenter) {
    for (const part of new Segmenter(undefined, { granularity: "grapheme" }).segment(word)) return part.segment;
  }
  return [...word][0] ?? "";
}

const initials = computed(() => {
  const parts = String(props.name || "?")
    .split(/\s+/)
    .filter(Boolean);
  const head = first(parts[0] ?? "?");
  const tail = parts.length > 1 ? first(parts[parts.length - 1]!) : "";
  return (head + tail).toLocaleUpperCase();
});
const label = computed(() =>
  props.status ? t("avatarStatus", { name: props.name, status: t(`status.${props.status}`) }) : props.name,
);
</script>

<template>
  <component
    :is="as"
    class="e-avatar"
    :class="[size === 'sm' && 'e-avatar--s', size === 'lg' && 'e-avatar--l', as === 'button' && 'e-avatar--button']"
    :type="as === 'button' ? 'button' : undefined"
    :role="as === 'button' ? undefined : 'img'"
    :aria-label="as === 'button' ? undefined : label"
  >
    <img v-if="src && !failed" class="e-avatar-img" :src="src" alt="" @error="failed = true" />
    <span v-else-if="as === 'button'" aria-hidden="true">{{ initials }}</span>
    <template v-else>{{ initials }}</template>
    <span v-if="status" class="e-avatar-status" :class="`e-avatar-status--${status}`" aria-hidden="true"></span>
    <span v-if="as === 'button'" class="e-sr">{{ label }}</span>
  </component>
</template>

<style>
@layer e.primitives {
  .e-avatar {
    --_ring: var(--e-border-strong);

    position: relative;
    display: inline-grid;
    place-items: center;
    flex: none;
    box-sizing: border-box;
    width: var(--e-tap);
    height: var(--e-tap);
    border: var(--e-stroke-edge) solid var(--_ring);
    border-radius: var(--e-radius-md);
    background: var(--e-surface-tint);
    background-clip: padding-box;
    color: var(--e-primary);
    font: var(--e-weight-strong) var(--e-text-sm) / var(--e-leading-none) var(--e-font-mono);
    transition:
      border-color var(--e-duration-tap) var(--e-easing-out),
      background-color var(--e-duration-tap) var(--e-easing-out);
  }

  /* One you can press has the button's slab under it, which sinks away when pressed. */
  .e-avatar--button {
    --_lift: var(--e-slab);

    padding: 0;
    border-bottom-width: calc(var(--e-stroke-edge) + var(--_lift));
    cursor: pointer;
  }

  .e-avatar--button:active {
    --_lift: 0px;
  }

  .e-avatar--button:hover {
    --_ring: var(--e-ink);

    background-color: var(--e-surface-hover);
  }

  .e-avatar--button:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-stroke-focus);
  }

  .e-avatar--s {
    width: var(--e-avatar-size-sm);
    height: var(--e-avatar-size-sm);
    font-size: var(--e-text-xs);
    border-radius: var(--e-radius-sm);
  }

  .e-avatar--l {
    width: var(--e-avatar-size-lg);
    height: var(--e-avatar-size-lg);
    font-size: var(--e-text-lg);
  }

  .e-avatar-img {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    object-fit: cover;
  }

  .e-avatar-status {
    position: absolute;
    inset-block-end: 0;
    inset-inline-end: 0;
    inline-size: 28%;
    aspect-ratio: 1;
    border-radius: var(--e-radius-round);
    background: var(--_dot);
    box-shadow: 0 0 0 var(--e-stroke-card) var(--e-surface);
  }

  .e-avatar-status--online {
    --_dot: var(--e-success);
  }

  .e-avatar-status--away {
    --_dot: var(--e-warning);
  }

  .e-avatar-status--busy {
    --_dot: var(--e-danger);
  }

  /* Offline is a hollow dot, so the states differ by shape as well as colour. */
  .e-avatar-status--offline {
    border: var(--e-stroke-edge) solid var(--e-muted);
    background: var(--e-surface);
    background-clip: padding-box;
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

    .e-avatar-status {
      forced-color-adjust: none;
      background: CanvasText;
      box-shadow: 0 0 0 var(--e-stroke-card) Canvas;
    }

    .e-avatar-status--offline {
      border-color: CanvasText;
      background: Canvas;
    }
  }
}
</style>
