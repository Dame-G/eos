/** The control heights a text-like field comes in. `md` is the default and the height of a Button. */
export type EFieldSize = "sm" | "md" | "lg";

/** The label, hint, error and state props that every `*Field` built on `EField` shares. The field adds its own `label` (and its default). */
export interface EFieldCommonProps {
  /** Hides the label from the page and keeps it for screen readers. */
  hideLabel?: boolean;
  /** Help that stays under the control. */
  hint?: string;
  /** What to fix. Replaces the hint, marks the control invalid and is announced. */
  error?: string;
  /** Sets the `required` attribute and shows "Required" beside the label. */
  required?: boolean;
  /** Shows "Optional" beside the label. Only the rarer of required and optional needs a flag. */
  optional?: boolean;
  /** Disables the control. A disabled control posts nothing. */
  disabled?: boolean;
  /** Shows the value but blocks editing. The control stays focusable and selectable, and still posts its value. */
  readonly?: boolean;
  /** The id of the control. The label points at it. @default generated */
  id?: string;
}

/** The box props of a text-like field: its height and the busy state. */
export interface EFieldBoxProps {
  /** The height of the box: `sm` and `lg` are a step under and over the control height. @default "md" */
  size?: EFieldSize;
  /** Shows a spinner at the end of the box and sets `aria-busy`, while options or a check load. The field stays editable. */
  loading?: boolean;
}

/** The `data-size` attribute for a size: `md` is the default and writes none. */
export const sizeAttr = (size: EFieldSize | undefined): "sm" | "lg" | undefined =>
  size && size !== "md" ? size : undefined;
