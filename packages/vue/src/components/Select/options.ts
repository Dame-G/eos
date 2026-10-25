import type { IconProp } from "../../icons/types.js";

/** One choice in a Select or Combobox. */
export interface EOption<T extends string = string> {
  /** What the model holds when this option is chosen. Never an empty string. */
  value: T;
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
export type EOptionInput<T extends string = string> = T | EOption<T>;

/** A run of options under one heading (or none). */
export interface EOptionSection<T extends string = string> {
  group: string | undefined;
  options: EOption<T>[];
}

/**
 * Whether a boolean prop typed by a type parameter (`multiple?: M`) is on. Vue casts only props it knows are boolean,
 * so the bare attribute (`<ESelect multiple>`) arrives as "".
 */
export const isOn = (value: unknown): boolean => value === "" || !!value;

/** Turns strings into options. */
export function normalizeOptions<T extends string = string>(
  options: readonly EOptionInput<T>[] | undefined,
): EOption<T>[] {
  return (options ?? []).map((o): EOption<T> => (typeof o === "string" ? { value: o, label: o } : o));
}

/** Splits options into runs under one heading, in order. A heading repeats only where the group changes. */
export function sectionOptions<T extends string = string>(options: readonly EOption<T>[]): EOptionSection<T>[] {
  const sections: EOptionSection<T>[] = [];
  for (const option of options) {
    const last = sections[sections.length - 1];
    if (last && last.group === option.group) last.options.push(option);
    else sections.push({ group: option.group, options: [option] });
  }
  return sections;
}
