import { inject, shallowRef, type InjectionKey, type VNodeChild } from "vue";

export type ToastTone = "info" | "success" | "warning" | "danger";

export interface ToastOptions {
  /** What happened, in a few words. */
  title: string;
  /** One sentence of detail under the title. */
  message?: string;
  /** `info` by default. `danger` is announced at once and stays until dismissed. */
  tone?: ToastTone;
  /** A Button, as a vnode or a function that returns one. A toast with an action stays until dismissed. */
  action?: VNodeChild | (() => VNodeChild);
  /** Milliseconds before it goes. 5000 for success and info; `0` for none, which is the default for danger and for a toast with an action. */
  duration?: number;
}

export interface ToastItem extends Omit<ToastOptions, "tone" | "duration"> {
  id: string;
  tone: ToastTone;
  /** Milliseconds; 0 stays until dismissed. */
  duration: number;
}

/** What `useToast()` gives a component. */
export interface ToastApi {
  /** Shows a toast and returns its id. */
  show(options: ToastOptions): string;
  /** Removes one toast. */
  dismiss(id: string): void;
  /** Removes every toast. */
  clear(): void;
}

/** The store behind the API: the list the region renders, and the timers. */
export interface ToastStore extends ToastApi {
  /** The toasts on screen, oldest first. */
  readonly items: readonly ToastItem[];
  /** Stops every timer, keeping the time each toast has left. Used while the pointer or focus is on a toast. */
  pause(): void;
  /** Starts the timers again with the time that was left. */
  resume(): void;
}

export const TOAST_KEY: InjectionKey<ToastStore> = Symbol("eos.toasts");

const DEFAULT_DURATION = 5000;

/**
 * Creates a toast store. `EToastProvider` makes one when none is provided. An app that wants `useToast()` in code outside
 * the component tree (a router guard, a store) makes one itself and provides it: `app.provide(TOAST_KEY, createToasts())`.
 * Either way the toasts are shown by an `EToastProvider`, once, near the root of the app.
 */
export function createToasts(): ToastStore {
  const list = shallowRef<ToastItem[]>([]);
  const timers = new Map<
    string,
    { remaining: number; started: number; handle: ReturnType<typeof setTimeout> | null }
  >();
  let counter = 0;
  let paused = false;

  function arm(id: string) {
    const timer = timers.get(id);
    if (!timer || paused || timer.handle !== null) return;
    timer.started = Date.now();
    timer.handle = setTimeout(() => dismiss(id), timer.remaining);
  }

  function dismiss(id: string) {
    const timer = timers.get(id);
    if (timer?.handle != null) clearTimeout(timer.handle);
    timers.delete(id);
    list.value = list.value.filter((item) => item.id !== id);
  }

  return {
    get items() {
      return list.value;
    },
    show(options) {
      const id = `toast-${++counter}`;
      const tone = options.tone ?? "info";
      const duration = options.duration ?? (options.action || tone === "danger" ? 0 : DEFAULT_DURATION);
      list.value = [...list.value, { ...options, id, tone, duration }];
      if (duration > 0) {
        timers.set(id, { remaining: duration, started: 0, handle: null });
        arm(id);
      }
      return id;
    },
    dismiss,
    clear() {
      for (const timer of timers.values()) if (timer.handle != null) clearTimeout(timer.handle);
      timers.clear();
      list.value = [];
    },
    pause() {
      paused = true;
      for (const timer of timers.values()) {
        if (timer.handle === null) continue;
        clearTimeout(timer.handle);
        timer.handle = null;
        timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.started));
      }
    },
    resume() {
      paused = false;
      for (const id of timers.keys()) arm(id);
    },
  };
}

/**
 * Show toasts from anywhere inside an `EToastProvider` (or an app that provided `TOAST_KEY`):
 * `const toast = useToast(); toast.show({ title: "Saved", tone: "success" })`.
 */
export function useToast(): ToastApi {
  const store = inject(TOAST_KEY, null);
  if (!store) throw new Error("useToast must be used inside an EToastProvider");
  return { show: store.show, dismiss: store.dismiss, clear: store.clear };
}
