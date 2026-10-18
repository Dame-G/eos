<script lang="ts">
export interface SignatureValue {
  /** How the person signed. */
  method: "type" | "draw";
  /** The typed name. Kept when switching to Draw. */
  name: string;
  /** The drawn signature as a PNG data URL. Empty unless the method is `draw`. */
  image: string;
  /** Whether the person ticked the agreement. */
  agreed: boolean;
}
</script>

<script setup lang="ts">
import { computed } from "vue";
import AeSegmented from "../Segmented/AeSegmented.vue";
import AeTextField from "../TextField/AeTextField.vue";
import AeCheckbox from "../Checkbox/AeCheckbox.vue";
import AeSignaturePad from "../SignaturePad/AeSignaturePad.vue";
import { useConfig, useMessages } from "../../config.js";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** Names the group and heads it. Say what the form is. Default "Signature". */
    label?: string;
    /** `type` the default, `draw`, or `both` which adds a Type and Draw switch. A drawn signature cannot be made from a keyboard, so `both` is the usual choice. */
    mode?: "type" | "draw" | "both";
    /** The sentence the person agrees to. Default "I agree and want to sign this form." */
    agreement?: string;
    /** The date shown with the signature. Today when left out. */
    date?: Date;
    disabled?: boolean;
    /** The id of the typed-name input. Generated when left out. */
    id?: string;
  }>(),
  { mode: "type" },
);

/** What the person has signed: the method, the typed name, the drawn image and the agreement. */
const model = defineModel<SignatureValue>({
  default: () => ({ method: "type", name: "", image: "", agreed: false }),
});

const t = useMessages();
const config = useConfig();
const id = useUid(() => props.id);

/** With `both` the person chooses; otherwise the mode decides. */
const method = computed<"type" | "draw">(() => (props.mode === "both" ? model.value.method : props.mode));
const dateText = computed(() =>
  new Intl.DateTimeFormat(config.locale, { year: "numeric", month: "long", day: "numeric" }).format(
    props.date ?? new Date(),
  ),
);

function update(patch: Partial<SignatureValue>) {
  const next = { ...model.value, method: method.value, ...patch };
  model.value = { ...next, image: next.method === "draw" ? next.image : "" };
}
</script>

<template>
  <fieldset class="ae-sign" :disabled="disabled">
    <legend class="ae-kicker ae-sign-legend">{{ label || t("signature") }}</legend>
    <AeSegmented
      v-if="mode === 'both'"
      :label="t('signature')"
      :model-value="method"
      :options="[
        { value: 'type', label: t('signType'), icon: 'edit' },
        { value: 'draw', label: t('signDraw'), icon: 'signature' },
      ]"
      @update:model-value="update({ method: $event as 'type' | 'draw', image: '' })"
    />
    <template v-if="method === 'type'">
      <AeTextField
        :id="id"
        :model-value="model.name"
        :label="t('typeName')"
        :placeholder="t('fullName')"
        autocomplete="name"
        required
        :hint="t('signHint')"
        @update:model-value="update({ name: $event })"
      />
      <div class="ae-sign-line" aria-live="polite">
        <span v-if="model.name" class="ae-sign-name">{{ model.name }}</span>
        <span v-else class="ae-sign-empty">{{ t("signAppears") }}</span>
        <span class="ae-sign-date">{{ dateText }}</span>
      </div>
    </template>
    <template v-else>
      <AeSignaturePad :model-value="model.image" :disabled="disabled" @update:model-value="update({ image: $event })" />
      <p class="ae-sign-date ae-sign-date--solo">{{ dateText }}</p>
    </template>
    <AeCheckbox
      :model-value="model.agreed"
      :label="agreement || t('agreeSign')"
      :disabled="disabled"
      @update:model-value="update({ agreed: $event })"
    />
  </fieldset>
</template>

<style>
@layer ae.composites {
  .ae-sign {
    display: grid;
    gap: var(--ae-space-3);
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .ae-sign-legend {
    padding: 0;
    margin-bottom: var(--ae-space-2);
  }

  .ae-sign-line {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--ae-space-3);
    min-height: 72px;
    padding: var(--ae-space-2) var(--ae-space-4);
    border-bottom: 2px solid var(--ae-ink);
    background: var(--ae-surface-tint);
    border-radius: var(--ae-radius-md) var(--ae-radius-md) 0 0;
  }

  .ae-sign-name {
    font:
      italic 500 30px/1.2 "Segoe Script",
      "Snell Roundhand",
      "Brush Script MT",
      cursive;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .ae-sign-empty {
    font: 400 var(--ae-text-md)/1.4 var(--ae-font-sans);
    color: var(--ae-muted);
  }

  .ae-sign-date {
    flex: none;
    font: 500 var(--ae-text-xs)/1.2 var(--ae-font-mono);
    color: var(--ae-muted);
  }

  .ae-sign-date--solo {
    margin: 0;
  }
}
</style>
