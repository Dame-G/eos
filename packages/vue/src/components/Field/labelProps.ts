/** The label API shared by ESelect, ECombobox: a `label`, or `bare` with an accessible name. */
export type ELabelProps = {
  /** Hides the label from the page and keeps it for screen readers. */
  hideLabel?: boolean;
  /** The accessible name when `bare`. */
  ariaLabel?: string;
} & (
  | {
      /** The visible label above the control. It also names the list. Required unless `bare` with an `ariaLabel`. */
      label: string;
      /** Renders only the control, with no label, hint or error. Needs `label` or `ariaLabel`. For dense places such as table filters. */
      bare?: boolean;
    }
  | {
      label?: string;
      bare: true;
    }
);
