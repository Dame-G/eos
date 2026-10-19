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
import EFieldMessage from "../Field/EFieldMessage.vue";
import ESegmented from "../Segmented/ESegmented.vue";
import ETextField from "../TextField/ETextField.vue";
import ECheckbox from "../Checkbox/ECheckbox.vue";
import ESignaturePad from "../SignaturePad/ESignaturePad.vue";
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
    /** Help that is announced with the group. */
    hint?: string;
    /** What to fix. Replaces the hint and is announced with the group. */
    error?: string;
    disabled?: boolean;
    /** The name submitted with a form: the typed name, or the drawn image as a data URL. */
    name?: string;
    /** The id of the typed-name input. Generated when left out. */
    id?: string;
  }>(),
  { mode: "type" },
);

const model = defineModel<SignatureValue>({
  default: () => ({ method: "type", name: "", image: "", agreed: false }),
});

const t = useMessages();
const config = useConfig();
const id = useUid(() => props.id);
const hintId = computed(() => `${id.value}-sign-hint`);

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
  <fieldset
    class="e-sign"
    :disabled="disabled"
    :aria-describedby="error || hint ? hintId : undefined"
    :aria-invalid="error ? 'true' : undefined"
  >
    <legend class="e-kicker e-sign-legend">{{ label || t("signature") }}</legend>
    <ESegmented
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
      <ETextField
        :id="id"
        :model-value="model.name"
        :label="t('typeName')"
        :placeholder="t('fullName')"
        autocomplete="name"
        required
        :hint="t('signHint')"
        @update:model-value="update({ name: $event })"
      />
      <div class="e-sign-line" aria-live="polite">
        <span v-if="model.name" class="e-sign-name">{{ model.name }}</span>
        <span v-else class="e-sign-empty">{{ t("signAppears") }}</span>
        <span class="e-sign-date">{{ dateText }}</span>
      </div>
    </template>
    <template v-else>
      <ESignaturePad :model-value="model.image" :disabled="disabled" @update:model-value="update({ image: $event })" />
      <p class="e-sign-date e-sign-date--solo">{{ dateText }}</p>
    </template>
    <ECheckbox
      :model-value="model.agreed"
      :label="agreement || t('agreeSign')"
      :disabled="disabled"
      @update:model-value="update({ agreed: $event })"
    />
    <EFieldMessage :id="hintId" :error="error" :hint="hint" />
    <input v-if="name" type="hidden" :name="name" :value="method === 'draw' ? model.image : model.name" />
  </fieldset>
</template>

<style>
@layer e.composites {
  .e-sign {
    display: grid;
    gap: var(--e-space-3);
    min-width: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .e-sign-legend {
    padding: 0;
    margin-bottom: var(--e-space-2);
  }

  .e-sign-line {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--e-space-3);
    min-height: 52px;
    padding: var(--e-space-2) var(--e-space-4);
    border-bottom: 2px solid var(--e-ink);
    background: var(--e-surface-tint);
    border-radius: var(--e-radius-md) var(--e-radius-md) 0 0;
  }

  .e-sign-name {
    font:
      italic 500 28px/1.1 "Segoe Script",
      "Snell Roundhand",
      "Brush Script MT",
      cursive;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .e-sign-empty {
    font: 400 var(--e-text-md)/1.4 var(--e-font-sans);
    color: var(--e-muted);
  }

  .e-sign-date {
    flex: none;
    font: 500 var(--e-text-xs)/1.2 var(--e-font-mono);
    color: var(--e-muted);
  }

  .e-sign-date--solo {
    margin: 0;
  }
}
</style>
