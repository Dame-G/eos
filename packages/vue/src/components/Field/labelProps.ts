/** The label API shared by ESelect, ECombobox, EAutocomplete and EMultiSelect: a `label`, or `bare` with an accessible name. */
export type ELabelProps = {
  /** Keep the label for screen readers and remove it from the page. */
  hideLabel?: boolean;
  /** The accessible name when `bare`. */
  ariaLabel?: string;
} & (
  | {
      /** The visible label, a mono kicker above the control. It also names the list. Required unless `bare`. */
      label: string;
      /** Only the control, no label, hint or error. Give it `label` or `ariaLabel`. For dense places such as table filters. */
      bare?: boolean;
    }
  | {
      label?: string;
      bare: true;
    }
);
