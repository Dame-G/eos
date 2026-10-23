<script setup lang="ts">
import { watch } from "vue";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "reka-ui";
import EButton from "../Button/EButton.vue";
import EDivider from "../Divider/EDivider.vue";
import EIcon from "../Icon/EIcon.vue";
import type { IconProp } from "../../icons/types.js";
import { usePortalTarget } from "../../config.js";
import "../../styles/base.css";
import "../Select/panel.css";

/** An action in the menu. */
export interface EMenuAction {
  /** The row's text, a verb. */
  label: string;
  /** An icon before the label. */
  icon?: IconProp;
  /** Called when the row is chosen, before the `select` event. */
  onClick?: () => void;
  /** Marks a destructive action. It goes last, after a divider. */
  danger?: boolean;
  /** Makes the action unchoosable. It stays visible. */
  disabled?: boolean;
  divider?: undefined;
}
/** A rule between groups of actions. */
export interface EMenuDivider {
  divider: true;
}
export type EMenuItem = EMenuAction | EMenuDivider;

defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    /** The button's text. With a `trigger` slot it is not shown, so name your own trigger. */
    label: string;
    /** The actions, in order, as `{ label, icon?, onClick?, danger?, disabled? }`. `{ divider: true }` draws a rule. The destructive action goes last. */
    items: readonly EMenuItem[];
    /** The button's variant. */
    variant?: "primary" | "secondary" | "outline" | "danger" | "quiet";
    /** An icon before the label. */
    icon?: IconProp;
    /** Which side of the trigger the menu opens on. It flips to the other side when there is no room. */
    side?: "bottom" | "top";
    /** Which edge of the trigger the menu's edge lines up with: `start` with the trigger's start, `end` with its end (it suits a trigger at the end of a bar), `center` with its middle. */
    align?: "start" | "center" | "end";
  }>(),
  { variant: "outline", side: "bottom", align: "start" },
);

const emit = defineEmits<{
  /** An action was chosen, after that item's own `onClick` ran. One handler for every row. */
  select: [item: EMenuAction];
}>();

defineSlots<{
  /** Your own trigger, one element that takes a click, such as a `button` around an avatar. It replaces the button and needs an accessible name. */
  trigger?(): unknown;
}>();

/** The open state. Opening it from outside moves no focus. */
const open = defineModel<boolean>("open", { default: false });

const portal = usePortalTarget();

function choose(item: EMenuAction) {
  item.onClick?.();
  emit("select", item);
}

/*
 * Focus, in three parts:
 * - Opening by a click or key (`intent`) moves focus to the first enabled row. Opening from outside (`v-model:open`) moves
 *   none, so a menu opened by code does not steal focus.
 * - Reka would focus the content on open; `focusFirst` cancels that and, for a person, focuses the first row instead.
 * - On close, focus returns to the trigger only if it was inside the menu (`hadFocus`, read just before the open state
 *   flips). A menu closed by an outside press keeps focus where the person put it.
 */
let byPerson = false;
let hadFocus = false;
const intent = () => (byPerson = true);

watch(
  open,
  (isOpen) => {
    if (!isOpen) hadFocus = !!document.activeElement?.closest("[role=menu]");
  },
  { flush: "sync" },
);

function focusFirst(event: Event) {
  event.preventDefault();
  const content = event.target as HTMLElement | null;
  if (!byPerson) return;
  byPerson = false;
  requestAnimationFrame(() => {
    content?.querySelector<HTMLElement>("[role=menuitem]:not([data-disabled])")?.focus({ preventScroll: true });
  });
}

function returnFocus(event: Event) {
  byPerson = false;
  if (!hadFocus) event.preventDefault();
}
</script>

<template>
  <DropdownMenuRoot v-model:open="open" :modal="false">
    <DropdownMenuTrigger as-child v-bind="$attrs" @click="intent" @keydown="intent">
      <slot name="trigger">
        <EButton :variant="variant" :icon="icon">
          {{ label }}
          <EIcon name="chevron-down" />
        </EButton>
      </slot>
    </DropdownMenuTrigger>
    <DropdownMenuPortal :to="portal">
      <DropdownMenuContent
        class="e-popover e-menu e-root"
        :side="side"
        :align="align"
        :side-offset="8"
        :collision-padding="16"
        loop
        @open-auto-focus="focusFirst"
        @close-auto-focus="returnFocus"
      >
        <template v-for="(item, i) in items" :key="i">
          <DropdownMenuSeparator v-if="item.divider" as-child>
            <EDivider />
          </DropdownMenuSeparator>
          <DropdownMenuItem
            v-else
            class="e-menu-item"
            :class="{ 'e-menu-item--danger': item.danger }"
            :disabled="item.disabled"
            @select="choose(item)"
          >
            <EIcon v-if="item.icon" :name="item.icon" />
            {{ item.label }}
          </DropdownMenuItem>
        </template>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>

<style>
@layer e.containers {
  .e-menu {
    width: max-content;
    min-width: 12rem;
    max-width: min(20rem, calc(100vw - 2 * var(--e-space-4)));
    padding: var(--e-space-1);
  }

  .e-menu-item {
    display: flex;
    align-items: center;
    gap: var(--e-space-2);
    width: 100%;
    height: var(--e-control-height);
    padding-block: 0;
    padding-inline: var(--e-space-3);
    border: 0;
    border-radius: var(--e-radius-sm);
    background: transparent;
    color: var(--e-ink);
    font: var(--e-weight-regular) var(--e-text-md) / 1 var(--e-font-sans);
    text-align: start;
    cursor: pointer;
  }

  /* The shared recipe: hover and the keyboard highlight wash, press sinks. */
  .e-menu-item:hover,
  .e-menu-item:focus-visible,
  .e-menu-item[data-highlighted] {
    background: var(--e-wash-hover);
    box-shadow: inset 0 0 0 var(--e-stroke-card) var(--e-wash-ring);
  }

  .e-menu-item:active {
    background: var(--e-wash-press);
    box-shadow: inset 0 0 0 var(--e-stroke-edge) var(--e-ink);
  }

  .e-menu-item--danger {
    color: var(--e-danger);
  }

  .e-menu .e-divider {
    margin-block: var(--e-space-1);
  }

  .e-menu-item[disabled],
  .e-menu-item[data-disabled] {
    color: var(--e-disabled-ink);
    cursor: not-allowed;
  }

  .e-menu-item[disabled]:hover,
  .e-menu-item[data-disabled][data-highlighted] {
    background: transparent;
    box-shadow: none;
    outline: 0;
  }

  @media (forced-colors: active) {
    .e-menu-item[disabled],
    .e-menu-item[data-disabled] {
      color: GrayText;
    }

    .e-menu-item:hover,
    .e-menu-item:focus-visible,
    .e-menu-item[data-highlighted] {
      forced-color-adjust: none;
      background: Highlight;
      color: HighlightText;
    }
  }
}
</style>
