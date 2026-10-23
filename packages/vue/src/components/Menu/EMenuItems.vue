<script setup lang="ts">
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
import type { EMenuAction, EMenuCheckbox, EMenuItem, EMenuRadioGroup, EMenuRadioOption } from "./EMenu.vue";

/** One level of a menu. A submenu renders another one inside itself. */
defineProps<{ items: readonly EMenuItem[] }>();

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

function pick(group: EMenuRadioGroup, option: EMenuRadioOption) {
  group.onChange?.(option.value);
  emit("change", option, option.value);
}

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
      class="e-menu-item"
      :model-value="!!item.checked"
      :disabled="item.disabled"
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
        class="e-menu-item"
        :value="option.value"
        :disabled="option.disabled"
        @select="pick(item, option)"
      >
        <span class="e-menu-mark">
          <DropdownMenuItemIndicator><EIcon name="check" /></DropdownMenuItemIndicator>
        </span>
        {{ option.label }}
      </DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
    <DropdownMenuSub v-else-if="'type' in item && item.type === 'submenu'">
      <DropdownMenuSubTrigger class="e-menu-item" :disabled="item.disabled">
        <EIcon v-if="item.icon" :name="item.icon" />
        {{ item.label }}
        <EIcon class="e-menu-chevron" name="chevron-right" />
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal :to="portal">
        <DropdownMenuSubContent class="e-popover e-menu e-root" :side-offset="4" :collision-padding="8">
          <EMenuItems :items="item.items" @choose="emit('choose', $event)" @change="(i, v) => emit('change', i, v)" />
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
    <DropdownMenuItem
      v-else-if="isAction(item) && item.href"
      as-child
      class="e-menu-item"
      :class="{ 'e-menu-item--danger': item.danger }"
      :disabled="item.disabled"
      @select="choose(item)"
    >
      <a :href="item.disabled ? undefined : item.href">
        <EIcon v-if="item.icon" :name="item.icon" />
        {{ item.label }}
      </a>
    </DropdownMenuItem>
    <DropdownMenuItem
      v-else-if="isAction(item)"
      class="e-menu-item"
      :class="{ 'e-menu-item--danger': item.danger }"
      :disabled="item.disabled"
      @select="choose(item)"
    >
      <EIcon v-if="item.icon" :name="item.icon" />
      {{ item.label }}
    </DropdownMenuItem>
  </template>
</template>
