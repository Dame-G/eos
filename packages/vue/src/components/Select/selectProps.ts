import type { EOptionInput } from "./options.js";

export interface ESelectFields<V extends string, Multi extends boolean> {
  /** Strings, or `{ value, label, description?, icon?, group?, disabled? }`. A string is both value and label. `value` is never an empty string. A new `group` heading starts where `group` changes, so options of one group belong together. */
  options: readonly EOptionInput<V>[];
  /** What the button says while nothing is chosen. @default "Select" */
  placeholder?: string;
  /** Lets people choose several options. `v-model` is then an array, the list stays open while choosing, the button says how many are chosen and `name` submits one hidden input per value. */
  multiple?: Multi;
  /** Shows a clear button while something is chosen. */
  clearable?: boolean;
  /** Shows a spinner in place of the arrow and sets `aria-busy`, while options load. The list stays usable. */
  loading?: boolean;
  /** Submits the chosen value with a form (a hidden input carries it). Posts nothing while disabled. */
  name?: string;
}
