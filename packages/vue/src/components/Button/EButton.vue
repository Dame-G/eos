<script setup lang="ts">
import { watch } from "vue";
import EIcon from "../Icon/EIcon.vue";
import SpinnerRing from "../Spinner/SpinnerRing.vue";
import { useMessages } from "../../config.js";
import { useAnnouncer } from "../../composables/useAnnouncer.js";
import type { IconProp } from "../../icons/types.js";
import "../../styles/base.css";
import "./button.css";

const props = withDefaults(
  defineProps<{
    /** `primary` is the one main action on a screen. `secondary` confirms. `outline` is for the other actions beside it. `danger` cancels or removes. `quiet` is an underlined text action. */
    variant?: "primary" | "secondary" | "outline" | "danger" | "quiet";
    /** Shows an icon before the label, as a name such as `download` or as a component. */
    icon?: IconProp;
    /** Shows an icon after the label, such as `chevron-right` on a button that goes forward or opens a list. */
    iconEnd?: IconProp;
    /** `sm` is a compact button for a dense toolbar or a row. `lg` is for a hero call to action. Every size keeps a 44px target. @default "md" */
    size?: "sm" | "md" | "lg";
    /** Makes the button fill the width of its container. */
    block?: boolean;
    /** Stops the button taking focus and ignores clicks. With `href` the link gets `aria-disabled="true"` and `tabindex="-1"` and does not navigate. */
    disabled?: boolean;
    /** `submit` submits a form. Use it on the one button that submits. */
    type?: "button" | "submit" | "reset";
    /** Renders a link that looks like the button, for a destination rather than an action (a call to action that goes to a page). A link does not activate on Space, like a native link. */
    href?: string;
    /** Opens the link in a new tab and tells screen readers so. Needs `href`. */
    external?: boolean;
    /** Shows a spinner in place of the icon and ignores clicks while an action runs. The button stays focusable, is marked busy and "Loading" is announced. */
    loading?: boolean;
  }>(),
  { variant: "primary", size: "md", type: "button" },
);

defineSlots<{
  /** The label: a verb that says what happens, like "Pay $162.40". */
  default(): unknown;
}>();

const t = useMessages();
const { announce } = useAnnouncer();
watch(
  () => props.loading,
  (on) => on && announce(t("loading")),
);

function blockWhenDisabled(event: Event) {
  if (!props.disabled && !props.loading) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}
</script>

<template>
  <a
    v-if="href"
    :href="href"
    class="e-btn"
    :class="[
      variant !== 'primary' && `e-btn--${variant}`,
      size !== 'md' && `e-btn--${size}`,
      block && 'e-btn--block',
      loading && 'e-btn--loading',
    ]"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noreferrer' : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
    :aria-busy="loading ? 'true' : undefined"
    :tabindex="disabled ? -1 : undefined"
    @click.capture="blockWhenDisabled"
    @auxclick.capture="blockWhenDisabled"
  >
    <SpinnerRing v-if="loading" class="e-btn-spinner" />
    <EIcon v-else-if="icon" :name="icon" />
    <slot />
    <EIcon v-if="iconEnd" :name="iconEnd" />
    <span v-if="external" class="e-sr"> {{ t("opensNewTab") }}</span>
  </a>
  <button
    v-else
    :type="type"
    class="e-btn"
    :class="[
      variant !== 'primary' && `e-btn--${variant}`,
      size !== 'md' && `e-btn--${size}`,
      block && 'e-btn--block',
      loading && 'e-btn--loading',
    ]"
    :disabled="disabled"
    :aria-busy="loading ? 'true' : undefined"
    @click.capture="blockWhenDisabled"
  >
    <SpinnerRing v-if="loading" class="e-btn-spinner" />
    <EIcon v-else-if="icon" :name="icon" />
    <slot />
    <EIcon v-if="iconEnd" :name="iconEnd" />
  </button>
</template>
