import { describe, expect, test, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import { render } from "vitest-browser-vue";
import { formatShortcut, useShortcuts, type ShortcutMap, type ShortcutOptions } from "./useShortcuts.js";

const press = (init: KeyboardEventInit, target: EventTarget = document.body) =>
  target.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init }));

async function host(map: ShortcutMap, options?: ShortcutOptions) {
  return render(
    defineComponent({
      setup() {
        useShortcuts(map, options);
        return () => h("div", [h("input", { "aria-label": "Name" }), h("button", { type: "button" }, "Go")]);
      },
    }),
  );
}

const mod = /Mac|iPhone|iPad|iPod/.test(navigator.platform) ? { metaKey: true } : { ctrlKey: true };

describe("useShortcuts", () => {
  test("a plain key runs its function and the default is prevented", async () => {
    const run = vi.fn();
    await host({ g: run });
    const event = new KeyboardEvent("keydown", { key: "g", bubbles: true, cancelable: true });
    document.dispatchEvent(event);
    expect(run).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
  });

  test("mod is Cmd on Apple and Ctrl elsewhere", async () => {
    const run = vi.fn();
    await host({ "mod+k": run });
    press({ key: "k" });
    expect(run).not.toHaveBeenCalled();
    press({ key: "k", ...mod });
    expect(run).toHaveBeenCalledOnce();
  });

  test("modifiers must match exactly", async () => {
    const run = vi.fn();
    await host({ "mod+k": run });
    press({ key: "k", shiftKey: true, ...mod });
    press({ key: "k", altKey: true, ...mod });
    expect(run).not.toHaveBeenCalled();
  });

  test("names and symbols: esc and ?", async () => {
    const a = vi.fn();
    const b = vi.fn();
    await host({ esc: a, "?": b });
    press({ key: "Escape" });
    press({ key: "?", shiftKey: true });
    expect(a).toHaveBeenCalledOnce();
    expect(b).toHaveBeenCalledOnce();
  });

  test("key-only shortcuts are skipped in a text field; modified ones and Escape are not", async () => {
    const plain = vi.fn();
    const chord = vi.fn();
    const esc = vi.fn();
    const { container } = await host({ g: plain, "mod+k": chord, escape: esc });
    const input = container.querySelector("input")!;
    press({ key: "g" }, input);
    press({ key: "k", ...mod }, input);
    press({ key: "Escape" }, input);
    expect(plain).not.toHaveBeenCalled();
    expect(chord).toHaveBeenCalledOnce();
    expect(esc).toHaveBeenCalledOnce();
  });

  test("allowInInputs runs key-only shortcuts in a text field", async () => {
    const plain = vi.fn();
    const { container } = await host({ g: plain }, { allowInInputs: true });
    press({ key: "g" }, container.querySelector("input")!);
    expect(plain).toHaveBeenCalledOnce();
  });

  test("a key-only shortcut still runs on a button", async () => {
    const plain = vi.fn();
    const { container } = await host({ g: plain });
    press({ key: "g" }, container.querySelector("button")!);
    expect(plain).toHaveBeenCalledOnce();
  });

  test("enabled switches them off and on", async () => {
    const run = vi.fn();
    const on = ref(false);
    await host({ g: run }, { enabled: on });
    press({ key: "g" });
    expect(run).not.toHaveBeenCalled();
    on.value = true;
    await new Promise((r) => setTimeout(r, 0));
    press({ key: "g" });
    expect(run).toHaveBeenCalledOnce();
  });

  test("they are removed when the component unmounts", async () => {
    const run = vi.fn();
    const view = await host({ g: run });
    view.unmount();
    press({ key: "g" });
    expect(run).not.toHaveBeenCalled();
  });

  test("the returned function removes them early", async () => {
    const run = vi.fn();
    let stop = () => {};
    await render(
      defineComponent({
        setup() {
          stop = useShortcuts({ g: run });
          return () => h("div");
        },
      }),
    );
    stop();
    press({ key: "g" });
    expect(run).not.toHaveBeenCalled();
  });

  test("a held key does not repeat", async () => {
    const run = vi.fn();
    await host({ g: run });
    press({ key: "g", repeat: true });
    expect(run).not.toHaveBeenCalled();
  });
});

describe("formatShortcut", () => {
  test("Apple and other platforms", () => {
    expect(formatShortcut("mod+k", true)).toEqual(["⌘", "K"]);
    expect(formatShortcut("mod+k", false)).toEqual(["Ctrl", "K"]);
    expect(formatShortcut("mod+shift+p", false)).toEqual(["Ctrl", "Shift", "P"]);
    expect(formatShortcut("esc", false)).toEqual(["Esc"]);
  });
});
