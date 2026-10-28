<script setup lang="ts">
import { computed } from "vue";
import EButton from "../Button/EButton.vue";
import EDialog from "../Dialog/EDialog.vue";
import { useMessages } from "../../config.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The question, as the dialog's heading and accessible name, such as "Delete this game?". */
    title: string;
    /** A sentence under the title that says what will happen and whether it can be undone. */
    description?: string;
    /** The Confirm button's label: a verb that says what happens, such as "Delete game". @default "Confirm" */
    confirmLabel?: string;
    /** The Cancel button's label. @default "Cancel" */
    cancelLabel?: string;
    /** `danger` makes the confirming button the danger one, for something that removes or cannot be undone. */
    tone?: "neutral" | "danger";
    /** Which button takes focus when it opens. `cancel` is the safe answer; use `confirm` for a question whose usual answer is yes. */
    focus?: "cancel" | "confirm";
    /** Shows a spinner on the Confirm button and ignores it while the action runs. Pair it with `closeOnConfirm` off. */
    loading?: boolean;
    /** Closes the dialog when Confirm is pressed. Turn it off for an action that can fail or takes time: set `loading`, then close it yourself with `v-model:open`. */
    closeOnConfirm?: boolean;
    /** The width: `sm` for a confirmation, `md` for a longer explanation. */
    size?: "sm" | "md";
    /** The level of the title's heading element, 1 to 6. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Closes it (as Cancel) when the backdrop is pressed as well. */
    dismissible?: boolean;
  }>(),
  { tone: "neutral", focus: "cancel", closeOnConfirm: true, size: "sm", headingLevel: 2 },
);

const emit = defineEmits<{
  /** The person pressed Confirm. */
  confirm: [];
  /** The person said no: Cancel, Close, Escape or (when `dismissible`) the backdrop. `open` is already false. */
  cancel: [];
}>();

defineSlots<{
  /** More to read before deciding, such as what will be lost. Optional: `description` is often enough. */
  default?(): unknown;
}>();

/** Whether it is open. Without a binding it keeps its own state. */
const open = defineModel<boolean>("open");

const t = useMessages();
const danger = computed(() => props.tone === "danger");

function confirm() {
  if (props.loading) return;
  emit("confirm");
  if (props.closeOnConfirm) open.value = false;
}

function cancel() {
  open.value = false;
  emit("cancel");
}
</script>

<template>
  <EDialog
    v-model:open="open"
    role="alertdialog"
    footer="row"
    :title="title"
    :description="description"
    :size="size"
    :heading-level="headingLevel"
    :dismissible="dismissible"
    @close="emit('cancel')"
  >
    <slot />
    <template #actions>
      <EButton
        :variant="danger ? 'danger' : 'primary'"
        :loading="loading"
        :data-autofocus="focus === 'confirm' ? '' : undefined"
        @click="confirm"
      >
        {{ confirmLabel ?? t("confirm") }}
      </EButton>
      <EButton variant="outline" :data-autofocus="focus === 'cancel' ? '' : undefined" @click="cancel">
        {{ cancelLabel ?? t("cancel") }}
      </EButton>
    </template>
  </EDialog>
</template>
