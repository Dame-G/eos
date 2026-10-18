import type { IconProp } from "../../icons/types.js";

/** One choice in a Select, Combobox, Autocomplete or MultiSelect. */
export interface EOption {
  /** What the model holds when this option is chosen. Never an empty string. */
  value: string;
  /** What people read. */
  label: string;
  /** A second, muted line under the label. Searched too. */
  description?: string;
  /** An icon before the label. */
  icon?: IconProp;
  /** A heading for a run of options. A new heading starts when this changes from the option before. */
  group?: string;
  /** Not choosable. Stays visible, muted. */
  disabled?: boolean;
}

/** An option as a consumer writes it: a bare string stands for `{ value: s, label: s }`. */
export type EOptionInput = string | EOption;

/** A run of options under one heading (or none). */
export interface EOptionSection {
  group: string | undefined;
  options: EOption[];
}

/** Turns strings into options. */
export function normalizeOptions(options: readonly EOptionInput[] | undefined): EOption[] {
  return (options ?? []).map((o) => (typeof o === "string" ? { value: o, label: o } : o));
}

/** Splits options into runs under one heading, in order. A heading repeats only where the group changes. */
export function sectionOptions(options: readonly EOption[]): EOptionSection[] {
  const sections: EOptionSection[] = [];
  for (const option of options) {
    const last = sections[sections.length - 1];
    if (last && last.group === option.group) last.options.push(option);
    else sections.push({ group: option.group, options: [option] });
  }
  return sections;
}
