// @internal: shared by the components, not exported from the package (see scripts/gen-index.mjs).
import { ref, type Ref } from "vue";
import { useFieldAttrs, type DescribedBy } from "./useFieldAttrs.js";
import { sizeAttr, type EFieldSize } from "../components/Field/fieldProps.js";

/** The scope EField gives its default slot. */
export interface FieldSlot {
  id: string;
  ariaInvalid: "true" | undefined;
  ariaDescribedby: string | undefined;
  required: boolean;
}

/** The props the shared binding reads. Pass the component's `props`. */
export interface FieldControlProps {
  disabled?: boolean | undefined;
  readonly?: boolean | undefined;
  required?: boolean | undefined;
  size?: EFieldSize | undefined;
  loading?: boolean | undefined;
}

/**
 * The shape every text-like field shares. Use it with `defineOptions({ inheritAttrs: false })`:
 *
 * ```vue
 * <EField v-bind="control.attrs.wrapper()" ...>
 *   <template #default="field">
 *     <EInputShell v-bind="control.shell(error)">
 *       <input ref="input" v-bind="control.bind(field, [extraIds])" />
 *     </EInputShell>
 *     <input v-if="name" type="hidden" v-bind="control.hidden(name, value)" />
 * ```
 *
 * `bind` is the id, `aria-invalid`, `aria-describedby` (the ids you list, the field's hint or error id, then the consumer's own),
 * `required`, `disabled`, `readonly`, `aria-busy` and `data-size`. `defineExpose(control.exposed)` gives `input` and `focus()`.
 */
export function useFieldControl<El extends HTMLElement = HTMLInputElement>(props: FieldControlProps) {
  const attrs = useFieldAttrs();
  const input = ref<El | null>(null) as Ref<El | null>;
  const own = (field: FieldSlot): Record<string, unknown> => ({
    id: field.id,
    required: props.required,
    disabled: props.disabled,
    readonly: props.readonly,
    "aria-invalid": field.ariaInvalid,
    "aria-busy": props.loading || undefined,
    "data-size": sizeAttr(props.size),
  });
  return {
    attrs,
    input,
    /** The props for `EInputShell`. */
    shell: (invalid?: boolean | string) => ({
      invalid: !!invalid,
      disabled: props.disabled,
      readonly: props.readonly,
      loading: props.loading,
      size: props.size,
    }),
    /** The attributes the real input needs from the field. Spread the field's own (`type`, `value`, `placeholder`) beside it. */
    bind: (field: FieldSlot, describedby: readonly DescribedBy[] = []): Record<string, unknown> => ({
      ...own(field),
      ...attrs.input([...describedby, field.ariaDescribedby]),
    }),
    /** `bind` without the consumer's attributes, for the inputs inside an element that takes them (`attrs.group()`). */
    own: (field: FieldSlot): Record<string, unknown> => ({
      ...own(field),
      "aria-describedby": field.ariaDescribedby,
    }),
    /** A hidden input that posts the value under `name`. Disabled, it posts nothing; `form` puts it in a form it is not inside. */
    hidden: (name: string | undefined, value: string | number | null | undefined) => ({
      name,
      value: value ?? "",
      disabled: props.disabled || undefined,
      form: attrs.form(),
    }),
    exposed: { input, focus: () => input.value?.focus() },
  };
}
