export interface AnnounceOptions {
  /** Interrupt what the screen reader is saying. Use it for errors; leave it off for confirmations. */
  assertive?: boolean;
}

const NBSP = String.fromCharCode(160);

type Politeness = "polite" | "assertive";

const regions: Partial<Record<Politeness, HTMLElement>> = {};
const clearTimers: Partial<Record<Politeness, ReturnType<typeof setTimeout>>> = {};
/** The message waiting to be written, one per politeness: a newer one replaces it, so a burst says only its last. */
const writeTimers: Partial<Record<Politeness, ReturnType<typeof setTimeout>>> = {};
const lastSaid: Partial<Record<Politeness, string>> = {};

function region(kind: Politeness): HTMLElement | null {
  if (typeof document === "undefined") return null;
  let el = regions[kind];
  if (!el || !el.isConnected) {
    el = document.createElement("div");
    el.setAttribute("data-e-announcer", kind);
    el.setAttribute("role", kind === "assertive" ? "alert" : "status");
    el.setAttribute("aria-live", kind);
    el.setAttribute("aria-atomic", "true");
    // Set through the style object, not an attribute, so a strict style-src policy does not block it.
    // Fixed, so it cannot add scrollable height below a page that is exactly one screen tall.
    Object.assign(el.style, {
      position: "fixed",
      insetBlockStart: "0",
      insetInlineStart: "0",
      width: "1px",
      height: "1px",
      overflow: "hidden",
      clipPath: "inset(50%)",
      whiteSpace: "nowrap",
    });
    document.body.append(el);
    regions[kind] = el;
  }
  return el;
}

/**
 * Says something to screen reader users without showing it: `useAnnouncer().announce("3 rows selected")`.
 * One hidden live region per politeness is shared by the whole page and created on first use. On the server it does nothing.
 * Announce the result of an action the user cannot otherwise see, not something that is already on screen in a live region.
 * A message is written a moment after the call; another of the same politeness in that moment replaces it, so a burst
 * (a count updated on each keystroke) says only its last.
 */
export function useAnnouncer(): { announce(message: string, options?: AnnounceOptions): void } {
  return {
    announce(message, options = {}) {
      const kind: Politeness = options.assertive ? "assertive" : "polite";
      const el = region(kind);
      if (!el || !message) return;
      clearTimeout(clearTimers[kind]);
      clearTimeout(writeTimers[kind]);
      el.textContent = "";
      // A change a moment after the region is in the page is what assistive technology reliably picks up.
      writeTimers[kind] = setTimeout(() => {
        // The same words twice in a row would not be spoken again, so a repeat gets a trailing no-break space.
        const text = lastSaid[kind] === message ? `${message}${NBSP}` : message;
        el.textContent = text;
        lastSaid[kind] = text;
        clearTimers[kind] = setTimeout(() => (el.textContent = ""), 8000);
      }, 50);
    },
  };
}
