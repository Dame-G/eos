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
import EFieldset from "../Fieldset/EFieldset.vue";
import ESegmented from "../Segmented/ESegmented.vue";
import ETextField from "../TextField/ETextField.vue";
import ECheckbox from "../Checkbox/ECheckbox.vue";
import ESignaturePad from "../SignaturePad/ESignaturePad.vue";
import { useConfig, useMessages } from "../../config.js";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";

const props = withDefaults(
  defineProps<{
    /** The group's heading and accessible name, such as the form being signed. @default "Signature" */
    label?: string;
    /** How the person signs: `type`, `draw` or `both`, which adds a Type and Draw switch. A drawn signature cannot be made from a keyboard, so `both` lets keyboard users type instead. */
    mode?: "type" | "draw" | "both";
    /** The sentence the person agrees to. @default "I agree and want to sign this form." */
    agreement?: string;
    /** The date shown with the signature, in the configured locale. @default today */
    date?: Date;
    /** Help that is announced with the group. */
    hint?: string;
    /** What to fix. Replaces the hint, is announced and marks the typed-name input or the pad invalid. */
    error?: string;
    /** Sets the `required` attribute on the typed-name input and shows a word beside the label. */
    required?: boolean;
    /** Disables the fields and the agreement. A disabled field is not submitted. */
    disabled?: boolean;
    /** Shows the signature but blocks changes: the name, the pad, the switch and the agreement. It is still submitted. */
    readonly?: boolean;
    /** The name submitted with a form: the typed name, or the drawn image as a data URL. */
    name?: string;
    /** The id of the typed-name input. @default generated */
    id?: string;
  }>(),
  { mode: "type" },
);

/** `image` is a PNG data URL, empty unless `method` is `draw`. */
const model = defineModel<SignatureValue>({
  default: () => ({ method: "type", name: "", image: "", agreed: false }),
});

const t = useMessages();
const config = useConfig();
const id = useUid(() => props.id);

const method = computed<"type" | "draw">(() => (props.mode === "both" ? model.value.method : props.mode));
const dateText = computed(() =>
  new Intl.DateTimeFormat(config.locale, { year: "numeric", month: "long", day: "numeric" }).format(
    props.date ?? new Date(),
  ),
);

function update(patch: Partial<SignatureValue>) {
  if (props.readonly) return;
  const next = { ...model.value, method: method.value, ...patch };
  model.value = { ...next, image: next.method === "draw" ? next.image : "" };
}
</script>

<template>
  <EFieldset
    class="e-sign"
    bare
    :legend="label || t('signature')"
    :hint="error ? undefined : hint"
    :required="required && method === 'draw'"
    :disabled="disabled"
  >
    <ESegmented
      v-if="mode === 'both'"
      :label="t('signature')"
      :model-value="method"
      :disabled="readonly"
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
        :required="required"
        :readonly="readonly"
        :error="error"
        :hint="t('signHint')"
        @update:model-value="update({ name: $event })"
      />
      <div class="e-sign-line">
        <span v-if="model.name" class="e-sign-name">{{ model.name }}</span>
        <span v-else class="e-sign-empty">{{ t("signAppears") }}</span>
        <span class="e-sign-date">{{ dateText }}</span>
      </div>
    </template>
    <template v-else>
      <ESignaturePad
        :model-value="model.image"
        :required="required"
        :error="error"
        :disabled="disabled"
        :readonly="readonly"
        @update:model-value="update({ image: $event })"
      />
      <p class="e-sign-date e-sign-date--solo">{{ dateText }}</p>
    </template>
    <ECheckbox
      :model-value="model.agreed"
      :label="agreement || t('agreeSign')"
      :disabled="disabled"
      :readonly="readonly"
      @update:model-value="update({ agreed: $event })"
    />
    <input
      v-if="name"
      type="hidden"
      :name="name"
      :disabled="disabled"
      :value="method === 'draw' ? model.image : model.name"
    />
  </EFieldset>
</template>

<style>
@layer e.composites {
  .e-sign {
    display: grid;
    gap: var(--e-gap-base);
  }

  .e-sign-line {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--e-gap-base);
    min-height: calc(var(--e-control-height) + var(--e-space-1));
    padding: var(--e-space-2) var(--e-space-4);
    border-bottom: var(--e-stroke-edge) solid var(--e-success);
    background: var(--e-success-soft);
    border-radius: var(--e-radius-md) var(--e-radius-md) 0 0;
  }

  .e-sign-name {
    font: italic var(--e-weight-medium) var(--e-text-3xl) / 1.1 var(--e-font-script);
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .e-sign-empty {
    font: var(--e-weight-regular) var(--e-text-md) / 1.4 var(--e-font-sans);
    color: var(--e-muted);
  }

  .e-sign-date {
    flex: none;
    font: var(--e-weight-medium) var(--e-text-xs) / 1.2 var(--e-font-mono);
    color: var(--e-muted);
  }

  .e-sign-date--solo {
    margin: 0;
  }
}
</style>
