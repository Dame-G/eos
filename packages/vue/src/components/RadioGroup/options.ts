import { normalizeOptions, type EOption, type EOptionInput } from "../Select/options.js";

/** One choice in a `ERadioGroup`. */
export type RadioOption<T extends string = string> = Pick<EOption, "label" | "description" | "disabled"> & {
  value: T;
};

/** One choice in an `ESegmented`. */
export type SegmentedOption<T extends string = string> = Pick<EOption, "label" | "icon" | "disabled"> & {
  value: T;
};

/** The choices of `ERadioGroup` and `ESegmented`: the same normalizer as `ESelect`, so a string is both value and label. */
type ChoiceInput<T extends Partial<EOption> = EOption> = string | T;

/** Turns strings into `{ value, label }` objects and leaves objects as they are. */
export function normalizeChoices<T extends Partial<EOption>>(options: readonly ChoiceInput<T>[] | undefined): T[] {
  return normalizeOptions(options as readonly EOptionInput[] | undefined) as unknown as T[];
}
