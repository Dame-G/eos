// @internal: shared by the components, not exported from the package (see scripts/gen-index.mjs).
import { onMounted, ref, type Ref } from "vue";

/** One answer for the page, so a page of selects and dialogs reads the root's style once instead of once each. */
let shared: Ref<boolean> | undefined;
let measured = false;

/** Reads the answer again: a modal calls it as it opens, in case the page's styles changed since. */
export function measureScrollBody(): void {
  if (typeof document === "undefined" || !shared) return;
  measured = true;
  shared.value = !getComputedStyle(document.documentElement).scrollbarGutter.startsWith("stable");
}

/**
 * Whether Reka should pad the body while a modal locks scrolling. Pass it to Reka's `ConfigProvider` as `scroll-body`.
 * Reka pads the body by the scrollbar's width so the page does not move when the scrollbar goes. A page that already
 * keeps that space (`scrollbar-gutter: stable` on the root) would then hold it twice and shift sideways, so there the
 * answer is no. Read once for the page, when the first component that asks is mounted, so the server and the first
 * render agree. On the server every call gets its own answer, so no state is shared between requests.
 */
export function useScrollBody(): Ref<boolean> {
  if (typeof document === "undefined") return ref(true);
  const pad = (shared ??= ref(true));
  if (!measured) onMounted(() => measured || measureScrollBody());
  return pad;
}
