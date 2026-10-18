import { watch, type Ref } from "vue";

/**
 * Keeps a popup from moving focus when it is opened or closed from outside (`v-model:open`, or open from the first
 * render). A person's pointer or key on the trigger (`intent`) keeps the component's own focus management.
 * `inside` says whether an element is part of the popup's content.
 */
export function useQuietFocus(open: Ref<boolean>, inside: (el: Element) => boolean) {
  let byPerson = false;
  let hadFocus = false;
  let stop: (() => void) | undefined;

  /** Call on a pointer or key press on the trigger. */
  function intent() {
    byPerson = true;
  }

  /** True once for an open that a person started. Call from the popup's own focus handler. */
  function personOpened(): boolean {
    const was = byPerson;
    byPerson = false;
    return was;
  }

  /** Call from the popup's close focus handler: true when focus should go back to the trigger. */
  function returnsFocus(): boolean {
    byPerson = false;
    return hadFocus;
  }

  // Remember, as the popup closes, whether focus was inside it: that is a person using it.
  watch(
    open,
    (isOpen) => {
      if (!isOpen) hadFocus = !!document.activeElement && inside(document.activeElement);
    },
    { flush: "sync" },
  );

  /**
   * For popups whose library moves focus into the content by itself: while the popup settles, put focus back
   * where it was if it lands inside the content.
   */
  function undoFocusSteal() {
    stop?.();
    const prior = document.activeElement as HTMLElement | null;
    const onFocusIn = (e: FocusEvent) => {
      const target = e.target as Element | null;
      if (!target || !inside(target)) return;
      if (prior && prior !== document.body && prior.isConnected) prior.focus({ preventScroll: true });
      else (target as HTMLElement).blur();
    };
    document.addEventListener("focusin", onFocusIn, true);
    const timer = setTimeout(() => stop?.(), 400);
    stop = () => {
      document.removeEventListener("focusin", onFocusIn, true);
      clearTimeout(timer);
      stop = undefined;
    };
  }

  return { intent, personOpened, returnsFocus, undoFocusSteal };
}
