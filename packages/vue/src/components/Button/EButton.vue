<script setup lang="ts">
import EIcon from "../Icon/EIcon.vue";
import type { IconProp } from "../../icons/types.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** `primary` is the one main action on a screen; `secondary` confirms; `outline` is for the other actions beside it; `danger` cancels or removes; `quiet` is an underlined text action. */
    variant?: "primary" | "secondary" | "outline" | "danger" | "quiet";
    /** An icon before the label: a name such as `download`, or a component. */
    icon?: IconProp;
    /** Full width. */
    block?: boolean;
    /** Dashed and unfilled; not focusable, ignores clicks. With `href` the link gets `aria-disabled="true"` and `tabindex="-1"` and does not navigate. */
    disabled?: boolean;
    /** Set `submit` on the one that submits a form. */
    type?: "button" | "submit" | "reset";
    /** Renders a link that looks like the button, for a destination rather than an action (a call to action that goes to a page). Space does not follow it. */
    href?: string;
    /** With `href`: opens in a new tab. */
    external?: boolean;
  }>(),
  { variant: "primary", type: "button" },
);

defineSlots<{
  /** The label: a verb that says what happens, like "Pay $162.40". */
  default(): unknown;
}>();

function blockWhenDisabled(event: Event) {
  if (!props.disabled) return;
  event.preventDefault();
  event.stopImmediatePropagation();
}
</script>

<template>
  <a
    v-if="href"
    :href="href"
    class="e-btn"
    :class="[variant !== 'primary' && `e-btn--${variant}`, block && 'e-btn--block']"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noreferrer' : undefined"
    :aria-disabled="disabled ? 'true' : undefined"
    :tabindex="disabled ? -1 : undefined"
    @click.capture="blockWhenDisabled"
    @auxclick.capture="blockWhenDisabled"
  >
    <EIcon v-if="icon" :name="icon" />
    <slot />
  </a>
  <button
    v-else
    :type="type"
    class="e-btn"
    :class="[variant !== 'primary' && `e-btn--${variant}`, block && 'e-btn--block']"
    :disabled="disabled"
  >
    <EIcon v-if="icon" :name="icon" />
    <slot />
  </button>
</template>

<style>
@layer e.primitives {
  .e-btn {
    --e-fill: var(--e-primary);
    --e-on-fill: var(--e-on-primary);
    --e-slab: color-mix(in srgb, var(--e-fill), var(--e-shade-slab));
    --e-hover: color-mix(in srgb, var(--e-fill), var(--e-shade-hover));
    --e-press: color-mix(in srgb, var(--e-fill), var(--e-shade-press));

    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--e-space-2);
    height: var(--e-control-height);
    padding: var(--e-depth) var(--e-space-4) 0;
    border: var(--e-stroke-edge) solid var(--e-slab);

    --e-bc: var(--e-slab);

    outline: var(--e-stroke-edge) solid var(--e-bc);
    outline-offset: calc(-1 * var(--e-stroke-edge));
    border-bottom-width: calc(var(--e-stroke-edge) + var(--e-depth));
    border-radius: var(--e-radius-md);
    background: var(--e-fill);
    color: var(--e-on-fill);
    font: 500 var(--e-text-md) / 1 var(--e-font-sans);
    letter-spacing: 0.01em;
    white-space: nowrap;
    text-decoration: none;
    cursor: pointer;
    transition:
      box-shadow var(--e-duration-tap) var(--e-easing-out),
      background-color var(--e-duration-tap) var(--e-easing-out);
  }

  .e-btn:hover {
    background: var(--e-hover);
  }

  .e-btn:active {
    background: var(--e-press);
    border-bottom-width: var(--e-stroke-edge);
    box-shadow: inset 0 var(--e-depth) 0 0 color-mix(in srgb, transparent, var(--e-shade-press));
  }

  .e-btn--secondary {
    --e-fill: var(--e-secondary);
    --e-on-fill: var(--e-on-secondary);
  }

  .e-btn--danger {
    --e-fill: var(--e-danger);
    --e-on-fill: var(--e-on-danger);
  }

  .e-btn--outline {
    --e-fill: var(--e-surface);
    --e-on-fill: var(--e-ink);
    --e-slab: var(--e-border-strong);
  }

  .e-btn--outline:hover {
    background: color-mix(in srgb, var(--e-surface), var(--e-shade-hover));
    border-color: var(--e-ink);

    --e-bc: var(--e-ink);
  }

  .e-btn--outline:active {
    background: color-mix(in srgb, var(--e-surface), var(--e-shade-press));
    border-color: var(--e-ink);

    --e-bc: var(--e-ink);

    border-bottom-width: var(--e-stroke-edge);
    box-shadow: inset 0 var(--e-depth) 0 0 color-mix(in srgb, transparent, var(--e-shade-press));
  }

  .e-btn--quiet {
    border-color: transparent;

    --e-bc: transparent;

    border-bottom-width: var(--e-stroke-edge);
    background: transparent;
    color: var(--e-ink);
    box-shadow: none;
    padding-top: 0;
    padding-inline: var(--e-space-3);
    text-decoration: underline;
    text-underline-offset: 5px;
    text-decoration-thickness: var(--e-stroke-edge);
    text-decoration-color: var(--e-border-strong);
  }

  .e-btn--quiet:not([disabled], [aria-disabled="true"]):hover {
    border-color: var(--e-wash-ring);

    --e-bc: var(--e-wash-ring);

    background: var(--e-wash-hover);
    text-decoration-color: currentcolor;
  }

  .e-btn--quiet:not([disabled], [aria-disabled="true"]):active {
    border-color: var(--e-ink);

    --e-bc: var(--e-ink);

    background: var(--e-wash-press);
    box-shadow: none;
    padding-top: 0;
  }

  .e-btn .e-icon {
    margin-inline-start: calc(-0.5 * var(--e-space-1));
  }

  .e-btn--block {
    width: 100%;
  }

  /* A toggle: any button with aria-pressed="true" reads as selected. */
  .e-btn[aria-pressed="true"],
  .e-btn[aria-pressed="true"]:hover,
  .e-btn[aria-pressed="true"]:active {
    --e-slab: var(--e-primary);
    --e-bc: var(--e-primary);

    border-color: var(--e-primary);
    background: var(--e-surface-hover);
    color: var(--e-primary);
  }

  .e-btn[disabled],
  .e-btn[aria-disabled="true"] {
    cursor: not-allowed;
    background: transparent;
    color: var(--e-muted);
    border: var(--e-stroke-edge) dashed var(--e-border-strong);
    outline: 0;
    box-shadow: none;
    padding-top: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .e-btn {
      transition: none;
    }
  }

  @media print {
    .e-btn {
      display: none;
    }
  }

  @media (forced-colors: active) {
    .e-btn {
      border: var(--e-stroke-focus) solid ButtonText;
    }

    .e-btn[aria-pressed="true"] {
      forced-color-adjust: none;
      background: Highlight;
      color: HighlightText;
    }

    .e-btn[disabled],
    .e-btn[aria-disabled="true"] {
      border-color: GrayText;
      color: GrayText;
    }
  }
}
</style>
