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
  /** What the row says: a verb. */
  label: string;
  /** An icon before the label. */
  icon?: IconProp;
  /** Called when the row is chosen, after the menu closes. */
  onClick?: () => void;
  /** Red text for a destructive action. Put it last, after a divider. */
  danger?: boolean;
  /** Not choosable. Stays visible, muted. */
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
    /** The button's text. With a `trigger` slot it is not shown; name your own trigger. */
    label: string;
    /** The actions, in order. Action: `{ label, icon?, onClick?, danger?, disabled? }`; `{ divider: true }` draws a rule. Put destructive last. */
    items: readonly EMenuItem[];
    /** The look of the button. */
    variant?: "primary" | "secondary" | "outline" | "danger" | "quiet";
    /** An icon before the label. */
    icon?: IconProp;
    /** Which edge of the trigger the menu lines up with. Use `end` for a trigger at the end of a bar. */
    align?: "start" | "end";
  }>(),
  { variant: "outline", align: "start" },
);

const emit = defineEmits<{
  /** An action was chosen. Also calls that item's own `onClick`. */
  select: [item: EMenuAction];
}>();

defineSlots<{
  /** Your own trigger, one element that takes a click, such as a `button` around an avatar. It replaces the button; give it an accessible name. */
  trigger?(): unknown;
}>();

/** The open state. Opening it from outside moves no focus. */
const open = defineModel<boolean>("open", { default: false });

const portal = usePortalTarget();

function choose(item: EMenuAction) {
  item.onClick?.();
  emit("select", item);
}

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
    <DropdownMenuTrigger as-child @click="intent" @keydown="intent">
      <slot name="trigger">
        <EButton :variant="variant" :icon="icon" v-bind="$attrs">
          {{ label }}
          <EIcon name="chevron-down" />
        </EButton>
      </slot>
    </DropdownMenuTrigger>
    <DropdownMenuPortal :to="portal">
      <DropdownMenuContent
        class="e-popover e-menu e-root"
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
    padding: 0 var(--e-space-3);
    border: 0;
    border-radius: var(--e-radius-sm);
    background: transparent;
    color: var(--e-ink);
    font: 400 var(--e-text-md) / 1 var(--e-font-sans);
    text-align: start;
    cursor: pointer;
  }

  .e-menu-item:hover,
  .e-menu-item:focus-visible,
  .e-menu-item[data-highlighted] {
    background: var(--e-surface-hover);
    box-shadow: inset 0 0 0 var(--e-stroke-card) var(--e-border-strong);
    outline: var(--e-stroke-card) solid var(--e-border-strong);
    outline-offset: calc(-1 * var(--e-stroke-card));
  }

  .e-menu-item--danger {
    color: var(--e-danger);
  }

  .e-menu-item[disabled] {
    color: var(--e-muted);
    cursor: not-allowed;
  }

  .e-menu .e-divider {
    margin: var(--e-space-1) 0;
  }

  .e-menu-item[data-disabled] {
    color: var(--e-muted);
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
