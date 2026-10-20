import type { EOption, EOptionInput } from "../Select/options.js";
import type { ELabelProps } from "../Field/labelProps.js";

/** What ECombobox takes besides its `v-model`. */
export type EComboboxProps = ELabelProps & EComboboxFields;

export interface EComboboxFields {
  /** Choose several: `v-model` is a `string[]`, shown as removable tags. The list stays open while choosing, `placeholder` shows only while nothing is chosen, and `name` submits one hidden input per value. */
  multiple?: boolean;
  /** Accept any typed text, not only an option: `v-model` is the text and options are suggestions, and choosing one puts its `label` in the field. No Show options button, and the list stays closed when nothing matches. Ignored with `multiple`. */
  freeform?: boolean;
  /** Strings, or `{ value, label, description, icon, group, disabled }` as in `ESelect`. A value is never an empty string. */
  options: readonly EOptionInput[];
  /** An example, never the label. */
  placeholder?: string;
  /** Help that stays under the field. */
  hint?: string;
  /** What to fix. Replaces the hint, marks the input `aria-invalid` and is announced. */
  error?: string;
  /** The `required` attribute and a word beside the label. A chosen value satisfies it. */
  required?: boolean;
  /** A word beside the label. Flag whichever is rarer. */
  optional?: boolean;
  /** Disables the field; a disabled field never opens. */
  disabled?: boolean;
  /** Submits the value with a form, through a hidden input (hidden inputs carry it, one per chosen value). */
  name?: string;
  /** Show the Searching spinner in the list instead of the options, while a server answers. */
  loading?: boolean;
  /** What the list says when nothing matches. @default "No matches" */
  emptyText?: string;
  /** The clear button, shown when there is something to clear. On by default. */
  clearable?: boolean;
  /** Replaces the default match (the typed text appears in the label or description). `query` is trimmed and lower case. Return `true` when the server filters. @default label or description contains query */
  filter?: (option: EOption, query: string) => boolean;
  /** The id of the input; the label points at it. @default generated */
  id?: string;
}
