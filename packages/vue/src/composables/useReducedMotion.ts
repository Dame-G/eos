/**
 * Whether the person asked for less motion (`prefers-reduced-motion: reduce`). Returns a function to call when the
 * motion starts, so it follows a change of the setting. On the server it says no.
 *
 * ```ts
 * const calm = useReducedMotion();
 * el.scrollBy({ left, behavior: calm() ? "auto" : "smooth" });
 * ```
 */
export function useReducedMotion(): () => boolean {
  return () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}
