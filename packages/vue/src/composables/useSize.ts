/** The size scale. A component that takes `size` accepts part of it, written `Extract<Size, "sm" | "md">`. */
export type Size = "sm" | "md" | "lg" | "xl";

/** The tones for status and emphasis. A component that takes `tone` accepts part of them, written `Extract<Tone, ...>`. */
export type Tone = "neutral" | "info" | "success" | "warning" | "danger";

/** What a polymorphic `as` prop takes: the name of an HTML element, such as `section`, `ul` or `article`. */
export type ElementTag = keyof HTMLElementTagNameMap;
