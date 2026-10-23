import { describe, expect, test, vi } from "vitest";
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

describe("createToasts options", () => {
  test("a toast with no duration is closable even when closable is false, and warns", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const store = createToasts();
    store.show({ title: "Failed", tone: "danger", closable: false });
    store.show({ title: "Saved", closable: false });
    expect(store.items.map((i) => i.closable)).toEqual([true, false]);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
    store.clear();
  });

  test("a key updates the toast on screen instead of adding another", () => {
    const store = createToasts();
    const a = store.show({ title: "Offline", key: "net" });
    const b = store.show({ title: "Still offline", key: "net" });
    expect(b).toBe(a);
    expect(store.items.map((i) => i.title)).toEqual(["Still offline"]);
    store.clear();
  });

  test("a repeat under a key restarts the timer", async () => {
    const store = createToasts();
    store.show({ title: "a", key: "k", duration: 120 });
    await wait(80);
    store.show({ title: "a", key: "k", duration: 120 });
    await wait(80);
    expect(store.items).toHaveLength(1);
    await wait(80);
    expect(store.items).toHaveLength(0);
  });

  test("limit removes the oldest toast", () => {
    const store = createToasts();
    store.limit = 2;
    store.show({ title: "a" });
    store.show({ title: "b" });
    store.show({ title: "c" });
    expect(store.items.map((i) => i.title)).toEqual(["b", "c"]);
    store.clear();
  });

  test("update changes a toast and restarts its timer; an unknown id does nothing", async () => {
    const store = createToasts();
    const id = store.show({ title: "Saving", duration: 60 });
    store.update(id, { title: "Saved", tone: "success", duration: 200 });
    expect(store.items[0]).toMatchObject({ title: "Saved", tone: "success", duration: 200 });
    await wait(120);
    expect(store.items).toHaveLength(1);
    store.update("nope", { title: "x" });
    expect(store.items).toHaveLength(1);
    await wait(150);
    expect(store.items).toHaveLength(0);
  });

  test("changing a toast to danger makes it stay", () => {
    const store = createToasts();
    const id = store.show({ title: "Saving" });
    store.update(id, { tone: "danger" });
    expect(store.items[0]!.duration).toBe(0);
    store.clear();
  });

  test("promise shows loading, then success, and returns the value", async () => {
    const store = createToasts();
    let done!: (v: number) => void;
    const result = store.promise(new Promise<number>((r) => (done = r)), {
      loading: "Saving",
      success: (n) => `Saved ${n}`,
      error: "Failed",
    });
    expect(store.items[0]).toMatchObject({ title: "Saving", duration: 0 });
    done(3);
    expect(await result).toBe(3);
    expect(store.items).toHaveLength(1);
    expect(store.items[0]).toMatchObject({ title: "Saved 3", tone: "success", duration: 5000 });
    store.clear();
  });

  test("promise turns a rejection into a danger toast and rethrows", async () => {
    const store = createToasts();
    await expect(
      store.promise(Promise.reject(new Error("no")), {
        loading: "Saving",
        success: "Saved",
        error: { title: "Failed", message: "Try again" },
      }),
    ).rejects.toThrow("no");
    expect(store.items[0]).toMatchObject({ title: "Failed", message: "Try again", tone: "danger", duration: 0 });
    store.clear();
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
    expect(String(error)).toContain("EToastProvider");
  });
});
