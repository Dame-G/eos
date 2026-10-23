import { onBeforeUnmount, onMounted, ref, toValue, type MaybeRefOrGetter, type Ref } from "vue";

/**
 * Whether an element scrolls: its content is wider or taller than it is. A scrolling region is a tab stop and a named
 * landmark only while it scrolls, because a tab stop that scrolls nothing is noise. `false` until mounted, so the server
 * and the first client render agree. Pass the elements whose size can change it (the scroller itself is always watched).
 */
export function useOverflow(
  scroller: Ref<HTMLElement | null>,
  watch: MaybeRefOrGetter<HTMLElement | null>[] = [],
): Ref<boolean> {
  const overflows = ref(false);
  let observer: ResizeObserver | undefined;

  function measure() {
    const el = scroller.value;
    overflows.value = !!el && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1);
  }

  onMounted(() => {
    measure();
    if (typeof ResizeObserver === "undefined") return;
    observer = new ResizeObserver(measure);
    for (const el of [scroller.value, ...watch.map((w) => toValue(w))]) if (el) observer.observe(el);
  });
  onBeforeUnmount(() => observer?.disconnect());

  return overflows;
}
