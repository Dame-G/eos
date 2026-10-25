<script setup lang="ts">
import { ref } from "vue";
import { PopoverClose, PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from "reka-ui";
import EButton from "../Button/EButton.vue";
import ECheckbox from "../Checkbox/ECheckbox.vue";
import EIconButton from "../IconButton/EIconButton.vue";
import { useMessages, usePortalTarget } from "../../config.js";
import "../../styles/base.css";
import "../Select/panel.css";
import "../../styles/popover.css";

/** The Columns menu: a popover with a checkbox per column. */
defineProps<{
  /** Every column, in order, with whether it shows. */
  columns: { id: string; label: string; visible: boolean }[];
}>();

const emit = defineEmits<{
  toggle: [id: string, visible: boolean];
}>();

const t = useMessages();
const portal = usePortalTarget();
const open = ref(false);
</script>

<template>
  <PopoverRoot v-model:open="open">
    <PopoverTrigger as-child>
      <EButton variant="outline" :aria-label="t('chooseColumns')">{{ t("columns") }}</EButton>
    </PopoverTrigger>
    <PopoverPortal :to="portal">
      <PopoverContent class="e-popover e-root" side="bottom" align="start" :side-offset="8" :collision-padding="16">
        <header class="e-pop-head">
          <p class="e-pop-title">{{ t("showColumns") }}</p>
          <PopoverClose as-child>
            <EIconButton icon="x" :label="t('close')" />
          </PopoverClose>
        </header>
        <div class="e-pop-body">
          <ECheckbox
            v-for="column in columns"
            :key="column.id"
            :label="column.label"
            :model-value="column.visible"
            @update:model-value="emit('toggle', column.id, $event)"
          />
        </div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
