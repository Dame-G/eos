import { normalizeOptions, type EOption, type EOptionInput } from "../Select/options.js";

/** One choice in a `ERadioGroup`. */
export type RadioOption = Pick<EOption, "value" | "label" | "description" | "disabled">;

/** One choice in an `ESegmented`. */
export type SegmentedOption = Pick<EOption, "value" | "label" | "icon" | "disabled">;

/** The choices of `ERadioGroup` and `ESegmented`: the same normalizer as `ESelect`, so a string is both value and label. */
type ChoiceInput<T extends Partial<EOption> = EOption> = string | T;

/** Turns strings into `{ value, label }` objects and leaves objects as they are. */
export function normalizeChoices<T extends Partial<EOption>>(options: readonly ChoiceInput<T>[] | undefined): T[] {
  return normalizeOptions(options as readonly EOptionInput[] | undefined) as unknown as T[];
}
