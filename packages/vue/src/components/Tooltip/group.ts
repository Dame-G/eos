import { inject, ref, type InjectionKey, type Ref } from "vue";

/**
 * What the tooltips of one app share, so moving from one control to the next shows the next tooltip at once instead of
 * waiting out the delay again. `createEos().install` provides one for the app. Without the plugin the tooltips share
 * the one in the browser page.
 */
export interface TooltipGroup {
  /** True from the moment a tooltip closes until the skip delay has passed. */
  readonly skipping: Ref<boolean>;
  /** A tooltip opened. */
  opened(): void;
  /** A tooltip closed. */
  closed(): void;
}

export const TOOLTIP_KEY: InjectionKey<TooltipGroup> = Symbol("eos.tooltips");

/** Milliseconds after one tooltip closes during which the next opens without a delay. */
const TOOLTIP_SKIP_DELAY = 300;

export function createTooltipGroup(skipDelay = TOOLTIP_SKIP_DELAY): TooltipGroup {
  const skipping = ref(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  return {
    skipping,
    opened() {
      clearTimeout(timer);
    },
    closed() {
      skipping.value = true;
      clearTimeout(timer);
      timer = setTimeout(() => (skipping.value = false), skipDelay);
    },
  };
}

let shared: TooltipGroup | undefined;

/** The app's group, else the one shared by the page. On the server nothing opens, so each call gets its own. */
export function useTooltipGroup(): TooltipGroup {
  const provided = inject(TOOLTIP_KEY, null);
  if (provided) return provided;
  if (typeof window === "undefined") return createTooltipGroup();
  return (shared ??= createTooltipGroup());
}
