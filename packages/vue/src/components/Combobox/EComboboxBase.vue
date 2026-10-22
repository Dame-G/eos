<script setup lang="ts">
import { computed, h, nextTick, onMounted, ref, watch, type FunctionalComponent } from "vue";
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxInput,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxViewport,
} from "reka-ui";
import EField from "../Field/EField.vue";
import EIcon from "../Icon/EIcon.vue";
import ESpinner from "../Spinner/ESpinner.vue";
import EComboboxOption from "./EComboboxOption.vue";
import { normalizeOptions, sectionOptions } from "../Select/options.js";
import type { EComboboxProps } from "./types.js";
import { useMessages, usePortalTarget } from "../../config.js";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import { useAnnouncer } from "../../composables/useAnnouncer.js";
import { useUid } from "../../composables/useUid.js";
import "../../styles/base.css";
import "../TextField/input.css";
import "../Select/panel.css";
import "./combo.css";

defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<EComboboxProps>(), {
  clearable: true,
});

const emit = defineEmits<{
  /** The text in the input changed, by typing or by choosing. Use it to fetch options from a server. */
  inputChange: [text: string];
}>();

const model = defineModel<string | string[]>();

const t = useMessages();
const { announce: say } = useAnnouncer();
const portal = usePortalTarget();
const attrs = useFieldAttrs();
const groupId = useUid();
const bareId = useUid(() => props.id);

const Bare: FunctionalComponent = (_, { slots }) =>
  h("div", attrs.wrapper(), slots.default?.({ id: bareId.value, ariaInvalid: undefined, ariaDescribedby: undefined }));
const frame = computed(() =>
  props.bare
    ? {}
    : {
        id: props.id,
        label: props.label,
        hideLabel: props.hideLabel,
        hint: props.hint,
        error: props.error,
        required: props.required,
        optional: props.optional,
      },
);
const listName = computed(() => (props.bare ? (props.ariaLabel ?? props.label) : props.label));

const multiple = computed(() => props.multiple);
// Free text is for one value, so `multiple` ignores it.
const free = computed(() => props.freeform && !props.multiple);
const all = computed(() => normalizeOptions(props.options));
const values = computed<string[]>(() => (multiple.value && Array.isArray(model.value) ? model.value : []));
const single = computed(() => (typeof model.value === "string" ? model.value : ""));
const rootValue = computed(() => (multiple.value ? values.value : single.value));

function labelOf(v: string): string {
  return all.value.find((o) => o.value === v)?.label ?? (free.value ? v : "");
}
const resting = () => (multiple.value ? "" : labelOf(single.value));

const text = ref(resting());
const typing = ref(false);
const wantOpen = defineModel<boolean>("open", { default: false });
const anchor = ref<{ $el: HTMLElement } | null>(null);
const query = computed(() => (typing.value ? text.value.trim().toLowerCase() : ""));

const shown = computed(() => {
  const q = query.value;
  if (props.filter) return all.value.filter((o) => props.filter!(o, q));
  return all.value.filter(
    (o) => !q || o.label.toLowerCase().includes(q) || (o.description ?? "").toLowerCase().includes(q),
  );
});
const sections = computed(() => sectionOptions(shown.value));
const hasList = computed(() => shown.value.length > 0 || !!props.loading || !free.value);
const open = computed(() => wantOpen.value && hasList.value && !props.disabled);
const announce = computed(() =>
  open.value && !shown.value.length ? (props.loading ? t("searching") : props.emptyText || t("noMatches")) : "",
);
const hasValue = computed(() => (multiple.value ? values.value.length > 0 : !!text.value));

watch(rootValue, () => {
  const rest = resting();
  if (rest !== text.value) {
    text.value = rest;
    typing.value = false;
  }
});
watch(all, () => {
  if (!typing.value && !open.value) text.value = resting();
});

const listId = ref<string | undefined>();
const content = ref<{ $el: HTMLElement } | null>(null);
onMounted(() => {
  if (!open.value) return;
  let tries = 0;
  const read = () => {
    listId.value = content.value?.$el?.id || undefined;
    if (!listId.value && tries++ < 10) requestAnimationFrame(read);
  };
  void nextTick(read);
});

const inputEl = () => anchor.value?.$el?.querySelector("input") ?? null;
const focusInput = () => inputEl()?.focus();

function isSelected(value: string): boolean {
  return multiple.value ? values.value.includes(value) : free.value ? single.value === value : single.value === value;
}
const itemValue = (o: { value: string; label: string }) => (free.value ? o.label : o.value);

function onPick(v: unknown) {
  typing.value = false;
  if (multiple.value) {
    model.value = Array.isArray(v) ? (v as string[]) : [];
    text.value = "";
    emit("inputChange", "");
    return;
  }
  const next = typeof v === "string" ? v : "";
  model.value = next;
  text.value = free.value ? next : labelOf(next);
  emit("inputChange", text.value);
}

function onInput(e: Event) {
  const v = (e.target as HTMLInputElement).value;
  text.value = v;
  typing.value = true;
  wantOpen.value = true;
  emit("inputChange", v);
  if (free.value) model.value = v;
}

function remove(v: string) {
  model.value = values.value.filter((x) => x !== v);
  say(t("removedItem", { label: labelOf(v) }));
  focusInput();
}

function clear() {
  model.value = multiple.value ? [] : "";
  text.value = "";
  typing.value = false;
  emit("inputChange", "");
  focusInput();
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && !open.value && text.value) {
    e.preventDefault();
    clear();
  } else if (e.key === "Backspace" && multiple.value && !text.value && values.value.length) {
    remove(values.value[values.value.length - 1]!);
  }
}

function keepCaretKeys(e: KeyboardEvent) {
  if (e.key === "Home" || e.key === "End") e.stopImmediatePropagation();
}

function onBlur(e: FocusEvent) {
  const next = e.relatedTarget as Element | null;
  if (next && (anchor.value?.$el?.contains(next) || next.closest?.(".e-popover"))) return;
  wantOpen.value = false;
  typing.value = false;
  if (!free.value) text.value = resting();
}

function onWrapDown(e: MouseEvent) {
  if (e.target === e.currentTarget && !props.disabled) {
    e.preventDefault();
    focusInput();
  }
}

type FieldSlot = { id: string; ariaInvalid: "true" | undefined; ariaDescribedby: string | undefined };
function inputBind(field: FieldSlot) {
  return {
    id: field.id,
    required: props.required && !(multiple.value && values.value.length) ? true : undefined,
    placeholder: multiple.value && values.value.length ? "" : props.placeholder,
    "aria-invalid": field.ariaInvalid,
    "aria-label": props.bare ? listName.value : undefined,
    autocomplete: "off",
    ...(listId.value ? { "aria-controls": listId.value } : {}),
    ...(shown.value.length ? {} : { "aria-activedescendant": undefined }),
    ...attrs.input(field.ariaDescribedby),
  };
}

defineExpose({
  input: computed(() => inputEl()),
  focus: focusInput,
});
</script>

<template>
  <component :is="bare ? Bare : EField" v-bind="{ ...attrs.wrapper(), ...frame }">
    <template #default="field">
      <ComboboxRoot
        class="e-combo-root"
        :model-value="rootValue"
        :multiple="multiple"
        :open="open"
        :disabled="disabled"
        ignore-filter
        @update:model-value="onPick"
        @update:open="wantOpen = $event"
      >
        <ComboboxAnchor
          ref="anchor"
          class="e-input-wrap e-combo"
          :class="{ 'e-combo--multi': multiple }"
          :data-invalid="error && !bare ? '' : undefined"
          :data-disabled="disabled ? '' : undefined"
          @mousedown="onWrapDown"
          @focusout="onBlur"
        >
          <div class="e-combo-main">
            <template v-if="multiple">
              <span v-for="v in values" :key="v" class="e-tag">
                {{ labelOf(v) }}
                <button
                  v-if="!disabled"
                  type="button"
                  class="e-tag-x"
                  :aria-label="t('removeItem', { label: labelOf(v) })"
                  @click="remove(v)"
                >
                  <EIcon name="x" small />
                </button>
              </span>
            </template>
            <ComboboxInput
              class="e-input e-combo-input"
              :model-value="text"
              :display-value="(v: unknown) => (typeof v === 'string' ? (free ? v : labelOf(v)) : '')"
              :disabled="disabled"
              v-bind="inputBind(field)"
              @update:model-value="text = $event"
              @input="onInput"
              @keydown="onKeydown"
              @keydown.capture="keepCaretKeys"
            />
          </div>
          <template v-if="name">
            <input v-for="(v, k) in multiple ? values : [single]" :key="k" type="hidden" :name="name" :value="v" />
          </template>
          <div class="e-combo-tail">
            <button
              v-if="hasValue && clearable && !disabled"
              type="button"
              class="e-combo-btn"
              :aria-label="t('clear')"
              @mousedown.prevent
              @click="clear"
            >
              <EIcon name="x" />
            </button>
            <ComboboxTrigger
              v-if="!free && !disabled"
              class="e-combo-btn"
              :aria-label="t('showOptions')"
              :disabled="disabled"
              @mousedown.prevent
            >
              <EIcon name="chevron-down" bold />
            </ComboboxTrigger>
          </div>
        </ComboboxAnchor>
        <span class="e-sr" role="status">{{ announce }}</span>
        <ComboboxPortal :to="portal">
          <ComboboxContent
            ref="content"
            position="popper"
            align="start"
            :side-offset="6"
            :collision-padding="8"
            class="e-popover e-listpanel e-root"
            :aria-label="listName"
            :aria-busy="loading ? 'true' : undefined"
          >
            <ComboboxViewport>
              <template v-if="shown.length">
                <template v-for="(section, i) in sections" :key="i">
                  <div v-if="section.group" class="e-opt-set" role="group" :aria-labelledby="`${groupId}-g${i}`">
                    <div :id="`${groupId}-g${i}`" class="e-opt-group">{{ section.group }}</div>
                    <EComboboxOption
                      v-for="o in section.options"
                      :key="o.value"
                      :option="o"
                      :value="itemValue(o)"
                      :selected="isSelected(itemValue(o))"
                      :query="query"
                    />
                  </div>
                  <template v-else>
                    <EComboboxOption
                      v-for="o in section.options"
                      :key="o.value"
                      :option="o"
                      :value="itemValue(o)"
                      :selected="isSelected(itemValue(o))"
                      :query="query"
                    />
                  </template>
                </template>
              </template>
              <div v-else class="e-opt-status" role="option" aria-disabled="true" aria-selected="false">
                <ESpinner v-if="loading" :label="t('searching')" />
                <template v-else>{{ emptyText || t("noMatches") }}</template>
              </div>
            </ComboboxViewport>
          </ComboboxContent>
        </ComboboxPortal>
      </ComboboxRoot>
    </template>
  </component>
</template>

<style>
@layer e.controls {
  .e-combo-main {
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    align-items: center;
    align-self: stretch;
    gap: var(--e-space-1);
    min-width: 0;
  }

  .e-combo-tail {
    display: flex;
    flex: none;
    align-items: center;
    align-self: center;
  }

  .e-combo--multi {
    padding: calc(3px - var(--e-stroke-edge)) calc(var(--e-space-1) - var(--e-stroke-edge))
      calc(3px - var(--e-stroke-edge)) calc(var(--e-space-2) - var(--e-stroke-edge));
    gap: var(--e-space-1);
  }

  .e-combo--multi .e-input {
    height: calc(var(--e-control-height) - 9px);
    align-self: center;
    padding-inline: var(--e-space-2);
  }

  .e-combo-main .e-tag:not(:has(.e-tag-x)) {
    padding-inline-end: var(--e-space-3);
  }

  .e-tag {
    display: inline-flex;
    align-items: center;
    gap: var(--e-space-1);
    height: var(--e-space-8);
    padding: 0 var(--e-space-1) 0 var(--e-space-3);
    border-radius: var(--e-radius-pill);
    background: var(--e-surface-tint);
    box-shadow: inset 0 0 0 var(--e-stroke-card) var(--e-primary);
    color: var(--e-ink);
    font: 500 var(--e-text-sm)/1 var(--e-font-sans);
  }

  /* A disabled field's chips are plain, not primary. */
  .e-input-wrap[data-disabled] .e-tag {
    box-shadow: inset 0 0 0 var(--e-stroke-card) var(--e-border-strong);
    color: var(--e-muted);
  }

  .e-tag-x::after {
    content: "";
    position: absolute;
    inset: calc((var(--e-tap) - var(--e-space-6)) / -2);
  }

  .e-tag-x {
    position: relative;
    display: inline-grid;
    place-items: center;
    width: var(--e-space-6);
    height: var(--e-space-6);
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: var(--e-primary);
    cursor: pointer;
  }

  .e-tag-x:hover {
    background: var(--e-wash-hover);
    box-shadow: inset 0 0 0 var(--e-stroke-card) var(--e-primary);
  }

  .e-tag-x:active {
    background: var(--e-wash-press);
  }

  .e-tag-x:focus-visible {
    outline: var(--e-stroke-focus) solid var(--e-focus-ring);
    outline-offset: var(--e-focus-gap);
  }

  @media (forced-colors: active) {
    .e-tag {
      outline: var(--e-stroke-card) solid CanvasText;
    }
  }
}
</style>
