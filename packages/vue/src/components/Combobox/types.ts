import type { EOption, EOptionInput } from "../Select/options.js";
import type { ELabelProps } from "../Field/labelProps.js";
import type { EFieldBoxProps, EFieldCommonProps } from "../Field/fieldProps.js";

/** What ECombobox takes besides its `v-model`. */
export type EComboboxProps<M extends boolean = boolean> = ELabelProps &
  Omit<EFieldCommonProps, "hideLabel"> &
  Pick<EFieldBoxProps, "size"> &
  EComboboxFields<M>;

/** @public Exported so the generated declarations can name it. */
export interface EComboboxFields<M extends boolean = boolean> {
  /** Lets people choose several options. `v-model` is a `string[]` shown as removable tags, the list stays open while choosing, `placeholder` shows only while nothing is chosen, and `name` submits one hidden input per value. */
  multiple?: M;
  /** Accepts any typed text, not only an option. `v-model` is the text, options are suggestions and choosing one puts its `label` in the field. There is no Show options button, and the list stays closed when nothing matches. `multiple` ignores it. */
  freeform?: boolean;
  /** Strings, or `{ value, label, description, icon, group, disabled }` as in `ESelect`. A value is never an empty string. */
  options: readonly EOptionInput[];
  /** An example, never the label. */
  placeholder?: string;
  /** Submits the value with a form, through a hidden input. */
  name?: string;
  /** Shows the Searching spinner in the list in place of the options while a server answers. */
  loading?: boolean;
  /** What the list says when nothing matches. @default "No matches" */
  emptyText?: string;
  /** Shows a clear button while there is something to clear. */
  clearable?: boolean;
  /** Replaces the default match, which ignores case and accents. `query` is trimmed, lower case and without accents. Return `true` when the server filters. @default label or description contains query */
  filter?: (option: EOption, query: string) => boolean;
}
