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
   * browser never validates. Returns what is wrong (such as the browser's message for an empty required field), or
   * nothing. Read it from reactive state, not the DOM, so the summary follows it.
   */
  check?: () => string | undefined;
}

/** @internal What EForm provides to its fields. */
export interface FormContext {
  register(entry: FormFieldEntry): () => void;
  /** Announces a field's error that appeared after the page loaded, unless the form's summary speaks for it. */
  announce?(message: string): void;
}

/** @internal */
export const FORM_KEY: InjectionKey<FormContext> = Symbol("eos-form");

/**
 * Joins a control to the `EForm` around it, so its error summary lists the control: call
 * `useFormField({ id, label, error, check })` in setup. A control outside a form does nothing. Every library control that
 * takes an `error` registers. When two entries share an id (a Select and its EField), the first that finds a problem is listed.
 */
export function useFormField(entry: FormFieldEntry): void {
  const form = inject(FORM_KEY, null);
  if (!form) return;
  const off = form.register(entry);
  onBeforeUnmount(off);
}
