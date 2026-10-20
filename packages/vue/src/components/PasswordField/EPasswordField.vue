<script lang="ts">
export interface PasswordRule {
  /** What the password needs, such as "At least 10 characters". */
  label: string;
  /** Whether the password meets the rule. */
  test: (value: string) => boolean;
}
</script>

<script setup lang="ts">
import { computed, ref } from "vue";
import EIcon from "../Icon/EIcon.vue";
import EField from "../Field/EField.vue";
import { useMessages } from "../../config.js";
import { focusInside } from "../../composables/focusInside.js";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import "../../styles/base.css";
import "../TextField/input.css";
import "../Combobox/combo.css";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  /** The visible label, a mono kicker above the field. @default "Password" */
  label?: string;
  /** Keep the label for screen readers and remove it from the page. */
  hideLabel?: boolean;
  /** `current` for signing in, `new` for choosing one. Sets `autocomplete` (`current-password` or `new-password`) so a password manager can fill or suggest. */
  mode?: "current" | "new";
  /** `{ label, test(value) }`. A checklist under the field that updates as the person types. Each rule shows a tick or an empty circle and says "met" or "not met yet". */
  rules?: PasswordRule[];
  /** Help that stays under the field. */
  hint?: string;
  /** What to fix. Replaces the hint, marks the input invalid and is announced. */
  error?: string;
  /** The `required` attribute and a word beside the label. */
  required?: boolean;
  /** A word beside the label. Flag whichever is rarer. */
  optional?: boolean;
  /** Disables the input and the toggle. */
  disabled?: boolean;
  /** The id of the input; the label points at it. @default generated */
  id?: string;
}>();

/** The password. */
const model = defineModel<string>({ default: "" });

const t = useMessages();
const attrs = useFieldAttrs();
const input = ref<HTMLInputElement | null>(null);
const shown = ref(false);

const list = computed(() => props.rules ?? []);

function inputBind(field: { id: string; ariaInvalid: "true" | undefined; ariaDescribedby: string | undefined }) {
  const describedby = [field.ariaDescribedby, list.value.length ? `${field.id}-rules` : ""].filter(Boolean).join(" ");
  return {
    id: field.id,
    class: "e-input",
    type: shown.value ? "text" : "password",
    value: model.value,
    disabled: props.disabled,
    required: props.required,
    autocomplete: props.mode === "new" ? "new-password" : "current-password",
    autocapitalize: "none",
    spellcheck: false,
    "aria-invalid": field.ariaInvalid,
    ...attrs.input(describedby || undefined),
  };
}

defineExpose({
  input,
  focus: () => input.value?.focus(),
});
</script>

<template>
  <EField
    v-bind="attrs.wrapper()"
    :id="id"
    :label="label || t('password')"
    :hide-label="hideLabel"
    :hint="hint"
    :error="error"
    :required="required"
    :optional="optional"
  >
    <template #default="field">
      <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
      <div
        class="e-input-wrap"
        :data-invalid="error ? '' : undefined"
        :data-disabled="disabled ? '' : undefined"
        @click="focusInside"
      >
        <input ref="input" v-bind="inputBind(field)" @input="model = ($event.target as HTMLInputElement).value" />
        <button
          type="button"
          class="e-combo-btn"
          :aria-pressed="shown ? 'true' : 'false'"
          :aria-label="shown ? t('hidePassword') : t('showPassword')"
          :disabled="disabled"
          @click="shown = !shown"
        >
          <EIcon :name="shown ? 'eye-slash' : 'eye'" />
        </button>
      </div>
      <ul v-if="list.length" :id="`${field.id}-rules`" class="e-rules" :aria-label="t('passwordRules')">
        <li v-for="r in list" :key="r.label" class="e-rule" :data-met="r.test(model) ? '' : undefined">
          <EIcon v-if="r.test(model)" name="check" small />
          <span v-else class="e-rule-dot" aria-hidden="true" />
          {{ r.label }}
          <span class="e-sr"> ({{ t(r.test(model) ? "ruleMet" : "ruleNotMet") }})</span>
        </li>
      </ul>
    </template>
  </EField>
</template>

<style>
@layer e.composites {
  /* The hidden-character dots keep the size of plain text so the caret matches when they are shown. */
  .e-input-wrap .e-input[type="password"] {
    letter-spacing: 0.12em;
  }

  .e-rules {
    display: grid;
    gap: var(--e-space-1);
    margin: 0;
    padding: 0;
    list-style: none;
    font: 400 var(--e-text-sm)/1.4 var(--e-font-sans);
  }

  .e-rule {
    display: flex;
    align-items: center;
    gap: var(--e-space-2);
    color: var(--e-muted);
  }

  .e-rule[data-met] {
    color: var(--e-secondary);
  }

  .e-rule .e-icon {
    flex: none;
  }

  .e-rule-dot {
    flex: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    box-shadow: inset 0 0 0 var(--e-stroke-edge) var(--e-border-strong);
  }
}
</style>
