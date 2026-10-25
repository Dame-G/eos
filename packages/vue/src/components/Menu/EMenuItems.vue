<script setup lang="ts">
import type { Component } from "vue";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuItemIndicator,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "reka-ui";
import EDivider from "../Divider/EDivider.vue";
import EIcon from "../Icon/EIcon.vue";
import { usePortalTarget } from "../../config.js";
import { EDGE_PADDING_TIGHT, SUBMENU_OFFSET } from "../../composables/useDir.js";
import { hasLinkTarget, linkTarget } from "../../composables/useLink.js";
import type { EMenuAction, EMenuCheckbox, EMenuItem, EMenuRadioGroup, EMenuRadioOption } from "./EMenu.vue";

/** One level of a menu. A submenu renders another one inside itself. */
const props = defineProps<{ items: readonly EMenuItem[]; linkComponent: string | Component }>();

const emit = defineEmits<{
  choose: [item: EMenuAction];
  change: [item: EMenuCheckbox | EMenuRadioOption, value: boolean | string];
}>();

const portal = usePortalTarget();

function choose(item: EMenuAction) {
  item.onClick?.();
  emit("choose", item);
}

function toggle(item: EMenuCheckbox, checked: boolean) {
  item.onChange?.(checked);
  emit("change", item, checked);
}

/** Choosing the option that is already chosen changes nothing, so it calls nothing. */
function pick(group: EMenuRadioGroup, option: EMenuRadioOption) {
  if (option.value === group.value) return;
  group.onChange?.(option.value);
  emit("change", option, option.value);
}

/** Reka closes the menu after a choice unless the `select` event is cancelled. */
function stayOpen(event: Event, keep: boolean | undefined) {
  if (keep) event.preventDefault();
}

/** A disabled link goes nowhere, so it is a plain `a` with no address: a router link would need its `to`. */
const linkAttrs = (item: EMenuAction) => (item.disabled ? {} : linkTarget(item, props.linkComponent));

const isDivider = (item: EMenuItem): item is { divider: true } => "divider" in item && item.divider === true;
const isAction = (item: EMenuItem): item is EMenuAction => !("type" in item && item.type) && !isDivider(item);
</script>

<template>
  <template v-for="(item, i) in items" :key="i">
    <DropdownMenuSeparator v-if="isDivider(item)" as-child>
      <EDivider />
    </DropdownMenuSeparator>
    <DropdownMenuLabel v-else-if="'type' in item && item.type === 'label'" class="e-menu-label">
      {{ item.label }}
    </DropdownMenuLabel>
    <DropdownMenuCheckboxItem
      v-else-if="'type' in item && item.type === 'checkbox'"
      class="e-menu-item e-interact e-interact--inset"
      :model-value="!!item.checked"
      :disabled="item.disabled"
      @select="stayOpen($event, item.keepOpen)"
      @update:model-value="(v) => toggle(item, !!v)"
    >
      <span class="e-menu-mark">
        <DropdownMenuItemIndicator><EIcon name="check" /></DropdownMenuItemIndicator>
      </span>
      {{ item.label }}
    </DropdownMenuCheckboxItem>
    <DropdownMenuRadioGroup v-else-if="'type' in item && item.type === 'radio-group'" :model-value="item.value">
      <DropdownMenuLabel v-if="item.label" class="e-menu-label">{{ item.label }}</DropdownMenuLabel>
      <DropdownMenuRadioItem
        v-for="option in item.options"
        :key="option.value"
        class="e-menu-item e-interact e-interact--inset"
        :value="option.value"
        :disabled="option.disabled"
        @select="
          stayOpen($event, item.keepOpen);
          pick(item, option);
        "
      >
        <span class="e-menu-mark">
          <DropdownMenuItemIndicator><EIcon name="check" /></DropdownMenuItemIndicator>
        </span>
        {{ option.label }}
      </DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
    <DropdownMenuSub v-else-if="'type' in item && item.type === 'submenu'">
      <DropdownMenuSubTrigger class="e-menu-item e-interact e-interact--inset" :disabled="item.disabled">
        <EIcon v-if="item.icon" :name="item.icon" />
        {{ item.label }}
        <EIcon class="e-menu-chevron" name="chevron-right" />
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal :to="portal">
        <DropdownMenuSubContent
          class="e-popover e-menu e-root"
          :side-offset="SUBMENU_OFFSET"
          :collision-padding="EDGE_PADDING_TIGHT"
        >
          <EMenuItems
            :items="item.items"
            :link-component="linkComponent"
            @choose="emit('choose', $event)"
            @change="(i, v) => emit('change', i, v)"
          />
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
    <DropdownMenuItem
      v-else-if="isAction(item) && hasLinkTarget(item)"
      as-child
      class="e-menu-item e-interact e-interact--inset"
      :class="{ 'e-menu-item--danger': item.danger }"
      :disabled="item.disabled"
      @select="choose(item)"
    >
      <component :is="item.disabled ? 'a' : linkComponent" v-bind="linkAttrs(item)">
        <EIcon v-if="item.icon" :name="item.icon" />
        {{ item.label }}
      </component>
    </DropdownMenuItem>
    <DropdownMenuItem
      v-else-if="isAction(item)"
      class="e-menu-item e-interact e-interact--inset"
      :class="{ 'e-menu-item--danger': item.danger }"
      :disabled="item.disabled"
      @select="choose(item)"
    >
      <EIcon v-if="item.icon" :name="item.icon" />
      {{ item.label }}
    </DropdownMenuItem>
  </template>
</template>
