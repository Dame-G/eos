import type { InjectionKey } from "vue";

/** Provided by `EItemList` so an `EItemRow` knows it already has a list around it. Internal. */
export const ITEM_LIST_KEY: InjectionKey<boolean> = Symbol("eos.itemList");
