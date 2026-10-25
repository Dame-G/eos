/** A click on the padding or the symbol of a boxed input puts the cursor in its text input. Buttons, links and other controls inside (a colour swatch) keep their own click. */
export function focusInside(e: MouseEvent): void {
  const target = e.target as Element;
  if (target.closest("button, a, input, select, textarea")) return;
  const el = (e.currentTarget as Element).querySelector<HTMLInputElement>('input:not([type="hidden"], [type="color"])');
  if (el && !el.disabled) el.focus();
}
