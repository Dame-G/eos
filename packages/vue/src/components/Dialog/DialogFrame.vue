<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from "reka-ui";
import { computed, useAttrs } from "vue";
import EActions from "../Actions/EActions.vue";
import EIconButton from "../IconButton/EIconButton.vue";
import { useMessages, usePortalTarget } from "../../config.js";
import "../../styles/base.css";
import "../Heading/scale.css";
import "./dialog.css";

defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    role?: "dialog" | "alertdialog";
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    inline?: boolean;
    dismissible?: boolean;
    contentClass?: unknown;
  }>(),
  { headingLevel: 2, role: "dialog" },
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

/** An inline preview is part of the page, so it leaves focus alone: it does not take it when it opens, and does not send it back to wherever it was when it closes. Sending it back could land on a tab or link and activate it. */
function keepFocus(event: Event) {
  if (props.inline) event.preventDefault();
}

const attrs = useAttrs();

/** Reka points aria-describedby at a description element that may not exist. With no description it is dropped, so the attribute never dangles. A description the consumer wired themselves is kept. */
const describedby = computed(() =>
  props.description || attrs["aria-describedby"] ? {} : { "aria-describedby": undefined },
);

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
          :role="role"
          v-bind="{ ...describedby, ...$attrs }"
          :class="contentClass"
          @interact-outside="(e) => !dismissible && e.preventDefault()"
          @open-auto-focus="keepFocus"
          @close-auto-focus="keepFocus"
        >
          <header class="e-dialog-head">
            <DialogTitle :as="`h${headingLevel}`" class="e-dialog-title e-h e-h2">{{ title }}</DialogTitle>
            <DialogClose as-child>
              <EIconButton icon="x" :label="t('close')" />
            </DialogClose>
          </header>
          <DialogDescription v-if="description" class="e-dialog-description">{{ description }}</DialogDescription>
          <slot />
          <EActions v-if="$slots.actions" as="footer" bar class="e-dialog-foot"><slot name="actions" /></EActions>
        </DialogContent>
      </div>
    </DialogPortal>
  </DialogRoot>
</template>
