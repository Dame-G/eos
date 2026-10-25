<script setup lang="ts" generic="M extends boolean = false">
import { computed, h, nextTick, onMounted, ref, watch, type FunctionalComponent } from "vue";
import {
  ConfigProvider,
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
import ETag from "../Tag/ETag.vue";
import ESpinner from "../Spinner/ESpinner.vue";
import EHiddenInputs from "../Field/EHiddenInputs.vue";
import EComboboxOption from "./EComboboxOption.vue";
import { normalizeOptions, sectionOptions } from "../Select/options.js";
import { fold } from "./fold.js";
import type { EComboboxProps } from "./types.js";
import { useMessages, usePortalTarget } from "../../config.js";
import { useDir } from "../../composables/useDir.js";
import { useFieldAttrs } from "../../composables/useFieldAttrs.js";
import { useAnnouncer } from "../../composables/useAnnouncer.js";
import { useUid } from "../../composables/useUid.js";
import type { FieldSlot } from "../../composables/useFieldControl.js";
import "../../styles/base.css";
import "../../styles/controls/input.css";
import "../../styles/controls/panel.css";
import "../../styles/controls/combo.css";

defineOptions({ inheritAttrs: false });

const props = defineProps<EComboboxProps<M>>();

const emit = defineEmits<{
  /** The text in the input changed, by typing or by choosing. Use it to fetch options from a server. */
  inputChange: [text: string];
  /** The person cleared the field, with the clear button or Escape. The model is already empty. */
  clear: [];
}>();

/** The `value` of the chosen option, empty for nothing. With `multiple` it holds the chosen values in the order chosen (replaced, not mutated). With `freeform` it is the typed text, updated on every key. @default "" or [] */
const model = defineModel<M extends true ? string[] : string>();

/** Whether the list is open. Setting it moves no focus, and a disabled or readonly field never opens. */
const wantOpen = defineModel<boolean>("open", { default: false });

const t = useMessages();
const { announce: say } = useAnnouncer();

const portal = usePortalTarget();
const attrs = useFieldAttrs();
const dir = useDir();
const groupId = useUid();
const bareId = useUid(() => props.id);

const Bare: FunctionalComponent = (_, { slots }) =>
  h(
    "div",
    attrs.wrapper(),
    slots.default?.({
      id: bareId.value,
      ariaInvalid: undefined,
      ariaDescribedby: undefined,
      required: !!props.required,
    }),
  );

/** A run of options: under its heading in a group when it has one, else as they are. One path for both. */
const Section: FunctionalComponent<{ group?: string | undefined; id: string }> = (p, { slots }) =>
  p.group
    ? h("div", { class: "e-opt-set", role: "group", "aria-labelledby": p.id }, [
        h("div", { id: p.id, class: "e-opt-group" }, p.group),
        slots.default?.(),
      ])
    : slots.default?.();
Section.props = ["group", "id"];
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

// `multiple` is typed `M`, so Vue cannot cast the bare attribute (`<ECombobox multiple>`, which arrives as "") to a boolean.
const multiple = computed(() => (props.multiple as unknown) === "" || !!props.multiple);
// Free text is for one value, so `multiple` ignores it.
const free = computed(() => props.freeform && !multiple.value);
const all = computed(() => normalizeOptions(props.options));
const values = computed<string[]>(() =>
  multiple.value && Array.isArray(model.value) ? (model.value as string[]) : [],
);
const single = computed(() => (typeof model.value === "string" ? model.value : ""));
const rootValue = computed(() => (multiple.value ? values.value : single.value));

function labelOf(v: string): string {
  return all.value.find((o) => o.value === v)?.label ?? (free.value ? v : "");
}
const resting = () => (multiple.value ? "" : labelOf(single.value));

const text = ref(resting());
const typing = ref(false);
const anchor = ref<{ $el: HTMLElement } | null>(null);
const query = computed(() => (typing.value ? fold(text.value.trim()) : ""));

const shown = computed(() => {
  const q = query.value;
  if (props.filter) return all.value.filter((o) => props.filter!(o, q));
  return all.value.filter((o) => !q || fold(o.label).includes(q) || fold(o.description ?? "").includes(q));
});
const sections = computed(() => sectionOptions(shown.value));
const hasList = computed(() => shown.value.length > 0 || !!props.loading || !free.value);
const open = computed(() => wantOpen.value && hasList.value && !props.disabled && !props.readonly);
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

// A list that starts open mounts after the input, so Reka has no id to point `aria-controls` at yet: read it once the list exists.
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
  return multiple.value ? values.value.includes(value) : single.value === value;
}
const itemValue = (o: { value: string; label: string }) => (free.value ? o.label : o.value);

function onPick(v: unknown) {
  typing.value = false;
  if (multiple.value) {
    model.value = (Array.isArray(v) ? (v as string[]) : []) as never;
    text.value = "";
    emit("inputChange", "");
    return;
  }
  const next = typeof v === "string" ? v : "";
  model.value = next as never;
  text.value = free.value ? next : labelOf(next);
  emit("inputChange", text.value);
}

function onInput(e: Event) {
  if (props.readonly) return;
  const v = (e.target as HTMLInputElement).value;
  text.value = v;
  typing.value = true;
  wantOpen.value = true;
  emit("inputChange", v);
  if (free.value) model.value = v as never;
}

function remove(v: string) {
  if (props.readonly) return;
  model.value = values.value.filter((x) => x !== v) as never;
  say(t("removedItem", { label: labelOf(v) }));
  focusInput();
}

function clear() {
  if (props.readonly) return;
  model.value = (multiple.value ? [] : "") as never;
  text.value = "";
  typing.value = false;
  emit("inputChange", "");
  emit("clear");
  focusInput();
}

function onKeydown(e: KeyboardEvent) {
  if (props.readonly) return;
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

/** Whether an element is in this field's own list, which is teleported out of the field. Another popover is not. */
function inOwnList(el: Element): boolean {
  const list = content.value?.$el as Element | undefined;
  const panel = el.closest?.(".e-popover");
  return !!list && !!panel && (panel === list || panel.contains(list));
}

function onBlur(e: FocusEvent) {
  const next = e.relatedTarget as Element | null;
  if (next && (anchor.value?.$el?.contains(next) || inOwnList(next))) return;
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

function inputBind(field: FieldSlot) {
  return {
    id: field.id,
    required: props.required && !(multiple.value && values.value.length) ? true : undefined,
    readonly: props.readonly || undefined,
    placeholder: multiple.value && values.value.length ? "" : props.placeholder,
    "aria-invalid": field.ariaInvalid,
    "aria-label": props.bare ? listName.value : undefined,
    autocomplete: "off",
    ...(listId.value ? { "aria-controls": listId.value } : {}),
    // Reka keeps pointing at the last highlighted option after the list empties; drop the stale id.
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
      <ConfigProvider :dir="dir">
        <ComboboxRoot
          class="e-combo-root"
          :dir="dir"
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
            :data-readonly="readonly ? '' : undefined"
            :data-size="size && size !== 'md' ? size : undefined"
            @mousedown="onWrapDown"
            @focusout="onBlur"
          >
            <div class="e-combo-main">
              <template v-if="multiple">
                <ETag
                  v-for="v in values"
                  :key="v"
                  :label="labelOf(v)"
                  :removable="!disabled && !readonly"
                  @remove="remove(v)"
                />
              </template>
              <ComboboxInput
                class="e-input e-combo-input"
                :model-value="text"
                :display-value="(v: unknown) => (typeof v === 'string' ? (free ? v : labelOf(v)) : '')"
                :disabled="disabled"
                v-bind="inputBind(field)"
                @input="onInput"
                @keydown="onKeydown"
                @keydown.capture="keepCaretKeys"
              />
            </div>
            <EHiddenInputs
              :name="name"
              :values="multiple ? values : [single]"
              :disabled="disabled"
              :form="attrs.form()"
            />
            <div class="e-combo-tail">
              <button
                v-if="hasValue && clearable && !disabled && !readonly"
                type="button"
                class="e-combo-btn"
                :aria-label="t('clear')"
                @mousedown.prevent
                @click="clear"
              >
                <EIcon name="x" />
              </button>
              <ComboboxTrigger
                v-if="!free && !disabled && !readonly"
                class="e-combo-btn"
                :aria-label="t('showOptions')"
                :disabled="disabled"
                @mousedown.prevent
              >
                <EIcon name="chevron-down" bold />
              </ComboboxTrigger>
            </div>
          </ComboboxAnchor>
          <!-- The one place the empty state is announced; the row in the list is for sighted people. -->
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
                  <Section v-for="(section, i) in sections" :id="`${groupId}-g${i}`" :key="i" :group="section.group">
                    <EComboboxOption
                      v-for="o in section.options"
                      :key="o.value"
                      :option="o"
                      :value="itemValue(o)"
                      :selected="isSelected(itemValue(o))"
                      :query="query"
                    />
                  </Section>
                </template>
                <div v-else class="e-opt-status" aria-hidden="true">
                  <ESpinner v-if="loading" :label="t('searching')" />
                  <template v-else>{{ emptyText || t("noMatches") }}</template>
                </div>
              </ComboboxViewport>
            </ComboboxContent>
          </ComboboxPortal>
        </ComboboxRoot>
      </ConfigProvider>
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
    gap: var(--e-gap-tight);
    min-width: 0;
  }

  .e-combo-tail {
    display: flex;
    flex: none;
    align-items: center;
    align-self: center;
  }

  .e-combo--multi {
    padding-block: calc(var(--e-gap-tight) - var(--e-stroke-edge));
    padding-inline: calc(var(--e-gap-snug) - var(--e-stroke-edge)) calc(var(--e-gap-tight) - var(--e-stroke-edge));
    gap: var(--e-gap-tight);
  }

  /* The input fills the wrap's inner height: the box height less the wrap's block padding and edge, a tight gap on each side. */
  .e-combo--multi .e-input {
    height: calc(var(--_h, var(--e-control-height)) - 2 * var(--e-gap-tight));
    align-self: center;
    padding-inline: var(--e-gap-snug);
  }

  /* A tag sits a tight gap inside the wrap's edge, edge included, on a wrapped row. */
  .e-combo--multi .e-tag {
    border-radius: max(0px, calc(var(--e-radius-md) - var(--e-gap-tight)));
  }

  /* A disabled field's tags are plain, not primary. */
  .e-input-wrap[data-disabled] .e-tag {
    --_ink: var(--e-muted);
  }
}
</style>
