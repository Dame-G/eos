<script lang="ts">
export interface ErrorSummaryItem {
  /** The field's name, shown first in medium weight ("Email: Enter an email address"). Leave it out when the message already names the field. */
  field?: string;
  /** What is wrong and how to fix it, written the same way as the field's own error. */
  message: string;
}
</script>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";
import AeNotice from "../Notice/AeNotice.vue";
import { useMessages } from "../../config.js";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** What went wrong. The summary shows nothing while the list is empty. */
    errors: ErrorSummaryItem[];
    /** The heading. Defaults to "There is a problem". */
    title?: string;
    /** The level of the heading element, 1 to 6. */
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Moves focus to the summary when errors appear, so keyboard and screen reader users land on it. */
    autoFocus?: boolean;
  }>(),
  { headingLevel: 2, autoFocus: true },
);

const t = useMessages();
const titleId = useUid();
const root = ref<HTMLElement>();

function focusSummary() {
  if (!props.errors.length || !props.autoFocus || !root.value) return;
  root.value.focus();
  root.value.scrollIntoView?.({ block: "nearest" });
}

// A tick later, so the summary is in the document and laid out before it is focused.
onMounted(() => nextTick(focusSummary));
watch(
  () => props.errors.length,
  async () => {
    await nextTick();
    focusSummary();
  },
);
</script>

<template>
  <div v-if="errors.length" ref="root" class="ae-errsum" role="alert" tabindex="-1" :aria-labelledby="titleId">
    <AeNotice
      tone="danger"
      :role="false"
      :heading-level="headingLevel"
      :title-id="titleId"
      :title="title ?? t('errorSummary')"
    >
      <ul class="ae-errsum-list">
        <li v-for="(error, i) in errors" :key="`${i}-${error.message}`">
          <strong v-if="error.field">{{ error.field }}</strong
          >{{ error.field ? ": " : "" }}{{ error.message }}
        </li>
      </ul>
    </AeNotice>
  </div>
</template>

<style>
@layer ae.containers {
  .ae-errsum {
    border-radius: var(--ae-radius-md);
  }

  .ae-errsum:focus-visible {
    outline: var(--ae-stroke-focus) solid var(--ae-focus-ring);
    outline-offset: var(--ae-focus-gap);
  }

  .ae-errsum-list {
    display: grid;
    gap: var(--ae-space-1);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .ae-errsum-list li {
    position: relative;
    padding-inline-start: var(--ae-space-4);
  }

  .ae-errsum-list li::before {
    content: "";
    position: absolute;
    inset-inline-start: 0;
    top: 0.5em;
    width: 7px;
    height: 7px;
    border-radius: calc(var(--ae-radius-sm) / 2);
    background: var(--ae-danger);
  }
}
</style>
