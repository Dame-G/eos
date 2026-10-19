import type { EOption, EOptionInput } from "../Select/options.js";
import type { ELabelProps } from "../Field/labelProps.js";

/** What ECombobox, EAutocomplete and EMultiSelect take besides their `v-model`. */
export type EComboboxProps = ELabelProps & EComboboxFields;

export interface EComboboxFields {
  /** Strings, or `{ value, label, description, icon, group, disabled }`. A value is never an empty string. */
  options: readonly EOptionInput[];
  /** An example, never the label. */
  placeholder?: string;
  /** Help that stays under the field. */
  hint?: string;
  /** What to fix. Replaces the hint, marks the input invalid and is announced. */
  error?: string;
  /** A word beside the label. A chosen value satisfies it. */
  required?: boolean;
  /** A word beside the label. Flag whichever is rarer. */
  optional?: boolean;
  disabled?: boolean;
  /** Submits the value with a form (hidden inputs carry it, one per chosen value). */
  name?: string;
  /** Show the Searching spinner in the list instead of the options, while a server answers. */
  loading?: boolean;
  /** What the list says when nothing matches. Default "No matches". */
  emptyText?: string;
  /** The clear button, shown when there is something to clear. On by default. */
  clearable?: boolean;
  /** Replaces the default match (the typed text appears in the label or description). `query` is trimmed and lower case. */
  filter?: (option: EOption, query: string) => boolean;
  /** The id of the input; the label points at it. Generated when left out. */
  id?: string;
}
