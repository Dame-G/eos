// @internal
import { watch } from "vue";
import { useMessages } from "../config.js";
import { useAnnouncer } from "./useAnnouncer.js";

/**
 * What a button does while it is busy: says "Loading" once each time `busy` turns on, and gives a capture-phase click
 * handler that swallows the click while `blocked` (by default, while busy), so the consumer's `@click` never runs.
 * A busy button stays focusable, so a click still reaches it.
 */
export function useBusyButton(busy: () => boolean | undefined, blocked: () => boolean | undefined = busy) {
  const t = useMessages();
  const { announce } = useAnnouncer();
  watch(busy, (on) => on && announce(t("loading")));

  function block(event: Event) {
    if (!blocked()) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  return { block };
}
