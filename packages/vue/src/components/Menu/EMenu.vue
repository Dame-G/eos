<script setup lang="ts">
import { computed } from "vue";
import {
  ConfigProvider,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "reka-ui";
import EButton from "../Button/EButton.vue";
import EIcon from "../Icon/EIcon.vue";
import EMenuItems from "./EMenuItems.vue";
import type { IconProp } from "../../icons/types.js";
import { usePortalTarget } from "../../config.js";
import { useDir } from "../../composables/useDir.js";
import { useQuietFocus } from "../../composables/useQuietFocus.js";
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
  /** Makes the row a link to this address. Choosing it follows the link and still fires `select`. */
  href?: string;
  /** Marks a destructive action. It goes last, after a divider. */
  danger?: boolean;
  /** Makes the action unchoosable. It stays visible. */
  disabled?: boolean;
  type?: undefined;
  divider?: undefined;
}
/** A rule between groups of actions. */
export interface EMenuDivider {
  divider: true;
}
/** A caption over the rows that follow it. */
export interface EMenuLabel {
  type: "label";
  label: string;
}
/** A row that is on or off. The menu does not keep the state: pass `checked` and update it in `onChange`. */
export interface EMenuCheckbox {
  type: "checkbox";
  label: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}
/** One choice of a radio group. */
export interface EMenuRadioOption {
  label: string;
  value: string;
  disabled?: boolean;
}
/** Rows of which exactly one is chosen. The menu does not keep the state: pass `value` and update it in `onChange`. */
export interface EMenuRadioGroup {
  type: "radio-group";
  /** A caption over the group. */
  label?: string;
  value: string;
  options: readonly EMenuRadioOption[];
  onChange?: (value: string) => void;
}
/** A row that opens a menu beside it. */
export interface EMenuSubmenu {
  type: "submenu";
  label: string;
  icon?: IconProp;
  items: readonly EMenuItem[];
  disabled?: boolean;
}
export type EMenuItem = EMenuAction | EMenuDivider | EMenuLabel | EMenuCheckbox | EMenuRadioGroup | EMenuSubmenu;

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /** The button's text. With a `trigger` slot it is not shown, so name your own trigger. */
    label: string;
    /** The rows, in order. A plain action is `{ label, icon?, onClick?, danger?, disabled? }`, a link adds `href`. `{ divider: true }` draws a rule, and `type` makes a `label`, `checkbox`, `radio-group` or `submenu`. The destructive action goes last. */
    items: readonly EMenuItem[];
    /** The button's variant. */
    variant?: "primary" | "secondary" | "outline" | "danger" | "quiet";
    /** An icon before the label. */
    icon?: IconProp;
    /** Which side of the trigger the menu opens on. It flips to the other side when there is no room. `start` and `end` follow the reading direction. */
    side?: "bottom" | "top" | "start" | "end" | "left" | "right";
    /** Which edge of the trigger the menu's edge lines up with: `start` with the trigger's start, `end` with its end (it suits a trigger at the end of a bar), `center` with its middle. */
    align?: "start" | "center" | "end";
    /** The space in pixels to keep between the menu and the edge of the screen. */
    collisionPadding?: number;
  }>(),
  { variant: "outline", side: "bottom", align: "start", collisionPadding: 16 },
);

const emit = defineEmits<{
  /** An action or link was chosen, after that item's own `onClick` ran. One handler for every row. */
  select: [item: EMenuAction];
  /** A checkbox or radio option was changed, after its own `onChange` ran. */
  change: [item: EMenuCheckbox | EMenuRadioOption, value: boolean | string];
  /** It closed, by a choice, Escape or a press outside. `open` is already false. */
  close: [];
}>();

defineSlots<{
  /** Your own trigger, one element that takes a click, such as a `button` around an avatar. It replaces the button and needs an accessible name. */
  trigger?(): unknown;
}>();

/** The open state. Opening it from outside moves no focus. */
const open = defineModel<boolean>("open", { default: false });

const portal = usePortalTarget();
const dir = useDir();

const placement = computed(() => {
  const rtl = dir.value === "rtl";
  if (props.side === "start") return rtl ? "right" : "left";
  if (props.side === "end") return rtl ? "left" : "right";
  return props.side;
});

/*
 * Focus, in three parts:
 * - Opening by a click or an opening key (`intent`) moves focus to the first enabled row. Opening from outside
 *   (`v-model:open`) moves none, so a menu opened by code does not steal focus.
 * - Reka would focus the content on open; `focusFirst` cancels that and, for a person, focuses the first row instead.
 * - On close, focus returns to the trigger only if it was inside the menu. A menu closed by an outside press keeps focus
 *   where the person put it.
 */
const { intent, personOpened, returnsFocus } = useQuietFocus(open, (el) => !!el.closest("[role=menu]"));

/** Tab only passes through the trigger, so only the keys that open a menu count as asking for one. */
function openKey(e: KeyboardEvent) {
  if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(e.key)) intent();
}

function setOpen(value: boolean) {
  open.value = value;
  if (!value) emit("close");
}

function focusFirst(event: Event) {
  event.preventDefault();
  const content = event.target as HTMLElement | null;
  if (!personOpened()) return;
  requestAnimationFrame(() => {
    content?.querySelector<HTMLElement>("[role^=menuitem]:not([data-disabled])")?.focus({ preventScroll: true });
  });
}

function returnFocus(event: Event) {
  if (!returnsFocus()) event.preventDefault();
}
</script>

<template>
  <ConfigProvider :dir="dir">
    <DropdownMenuRoot :open="open" :modal="false" :dir="dir" @update:open="setOpen">
      <DropdownMenuTrigger as-child v-bind="$attrs" @click="intent" @keydown="openKey">
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
          :side="placement"
          :align="align"
          :side-offset="8"
          :collision-padding="collisionPadding"
          loop
          @open-auto-focus="focusFirst"
          @close-auto-focus="returnFocus"
        >
          <EMenuItems :items="items" @choose="emit('select', $event)" @change="(i, v) => emit('change', i, v)" />
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  </ConfigProvider>
</template>

<style>
@layer e.containers {
  .e-menu {
    width: max-content;
    min-width: 12rem;
    max-width: min(20rem, calc(100vw - 2 * var(--e-space-4)));
    padding: var(--e-gap-tight);
  }

  .e-menu-item {
    display: flex;
    align-items: center;
    gap: var(--e-gap-snug);
    width: 100%;
    height: var(--e-control-height);
    padding-block: 0;
    padding-inline: var(--e-pad-control-sm);
    border: 0;
    border-radius: var(--e-radius-sm);
    background: transparent;
    color: var(--e-ink);
    font: var(--e-weight-regular) var(--e-text-md) / 1 var(--e-font-sans);
    text-align: start;
    text-decoration: none;
    cursor: pointer;
    transition: var(--e-transition-state);
  }

  /* The shared recipe: hover and the keyboard highlight wash and ring, press sinks, focus is the outline drawn inside the row. */
  .e-menu-item:hover,
  .e-menu-item[data-highlighted] {
    background: var(--e-wash-hover);
    box-shadow: var(--e-ring-hover);
  }

  .e-menu-item:active {
    background: var(--e-wash-press);
    box-shadow: var(--e-ring-press);
  }

  .e-menu-item:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: calc(-1 * var(--e-stroke-focus));
  }

  .e-menu-item--danger {
    color: var(--e-danger);
  }

  .e-menu .e-divider {
    margin-block: var(--e-gap-tight);
  }

  .e-menu-label {
    padding: var(--e-gap-snug) var(--e-pad-control-sm) var(--e-gap-tight);
    color: var(--e-muted);
    font: var(--e-type-kicker);
    letter-spacing: var(--e-tracking-label);
    text-transform: uppercase;
  }

  /* The room for a check mark, empty when the row is off so the labels line up. */
  .e-menu-mark {
    display: inline-flex;
    flex: none;
    width: var(--e-icon-size);
    height: var(--e-icon-size);
  }

  .e-menu-chevron {
    margin-inline-start: auto;
  }

  .e-menu-chevron:dir(rtl) {
    transform: scaleX(-1);
  }

  .e-menu-item[disabled],
  .e-menu-item[data-disabled] {
    color: var(--e-disabled-ink);
    cursor: not-allowed;
  }

  .e-menu-item[disabled]:hover,
  .e-menu-item[data-disabled]:hover,
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
