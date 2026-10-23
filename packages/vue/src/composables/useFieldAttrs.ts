import { useAttrs } from "vue";

/** An id, or nothing: falsy entries are skipped so a call can list ids that may not exist. */
export type DescribedBy = string | false | null | undefined;

/**
 * Splits a form control's fallthrough attributes. `class` and `style` stay on the wrapper. Everything else
 * (name, autocomplete, maxlength, aria-*, data-*, listeners such as onBlur and onKeydown) goes to the real input.
 * Use it with `defineOptions({ inheritAttrs: false })`.
 *
 * `input(ids)` joins the ids (a string or a list, falsy entries skipped) in front of the consumer's own `aria-describedby`.
 */
export function useFieldAttrs() {
  const attrs = useAttrs();
  return {
    wrapper: () => ({ class: attrs.class, style: attrs.style }),
    input: (describedby?: DescribedBy | readonly DescribedBy[]): Record<string, unknown> => {
      const rest = { ...attrs };
      delete rest.class;
      delete rest.style;
      const ids = Array.isArray(describedby) ? describedby : [describedby];
      const joined = [...ids, rest["aria-describedby"]].filter(Boolean).join(" ");
      if (joined) rest["aria-describedby"] = joined;
      return rest;
    },
    /** The `form` attribute the consumer gave, so a hidden input can join a form it is not inside. */
    form: (): string | undefined => (attrs.form as string | undefined) || undefined,
  };
}
