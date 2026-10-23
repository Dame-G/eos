<script lang="ts">
export interface PasswordRule {
  /** What the password needs, such as "At least 10 characters". */
  label: string;
  /** Whether the password meets the rule. */
  test: (value: string) => boolean;
}
</script>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import EIcon from "../Icon/EIcon.vue";
import EField from "../Field/EField.vue";
import EInputShell from "../Field/EInputShell.vue";
import type { EFieldBoxProps, EFieldCommonProps } from "../Field/fieldProps.js";
import { useMessages } from "../../config.js";
import { useAnnouncer } from "../../composables/useAnnouncer.js";
import { useFieldControl, type FieldSlot } from "../../composables/useFieldControl.js";
import "../../styles/base.css";
import "../TextField/input.css";

defineOptions({ inheritAttrs: false });

const props = defineProps<
  EFieldCommonProps &
    EFieldBoxProps & {
      /** The visible label above the field. @default "Password" */
      label?: string;
      /** `current` for signing in, `new` for choosing one. Sets `autocomplete` (`current-password` or `new-password`) so a password manager can fill or suggest. */
      mode?: "current" | "new";
      /** The rules, as `{ label, test(value) }`. They form a checklist under the field that updates as the person types. Each rule is announced as "met" or "not met yet", and a rule that changes is announced. */
      rules?: PasswordRule[];
      /** An example, never the label. */
      placeholder?: string;
      /** The name submitted with a form. */
      name?: string;
    }
>();

/** The password. */
const model = defineModel<string>({ default: "" });

const t = useMessages();
const control = useFieldControl(props);
const { announce } = useAnnouncer();
const input = control.input;
const shown = ref(false);

/** Each rule with its result, computed once per change. */
const results = computed(() => (props.rules ?? []).map((rule) => ({ rule, met: rule.test(model.value) })));

watch(results, (next, prev) => {
  const changed = next.filter((r, i) => prev[i] && prev[i]!.rule === r.rule && prev[i]!.met !== r.met);
  if (changed.length) {
    announce(changed.map((r) => `${r.rule.label}: ${t(r.met ? "ruleMet" : "ruleNotMet")}`).join(". "));
  }
});

function inputBind(field: FieldSlot) {
  return {
    class: "e-input",
    type: shown.value ? "text" : "password",
    value: model.value,
    name: props.name,
    placeholder: props.placeholder,
    autocomplete: props.mode === "new" ? "new-password" : "current-password",
    autocapitalize: "none",
    spellcheck: false,
    ...control.bind(field, [results.value.length > 0 && `${field.id}-rules`]),
  };
}

defineExpose(control.exposed);
</script>

<template>
  <EField
    v-bind="control.attrs.wrapper()"
    :id="id"
    :label="label || t('password')"
    :hide-label="hideLabel"
    :hint="hint"
    :error="error"
    :required="required"
    :optional="optional"
  >
    <template #default="field">
      <EInputShell v-bind="control.shell(error)">
        <input ref="input" v-bind="inputBind(field)" @input="model = ($event.target as HTMLInputElement).value" />
        <button
          type="button"
          class="e-input-btn e-reveal e-interact e-interact--inset"
          :aria-pressed="shown"
          :aria-label="t('showPassword')"
          :disabled="disabled"
          @click="shown = !shown"
        >
          <EIcon :name="shown ? 'eye-slash' : 'eye'" />
        </button>
      </EInputShell>
      <ul v-if="results.length" :id="`${field.id}-rules`" class="e-rules" :aria-label="t('passwordRules')">
        <li v-for="r in results" :key="r.rule.label" class="e-rule" :data-met="r.met ? '' : undefined">
          <EIcon v-if="r.met" name="check" small />
          <span v-else class="e-rule-dot" aria-hidden="true" />
          {{ r.rule.label }}
          <span class="e-sr"> ({{ t(r.met ? "ruleMet" : "ruleNotMet") }})</span>
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
    gap: var(--e-gap-tight);
    margin: 0;
    padding: 0;
    list-style: none;
    font: var(--e-type-small);
  }

  .e-rule {
    display: flex;
    align-items: center;
    gap: var(--e-gap-snug);
    color: var(--e-muted);
  }

  .e-rule[data-met] {
    color: var(--e-success);
  }

  .e-rule .e-icon {
    flex: none;
  }

  .e-rule-dot {
    flex: none;
    width: var(--e-icon-size-sm);
    height: var(--e-icon-size-sm);
    border-radius: var(--e-radius-round);
    box-shadow: inset 0 0 0 var(--e-stroke-edge) var(--e-border-strong);
  }
}
</style>
