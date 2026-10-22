export interface AnnounceOptions {
  /** Interrupt what the screen reader is saying. Use it for errors; leave it off for confirmations. */
  assertive?: boolean;
}

const NBSP = String.fromCharCode(160);

type Politeness = "polite" | "assertive";

const regions: Partial<Record<Politeness, HTMLElement>> = {};
const clearTimers: Partial<Record<Politeness, ReturnType<typeof setTimeout>>> = {};

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
    Object.assign(el.style, {
      position: "absolute",
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
 */
export function useAnnouncer(): { announce(message: string, options?: AnnounceOptions): void } {
  return {
    announce(message, options = {}) {
      const kind: Politeness = options.assertive ? "assertive" : "polite";
      const el = region(kind);
      if (!el || !message) return;
      clearTimeout(clearTimers[kind]);
      // The same words twice in a row would not be spoken again, so the repeat gets a trailing no-break space.
      const repeat = el.textContent === message;
      el.textContent = "";
      // A change a moment after the region is in the page is what assistive technology reliably picks up.
      setTimeout(() => {
        el.textContent = repeat ? `${message}${NBSP}` : message;
        clearTimers[kind] = setTimeout(() => (el.textContent = ""), 8000);
      }, 50);
    },
  };
}
