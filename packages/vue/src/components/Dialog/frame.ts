/** The props `EDialog` and `EDrawer` share. Both pass them to the frame they are built on, `DialogFrame`. */
export interface DialogFrameProps {
  /** The heading and the accessible name: the question or task of a dialog, the thing a drawer shows. A dialog's reads best as a question. */
  title: string;
  /** A sentence under the title that says what it is for. It is shown, and read out as the description. */
  description?: string;
  /** `alertdialog` for a confirmation that needs an answer, such as a delete. Everything else uses `dialog`. */
  role?: "dialog" | "alertdialog";
  /** The level of the title's heading element, 1 to 6. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  /** A CSS selector for the element that takes focus when it opens, such as `#name`. Without it, an element marked `data-autofocus` does; an `alertdialog` falls back to its least destructive action and anything else to its first control. */
  initialFocus?: string;
  /** Closes it when the backdrop is pressed as well. A form should leave it off, since a stray press would discard the work. A press on a toast does not count. */
  dismissible?: boolean;
  /** Shows it in the page, without the backdrop or the focus trap, for a preview. Escape and presses outside leave it open. */
  inline?: boolean;
  /** How the foot's buttons sit: `stack` puts them one under another, full width, when the panel is under 32rem wide (the default, for a phone), `row` keeps them side by side at the end edge at every width, for a short pair such as Cancel and Save. */
  footer?: "stack" | "row";
}
