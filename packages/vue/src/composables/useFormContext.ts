// @internal: shared by the components, not exported from the package (see scripts/gen-index.mjs).
import { inject, onBeforeUnmount, type InjectionKey } from "vue";

/** What a field tells the enclosing `EForm` so the error summary can list it. Getters, so the form always reads the current value. */
export interface FormFieldEntry {
  /** The id of the control, which the summary links to. */
  id: () => string;
  /** The visible label. */
  label: () => string;
  /** The `error` prop, when set. */
  error: () => string | undefined;
  /**
   * A check of the control's own, for one the browser cannot check: a Select posts through hidden inputs, which the
   * browser never validates. Returns what is wrong (such as the browser's message for an empty required field), or nothing.
   */
  check?: () => string | undefined;
}

export interface FormContext {
  register(entry: FormFieldEntry): () => void;
}

export const FORM_KEY: InjectionKey<FormContext> = Symbol("eos-form");

/**
 * Registers a field with the `EForm` around it, if there is one. A field outside a form does nothing. Every control that
 * takes an `error` registers, so the summary lists it. When two entries share an id (a Select and its EField), the first
 * that finds a problem is listed.
 */
export function useFormField(entry: FormFieldEntry): void {
  const form = inject(FORM_KEY, null);
  if (!form) return;
  const off = form.register(entry);
  onBeforeUnmount(off);
}
