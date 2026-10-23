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
  const input = (describedby?: DescribedBy | readonly DescribedBy[]): Record<string, unknown> => {
    const rest = { ...attrs };
    delete rest.class;
    delete rest.style;
    const ids = Array.isArray(describedby) ? describedby : [describedby];
    const joined = [...ids, rest["aria-describedby"]].filter(Boolean).join(" ");
    if (joined) rest["aria-describedby"] = joined;
    return rest;
  };
  return {
    wrapper: () => ({ class: attrs.class, style: attrs.style }),
    input,
    /**
     * `input(ids)` for an element that holds several inputs (the boxes of a code, two dates, a row of radios). Focus and
     * blur do not bubble, so the consumer's `@focus` and `@blur` are moved to `focusin` and `focusout`, and fire only when
     * focus enters or leaves the whole group, not as it moves between its inputs.
     */
    group: (describedby?: DescribedBy | readonly DescribedBy[]): Record<string, unknown> => {
      const rest = input(describedby);
      const { onFocus, onBlur } = rest;
      delete rest.onFocus;
      delete rest.onBlur;
      const crosses = (e: FocusEvent) => {
        const other = e.relatedTarget as Node | null;
        return !other || !(e.currentTarget as Element).contains(other);
      };
      const route = (key: "onFocusin" | "onFocusout", given: unknown) => {
        if (!given) return;
        const run = (e: FocusEvent) => {
          if (crosses(e)) for (const fn of [given].flat()) if (typeof fn === "function") fn(e);
        };
        rest[key] = [rest[key], run].flat().filter(Boolean);
      };
      route("onFocusin", onFocus);
      route("onFocusout", onBlur);
      return rest;
    },
    /** The `form` attribute the consumer gave, so a hidden input can join a form it is not inside. */
    form: (): string | undefined => (attrs.form as string | undefined) || undefined,
  };
}
