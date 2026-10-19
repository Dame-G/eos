import { useAttrs } from "vue";

/**
 * Splits a form control's fallthrough attributes. `class` and `style` stay on the wrapper; everything else
 * (name, autocomplete, maxlength, aria-*, data-*, listeners such as onBlur and onKeydown) goes to the real input.
 * Use it with `defineOptions({ inheritAttrs: false })`.
 */
export function useFieldAttrs() {
  const attrs = useAttrs();
  return {
    wrapper: () => ({ class: attrs.class, style: attrs.style }),
    input: (describedby?: string | undefined): Record<string, unknown> => {
      const rest = { ...attrs };
      delete rest.class;
      delete rest.style;
      const joined = [describedby, rest["aria-describedby"]].filter(Boolean).join(" ");
      if (joined) rest["aria-describedby"] = joined;
      return rest;
    },
  };
}
