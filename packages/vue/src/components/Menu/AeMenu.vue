<script setup lang="ts">
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "reka-ui";
import AeButton from "../Button/AeButton.vue";
import AeDivider from "../Divider/AeDivider.vue";
import AeIcon from "../Icon/AeIcon.vue";
import type { IconName } from "../../icons/phosphor.js";
import { usePortalTarget } from "../../config.js";
import "../../styles/base.css";
import "../Select/panel.css";

/** An action in the menu. */
export interface AeMenuAction {
  /** What the row says: a verb. */
  label: string;
  /** An icon before the label. */
  icon?: IconName | (string & {});
  /** Called when the row is chosen, after the menu closes. */
  onClick?: () => void;
  /** Red text for a destructive action. Put it last, after a divider. */
  danger?: boolean;
  /** Not choosable. Stays visible, muted. */
  disabled?: boolean;
  divider?: undefined;
}
/** A rule between groups of actions. */
export interface AeMenuDivider {
  divider: true;
}
export type AeMenuItem = AeMenuAction | AeMenuDivider;

defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    /** The button's text. */
    label: string;
    /** The actions, in order. `{ divider: true }` draws a rule. */
    items: readonly AeMenuItem[];
    /** The look of the button. Default `outline`. */
    variant?: "primary" | "secondary" | "outline" | "danger" | "quiet";
    /** An icon before the label. */
    icon?: IconName | (string & {});
  }>(),
  { variant: "outline" },
);

const emit = defineEmits<{
  /** An action was chosen. Also calls that item's own `onClick`. */
  select: [item: AeMenuAction];
}>();

const portal = usePortalTarget();

function choose(item: AeMenuAction) {
  item.onClick?.();
  emit("select", item);
}

/** A menu opens with its first action focused, however it was opened. */
function focusFirst(event: Event) {
  event.preventDefault();
  const content = event.target as HTMLElement | null;
  requestAnimationFrame(() => {
    content?.querySelector<HTMLElement>("[role=menuitem]:not([data-disabled])")?.focus({ preventScroll: true });
  });
}
</script>

<template>
  <DropdownMenuRoot :modal="false">
    <DropdownMenuTrigger as-child>
      <AeButton :variant="variant" :icon="icon" v-bind="$attrs">
        {{ label }}
        <AeIcon name="chevron-down" />
      </AeButton>
    </DropdownMenuTrigger>
    <DropdownMenuPortal :to="portal">
      <DropdownMenuContent
        class="ae-popover ae-menu ae-root"
        align="start"
        :side-offset="8"
        :collision-padding="16"
        loop
        @open-auto-focus="focusFirst"
      >
        <template v-for="(item, i) in items" :key="i">
          <DropdownMenuSeparator v-if="item.divider" as-child>
            <AeDivider />
          </DropdownMenuSeparator>
          <DropdownMenuItem
            v-else
            class="ae-menu-item"
            :class="{ 'ae-menu-item--danger': item.danger }"
            :disabled="item.disabled"
            @select="choose(item)"
          >
            <AeIcon v-if="item.icon" :name="item.icon" />
            {{ item.label }}
          </DropdownMenuItem>
        </template>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>

<style>
@layer ae.containers {
  .ae-menu {
    width: max-content;
    min-width: 12rem;
    max-width: min(20rem, calc(100vw - 32px));
    padding: var(--ae-space-1);
  }

  .ae-menu-item {
    display: flex;
    align-items: center;
    gap: var(--ae-space-2);
    width: 100%;
    height: var(--ae-control-height);
    padding: 0 var(--ae-space-3);
    border: 0;
    border-radius: var(--ae-radius-sm);
    background: transparent;
    color: var(--ae-ink);
    font: 400 var(--ae-text-md) / 1 var(--ae-font-sans);
    text-align: start;
    cursor: pointer;
  }

  .ae-menu-item:hover,
  .ae-menu-item:focus-visible {
    background: var(--ae-surface-tint);
    outline: none;
    box-shadow: inset 0 0 0 1px var(--ae-border-strong);
  }

  .ae-menu-item--danger {
    color: var(--ae-danger);
  }

  .ae-menu-item[disabled] {
    color: var(--ae-muted);
    cursor: not-allowed;
  }

  .ae-menu .ae-divider {
    margin: var(--ae-space-1) 0;
  }

  /* Reka UI marks the focused row with data-highlighted and a disabled row with data-disabled, on a div, where the reference used a button. */
  .ae-menu-item[data-highlighted] {
    background: var(--ae-surface-tint);
    outline: none;
    box-shadow: inset 0 0 0 1px var(--ae-border-strong);
  }

  .ae-menu-item[data-disabled] {
    color: var(--ae-muted);
    cursor: not-allowed;
  }

  @media (forced-colors: active) {
    .ae-menu-item[data-highlighted] {
      forced-color-adjust: none;
      background: Highlight;
      color: HighlightText;
    }
  }
}
</style>
