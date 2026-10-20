<script setup lang="ts">
import { DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogRoot, DialogTitle } from "reka-ui";
import EActions from "../Actions/EActions.vue";
import EIconButton from "../IconButton/EIconButton.vue";
import { useMessages, usePortalTarget } from "../../config.js";
import "../../styles/base.css";
import "./dialog.css";

defineOptions({ inheritAttrs: false });

withDefaults(
  defineProps<{
    title: string;
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    inline?: boolean;
    dismissible?: boolean;
    contentClass?: unknown;
  }>(),
  { headingLevel: 2 },
);

const emit = defineEmits<{
  close: [];
}>();

defineSlots<{
  default?(): unknown;
  actions?(): unknown;
}>();

const open = defineModel<boolean>("open");

const t = useMessages();
const target = usePortalTarget();

function setOpen(value: boolean) {
  open.value = value;
  if (!value) emit("close");
}
</script>

<template>
  <DialogRoot :open="!!open" :modal="!inline" @update:open="setOpen">
    <DialogPortal :to="target" :disabled="inline">
      <div class="e-root">
        <DialogOverlay v-if="!inline" class="e-dialog-overlay" />
        <DialogContent
          v-bind="$attrs"
          :class="contentClass"
          :aria-describedby="undefined"
          @interact-outside="(e) => !dismissible && e.preventDefault()"
        >
          <header class="e-dialog-head">
            <DialogTitle :as="`h${headingLevel}`" class="e-dialog-title">{{ title }}</DialogTitle>
            <DialogClose as-child>
              <EIconButton icon="x" :label="t('close')" />
            </DialogClose>
          </header>
          <slot />
          <EActions v-if="$slots.actions" as="footer" bar class="e-dialog-foot"><slot name="actions" /></EActions>
        </DialogContent>
      </div>
    </DialogPortal>
  </DialogRoot>
</template>
