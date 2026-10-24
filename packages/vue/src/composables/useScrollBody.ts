// @internal: shared by the components, not exported from the package (see scripts/gen-index.mjs).
import { onMounted, ref, type Ref } from "vue";

/**
 * Whether Reka should pad the body while a modal locks scrolling. Pass it to Reka's `ConfigProvider` as `scroll-body`.
 * Reka pads the body by the scrollbar's width so the page does not move when the scrollbar goes. A page that already
 * keeps that space (`scrollbar-gutter: stable` on the root) would then hold it twice and shift sideways, so there the
 * answer is no. Read once mounted, so the server and the first render agree.
 */
export function useScrollBody(): Ref<boolean> {
  const pad = ref(true);
  onMounted(() => {
    pad.value = !getComputedStyle(document.documentElement).scrollbarGutter.startsWith("stable");
  });
  return pad;
}
