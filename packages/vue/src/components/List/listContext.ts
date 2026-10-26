import type { ComputedRef, InjectionKey } from "vue";

/** What names a row: the `value` of an `EListRow`, and the list's `v-model`. */
export type ListKey = string | number;

/** What an `EVirtualList` inside an `EList` lends it, so the arrow keys, Home and End reach rows not in the page yet. */
export interface ListWindow {
  /** How many rows there are in all. */
  count(): number;
  /** Scrolls row `index` into view, so it is rendered. */
  scrollToIndex(index: number): void;
}

/** What `EList` tells the rows inside it. @internal */
export interface ListContext {
  /** `current`: buttons or links, one marked `aria-current`. `select`: a listbox of options, one `aria-selected`. */
  mode: ComputedRef<"current" | "select">;
  /** Whether a row is the current or selected one. */
  isChosen(key: ListKey): boolean;
  /** Whether a row is the list's one tab stop. */
  isStop(key: ListKey): boolean;
  register(key: ListKey): void;
  unregister(key: ListKey): void;
  /** A row was pressed: it becomes the current or selected one. */
  choose(key: ListKey): void;
  /** A row took focus. */
  focused(key: ListKey): void;
  /** Set by an `EVirtualList` inside the list. */
  attachWindow(window: ListWindow | null): void;
}

export const listKey: InjectionKey<ListContext> = Symbol("e-list");
