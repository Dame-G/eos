import { inject, onBeforeUnmount, type InjectionKey } from "vue";

/** What a field tells the enclosing `EForm` so the error summary can list it. Getters, so the form always reads the current value. */
export interface FormFieldEntry {
  /** The id of the control, which the summary links to. */
  id: () => string;
  /** The visible label. */
  label: () => string;
  /** The `error` prop, when set. */
  error: () => string | undefined;
}

export interface FormContext {
  register(entry: FormFieldEntry): () => void;
}

export const FORM_KEY: InjectionKey<FormContext> = Symbol("eos-form");

/** Registers a field with the `EForm` around it, if there is one. A field outside a form does nothing. */
export function useFormField(entry: FormFieldEntry): void {
  const form = inject(FORM_KEY, null);
  if (!form) return;
  const off = form.register(entry);
  onBeforeUnmount(off);
}
