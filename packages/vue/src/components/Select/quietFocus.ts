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

  function intent() {
    byPerson = true;
  }

  function personOpened(): boolean {
    const was = byPerson;
    byPerson = false;
    return was;
  }

  function returnsFocus(): boolean {
    byPerson = false;
    return hadFocus;
  }

  watch(
    open,
    (isOpen) => {
      if (!isOpen) hadFocus = !!document.activeElement && inside(document.activeElement);
    },
    { flush: "sync" },
  );

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
