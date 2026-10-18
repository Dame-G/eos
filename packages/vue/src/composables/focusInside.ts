/** A click on the padding or the symbol of a boxed input puts the cursor in the input. Buttons and links inside keep their own click. */
export function focusInside(e: MouseEvent): void {
  const target = e.target as Element;
  if (target.closest("button, a")) return;
  const el = (e.currentTarget as Element).querySelector("input");
  if (el && target !== el && !el.disabled) el.focus();
}
