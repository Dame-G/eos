import { onBeforeUnmount, onMounted, ref, toValue, type MaybeRefOrGetter, type Ref } from "vue";

export interface UseOverflowOptions {
  /** Also watches the scroller's children, as they come and go. A scroller held at its largest size by its container keeps that size while its content grows, so its own size says nothing. */
  children?: boolean;
}

/**
 * Whether an element scrolls: its content is wider or taller than it is. A scrolling region is a tab stop and a named
 * landmark only while it scrolls, because a tab stop that scrolls nothing is noise. `false` until mounted, so the server
 * and the first client render agree. Pass the elements whose size can change it (the scroller itself is always watched).
 */
export function useOverflow(
  scroller: Ref<HTMLElement | null>,
  watch: MaybeRefOrGetter<HTMLElement | null>[] = [],
  options: UseOverflowOptions = {},
): Ref<boolean> {
  const overflows = ref(false);
  let observer: ResizeObserver | undefined;
  let mutations: MutationObserver | undefined;

  function measure() {
    const el = scroller.value;
    overflows.value = !!el && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1);
  }

  function observe() {
    if (!observer) return;
    observer.disconnect();
    const el = scroller.value;
    for (const w of [el, ...watch.map((w) => toValue(w))]) if (w) observer.observe(w);
    if (options.children && el) for (const child of el.children) observer.observe(child);
    measure();
  }

  onMounted(() => {
    measure();
    if (typeof ResizeObserver === "undefined") return;
    observer = new ResizeObserver(measure);
    observe();
    if (options.children && scroller.value && typeof MutationObserver !== "undefined") {
      mutations = new MutationObserver(observe);
      mutations.observe(scroller.value, { childList: true });
    }
  });
  onBeforeUnmount(() => {
    observer?.disconnect();
    mutations?.disconnect();
  });

  return overflows;
}
