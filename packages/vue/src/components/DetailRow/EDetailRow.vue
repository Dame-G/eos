<script setup lang="ts">
import { getCurrentInstance } from "vue";
import EButton from "../Button/EButton.vue";
import EChip from "../Chip/EChip.vue";
import type { ChipTone } from "../Chip/EChip.vue";
import { useMessages } from "../../config.js";
import "../../styles/base.css";

defineProps<{
  /** What the detail is, such as "Email". Names the Edit button for screen readers. */
  label: string;
  /** A word in a chip after the value, such as "Verified" or "Needs update". */
  status?: string;
  /** The chip's tone. */
  tone?: ChipTone;
}>();

const emit = defineEmits<{
  /** The Edit button was pressed. The button appears only when something listens. */
  edit: [];
}>();

defineSlots<{
  /** The value. */
  default(): unknown;
}>();

const t = useMessages();
const instance = getCurrentInstance();
/** The Edit button is shown only when the consumer listens for `edit`. Read at render, so a listener added later counts. */
const editable = () => Boolean(instance?.vnode.props?.onEdit);

/** The message when the app's catalogue has it, the English wording otherwise. */
function say(key: string, fallback: string, vars?: Record<string, string>) {
  const text = t(key, vars);
  return text === key ? fallback.replace(/\{(\w+)\}/g, (m, k: string) => vars?.[k] ?? m) : text;
}
</script>

<template>
  <div class="e-detail">
    <div class="e-detail-main">
      <p class="e-kicker e-detail-label">{{ label }}</p>
      <p class="e-detail-value"><slot /></p>
    </div>
    <EChip v-if="status" :tone="tone">{{ status }}</EChip>
    <span v-else class="e-detail-gap" aria-hidden="true" />
    <EButton
      v-if="editable()"
      variant="quiet"
      :aria-label="say('editItem', 'Edit {label}', { label })"
      @click="emit('edit')"
    >
      {{ say("edit", "Edit") }}
    </EButton>
  </div>
</template>

<style>
@layer e.account {
  .e-detail {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 8.75rem auto;
    align-items: center;
    gap: var(--e-space-1) var(--e-space-3);
    padding: var(--e-space-3) 0;
    border-top: var(--e-stroke-hair) solid var(--e-border);
  }

  .e-detail-main {
    display: grid;
    gap: var(--e-space-1);
    min-width: 0;
  }

  .e-detail-label {
    margin: 0;
  }

  .e-detail-value {
    margin: 0;
    font: 400 var(--e-text-md) / 1.4 var(--e-font-sans);
    overflow-wrap: anywhere;
  }

  .e-detail .e-chip {
    /* stylelint-disable-next-line declaration-block-no-redundant-longhand-properties -- two longhands, as in the reference */
    align-self: center;
    justify-self: end;
  }

  .e-detail-gap {
    display: block;
  }

  .e-detail:first-child {
    border-top: 0;
  }

  @media (max-width: 32rem) {
    .e-detail {
      grid-template-columns: auto minmax(0, 1fr);
    }

    .e-detail-main {
      grid-column: 1 / -1;
    }

    .e-detail .e-chip {
      justify-self: start;
    }

    .e-detail-gap {
      display: none;
    }

    .e-detail .e-btn {
      grid-column: 2;
      justify-self: end;
    }
  }
}
</style>
