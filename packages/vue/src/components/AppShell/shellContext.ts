import type { ComputedRef, InjectionKey, Ref } from "vue";

/** What `EAppShell` tells the `EAppHeader` inside it, so the header can show the menu button while the sidebar is a drawer. */
export interface ShellContext {
  /** True while the sidebar is in a drawer instead of beside the page. */
  drawer: ComputedRef<boolean>;
  /** True when the sidebar goes into a drawer on a phone: the header draws its menu button from the first render and CSS shows it below 48rem, so nothing moves when the page hydrates. */
  toggleable: ComputedRef<boolean>;
  /** The `id` of the drawer, for the menu button's `aria-controls`. */
  drawerId: string;
  open: Ref<boolean>;
  toggle(): void;
}

export const shellKey: InjectionKey<ShellContext> = Symbol("e-shell");
