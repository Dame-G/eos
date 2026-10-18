import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { render } from "vitest-browser-vue";
import { createToasts, useToast } from "./useToast.js";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("createToasts", () => {
  test("show returns an id and adds the toast with its tone, info by default", () => {
    const store = createToasts();
    const id = store.show({ title: "Saved" });
    expect(store.items).toHaveLength(1);
    expect(store.items[0]).toMatchObject({ id, title: "Saved", tone: "info", duration: 5000 });
    store.clear();
  });

  test("success and info go after 5 seconds by default; danger and actions stay", () => {
    const store = createToasts();
    store.show({ title: "a", tone: "success" });
    store.show({ title: "b", tone: "danger" });
    store.show({ title: "c", action: "x" });
    store.show({ title: "d", duration: 90 });
    expect(store.items.map((i) => i.duration)).toEqual([5000, 0, 0, 90]);
    store.clear();
  });

  test("a toast goes after its duration; one without a duration stays", async () => {
    const store = createToasts();
    store.show({ title: "Saved", duration: 60 });
    store.show({ title: "Failed", tone: "danger" });
    expect(store.items).toHaveLength(2);
    await wait(150);
    expect(store.items.map((i) => i.title)).toEqual(["Failed"]);
    store.clear();
  });

  test("dismiss removes one toast and clear removes all", () => {
    const store = createToasts();
    const a = store.show({ title: "a" });
    store.show({ title: "b" });
    store.dismiss(a);
    expect(store.items.map((i) => i.title)).toEqual(["b"]);
    store.clear();
    expect(store.items).toHaveLength(0);
  });

  test("pause keeps the time left; resume runs it on", async () => {
    const store = createToasts();
    store.show({ title: "a", duration: 120 });
    await wait(60);
    store.pause();
    await wait(200);
    expect(store.items).toHaveLength(1);
    store.resume();
    await wait(30);
    expect(store.items).toHaveLength(1);
    await wait(120);
    expect(store.items).toHaveLength(0);
  });

  test("a toast shown while paused waits for resume", async () => {
    const store = createToasts();
    store.pause();
    store.show({ title: "a", duration: 40 });
    await wait(120);
    expect(store.items).toHaveLength(1);
    store.resume();
    await wait(120);
    expect(store.items).toHaveLength(0);
  });
});

describe("useToast", () => {
  test("throws outside a provider", async () => {
    let error: unknown;
    await render(
      defineComponent({
        setup() {
          try {
            useToast();
          } catch (e) {
            error = e;
          }
          return () => h("div");
        },
      }),
    );
    expect(String(error)).toContain("AeToastProvider");
  });
});
