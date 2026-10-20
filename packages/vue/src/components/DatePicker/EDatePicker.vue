<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { PopoverAnchor, PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from "reka-ui";
import ECalendar from "../Calendar/ECalendar.vue";
import EField from "../Field/EField.vue";
import EIcon from "../Icon/EIcon.vue";
import { compareDays, isoDate, sameDay } from "../Calendar/dates.js";
import { useConfig, useMessages, usePortalTarget } from "../../config.js";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import { useQuietFocus } from "../Select/quietFocus.js";
import { useLocale } from "../../composables/useLocale.js";
import "../../styles/base.css";
import "../TextField/input.css";
import "../Combobox/combo.css";
import "./picker.css";

defineOptions({ inheritAttrs: false });

const props = defineProps<{
  /** The visible label, a mono kicker above the field. */
  label: string;
  /** Keep the label for screen readers and remove it from the page. */
  hideLabel?: boolean;
  /** Help that stays under the field. */
  hint?: string;
  /** What to fix. Replaces the hint and marks the field invalid. A typed date that cannot be used shows its own error (`dateError`, `dateBetween`). */
  error?: string;
  /** The `required` attribute and a word beside the label. */
  required?: boolean;
  /** A word beside the label. Flag whichever is rarer. */
  optional?: boolean;
  /** Disables the field and its calendar button. */
  disabled?: boolean;
  /** The earliest date that can be chosen or typed. */
  min?: Date;
  /** The latest date that can be chosen or typed. */
  max?: Date;
  /** Submits the date as `YYYY-MM-DD` with a form, through a hidden input. */
  name?: string;
  /** The id of the text box; the label points at it. @default generated */
  id?: string;
}>();

/** The chosen date. */
const model = defineModel<Date | null>({ default: null });

const t = useMessages();
const config = useConfig();
const loc = useLocale();
const portal = usePortalTarget();
const attrs = useFieldAttrs();

const input = ref<HTMLInputElement | null>(null);
const calendar = ref<InstanceType<typeof ECalendar> | null>(null);
/** Whether the calendar is open. Setting it moves no focus; a disabled field never opens. */
const open = defineModel<boolean>("open", { default: false });
const shown = computed(() => open.value && !props.disabled);
const quiet = useQuietFocus(shown, (el) => !!el.closest(".e-calpanel, .e-combo"));
const trigger = { onClick: quiet.intent, onKeydown: quiet.intent };

const text = ref(loc.formatDate(model.value));
const typedError = ref("");
let outside = false;

watch([() => model.value?.getTime(), () => config.locale], () => {
  text.value = loc.formatDate(model.value);
});
watch(open, (isOpen) => {
  if (isOpen) outside = false;
});

const shownError = computed(() => props.error || typedError.value);

function set(d: Date | null) {
  model.value = d;
  text.value = loc.formatDate(d);
  typedError.value = "";
}

function commit() {
  const raw = text.value.trim();
  if (!raw) {
    typedError.value = "";
    if (model.value) model.value = null;
    return;
  }
  const d = loc.parseDate(raw);
  if (!d || (props.min && compareDays(d, props.min) < 0) || (props.max && compareDays(d, props.max) > 0)) {
    typedError.value = d
      ? t("dateBetween", { min: loc.formatDate(props.min || d), max: loc.formatDate(props.max || d) })
      : t("dateError", { format: loc.dateFormatLabel() });
    return;
  }
  typedError.value = "";
  text.value = loc.formatDate(d);
  if (!sameDay(d, model.value)) model.value = d;
}

function onKey(e: KeyboardEvent) {
  if (e.key === "Enter") commit();
  else if (e.key === "ArrowDown" && e.altKey && !props.disabled) {
    e.preventDefault();
    quiet.intent();
    open.value = true;
  }
}

function choose(d: Date | null) {
  if (!d) return;
  set(d);
  open.value = false;
}
function clear() {
  set(null);
  open.value = false;
}

function onOpenFocus(e: Event) {
  e.preventDefault();
  if (!quiet.personOpened()) return;
  void nextTick(() => calendar.value?.focusDay());
}
function onCloseFocus(e: Event) {
  e.preventDefault();
  if (!quiet.returnsFocus()) return;
  if (!outside) input.value?.focus();
}
function onEscape(e: KeyboardEvent) {
  if (calendar.value && calendar.value.view !== "days") e.preventDefault();
}

function inputBind(field: { id: string; ariaInvalid: "true" | undefined; ariaDescribedby: string | undefined }) {
  return {
    id: field.id,
    class: "e-input e-combo-input",
    type: "text",
    inputmode: "numeric" as const,
    autocomplete: "off",
    placeholder: loc.dateFormatLabel(),
    value: text.value,
    disabled: props.disabled,
    required: props.required,
    "aria-invalid": field.ariaInvalid,
    ...attrs.input(field.ariaDescribedby),
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
    :label="label"
    :hide-label="hideLabel"
    :hint="hint"
    :error="shownError"
    :required="required"
    :optional="optional"
  >
    <template #default="field">
      <PopoverRoot :open="shown" @update:open="open = $event">
        <PopoverAnchor as-child>
          <div
            class="e-input-wrap e-combo"
            :data-invalid="shownError ? '' : undefined"
            :data-disabled="disabled ? '' : undefined"
          >
            <input
              ref="input"
              v-bind="inputBind(field)"
              @input="
                text = ($event.target as HTMLInputElement).value;
                typedError = '';
              "
              @blur="commit"
              @keydown="onKey"
            />
            <input v-if="name" type="hidden" :name="name" :value="isoDate(model)" />
            <PopoverTrigger as-child v-bind="trigger">
              <button type="button" class="e-combo-btn" :aria-label="t('chooseDate')" :disabled="disabled">
                <EIcon name="calendar" />
              </button>
            </PopoverTrigger>
          </div>
        </PopoverAnchor>
        <PopoverPortal :to="portal">
          <PopoverContent
            class="e-calpanel e-root"
            :aria-label="t('chooseDate')"
            :dir="config.dir ?? undefined"
            side="bottom"
            align="start"
            :side-offset="6"
            :collision-padding="8"
            @open-auto-focus="onOpenFocus"
            @close-auto-focus="onCloseFocus"
            @interact-outside="outside = true"
            @escape-key-down="onEscape"
          >
            <ECalendar
              ref="calendar"
              :model-value="model"
              :min="min"
              :max="max"
              @update:model-value="choose"
              @clear="clear"
            />
          </PopoverContent>
        </PopoverPortal>
      </PopoverRoot>
    </template>
  </EField>
</template>
