import { describe, expect, test } from "vitest";
import { createApp, defineComponent, h, nextTick, ref } from "vue";
import { useOverflow } from "./useOverflow.js";

function mount(width: number) {
  const host = document.createElement("div");
  document.body.append(host);
  const inner = ref<HTMLElement | null>(null);
  const state = { overflows: ref(false), width: ref(width) };
  const app = createApp(
    defineComponent({
      setup() {
        const scroller = ref<HTMLElement | null>(null);
        state.overflows = useOverflow(scroller, [inner]);
        return () =>
          h("div", { ref: scroller, style: "width: 100px; overflow: auto" }, [
            h("div", { ref: inner, style: `width: ${state.width.value}px; height: 10px` }),
          ]);
      },
    }),
  );
  app.mount(host);
  return { state, stop: () => (app.unmount(), host.remove()) };
}

describe("useOverflow", () => {
  test("is false when the content fits", async () => {
    const { state, stop } = mount(50);
    await nextTick();
    expect(state.overflows.value).toBe(false);
    stop();
  });

  test("is true when the content is wider than the element", async () => {
    const { state, stop } = mount(300);
    await nextTick();
    expect(state.overflows.value).toBe(true);
    stop();
  });

  test("follows the content as it changes size", async () => {
    const { state, stop } = mount(50);
    state.width.value = 300;
    await expect.poll(() => state.overflows.value).toBe(true);
    state.width.value = 20;
    await expect.poll(() => state.overflows.value).toBe(false);
    stop();
  });

  test("children: a child added later that grows is watched, though the scroller keeps its size", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const shown = ref(false);
    const tall = ref(10);
    const state = { overflows: ref(false) };
    const app = createApp(
      defineComponent({
        setup() {
          const scroller = ref<HTMLElement | null>(null);
          state.overflows = useOverflow(scroller, [], { children: true });
          return () =>
            h("div", { ref: scroller, style: "height: 100px; overflow: auto" }, [
              h("p", "first"),
              shown.value ? h("div", { style: { height: `${tall.value}px` } }) : null,
            ]);
        },
      }),
    );
    app.mount(host);
    await nextTick();
    expect(state.overflows.value).toBe(false);
    shown.value = true;
    await nextTick();
    tall.value = 400;
    await expect.poll(() => state.overflows.value).toBe(true);
    tall.value = 10;
    await expect.poll(() => state.overflows.value).toBe(false);
    app.unmount();
    host.remove();
  });
});
