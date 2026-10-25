const cache = new Map<string, string>();

/**
 * The browser's own message for an empty required control of this kind ("Please select an item in the list."), in the
 * browser's language, so a control that checks itself reads like the native ones beside it. `fallback` when the browser
 * gives none (on the server).
 */
export function missingMessage(kind: "select" | "text" | "radio", fallback: string): string {
  if (typeof document === "undefined") return fallback;
  let message = cache.get(kind);
  if (message === undefined) {
    const el = document.createElement(kind === "select" ? "select" : "input");
    if (kind === "radio") el.setAttribute("type", "radio");
    el.required = true;
    message = el.validationMessage;
    cache.set(kind, message);
  }
  return message || fallback;
}
