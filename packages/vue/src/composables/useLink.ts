// @internal: shared by the components, not exported from the package (see scripts/gen-index.mjs).
import type { Component } from "vue";

/** Where a link goes: an address, or a router location for a `linkComponent` such as `RouterLink`. */
export interface LinkFields {
  href?: string;
  to?: unknown;
}

/** Whether the item goes anywhere, so it renders as a link and not as plain text. */
export const hasLinkTarget = (item: LinkFields): boolean => item.to !== undefined || item.href !== undefined;

/**
 * The attribute every link of the library gets, from an item's `href` and `to`. A link component (`RouterLink`) gets
 * `to` when the item has one, and `href` otherwise. A plain `a` gets `href`, or a `to` that is a string, so `to: "/pay"`
 * still works without a router. Never both, so a router link never sees an `href` it would render over its own.
 */
export function linkTarget(item: LinkFields, linkComponent: string | Component = "a"): { href?: string; to?: unknown } {
  if (item.to !== undefined && linkComponent !== "a") return { to: item.to };
  if (item.href !== undefined) return { href: item.href };
  if (typeof item.to === "string") return { href: item.to };
  return {};
}
