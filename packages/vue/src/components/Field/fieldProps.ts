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
  /** Disables the control. */
  disabled?: boolean;
  /** The id of the control. The label points at it. @default generated */
  id?: string;
}
