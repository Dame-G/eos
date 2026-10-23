import type { ComputedRef, InjectionKey, Ref } from "vue";

/** What `EAppShell` tells the `EAppHeader` inside it, so the header can show the menu button while the sidebar is a drawer. */
export interface ShellContext {
  /** True while the sidebar is in a drawer instead of beside the page. */
  drawer: ComputedRef<boolean>;
  open: Ref<boolean>;
  toggle(): void;
}

export const shellKey: InjectionKey<ShellContext> = Symbol("e-shell");
