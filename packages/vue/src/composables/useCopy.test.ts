import { afterEach, describe, expect, test, vi } from "vitest";
import { defineComponent, h } from "vue";
import { render } from "vitest-browser-vue";
import { useCopy, type CopyState } from "./useCopy.js";

async function setup(options?: Parameters<typeof useCopy>[0]) {
  let state!: CopyState;
  await render(
    defineComponent({
      setup() {
        state = useCopy(options);
        return () => h("div");
      },
    }),
  );
  return state;
}

const stubClipboard = (writeText: () => Promise<void>) =>
  vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });

afterEach(() => vi.unstubAllGlobals());

describe("useCopy", () => {
  test("writes to the clipboard, flips copied, then flips back", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    const state = await setup({ timeout: 60 });
    expect(await state.copy("hello")).toBe(true);
    expect(writeText).toHaveBeenCalledWith("hello");
    expect(state.copied.value).toBe(true);
    await expect.poll(() => state.copied.value).toBe(false);
  });

  test("falls back to a hidden textarea when the clipboard is unavailable", async () => {
    stubClipboard(vi.fn().mockRejectedValue(new Error("no")));
    const exec = vi.spyOn(document, "execCommand").mockReturnValue(true);
    const state = await setup();
    expect(await state.copy("hi")).toBe(true);
    expect(exec).toHaveBeenCalledWith("copy");
    exec.mockRestore();
  });

  test("reports a failure and announces it assertively", async () => {
    stubClipboard(vi.fn().mockRejectedValue(new Error("no")));
    const exec = vi.spyOn(document, "execCommand").mockReturnValue(false);
    const state = await setup();
    expect(await state.copy("hi")).toBe(false);
    expect(state.failed.value).toBe(true);
    await expect.poll(() => document.querySelector("[data-e-announcer=assertive]")?.textContent).toBe("Couldn't copy");
    exec.mockRestore();
  });

  test("announce: false stays silent", async () => {
    stubClipboard(vi.fn().mockResolvedValue(undefined));
    document.querySelectorAll("[data-e-announcer]").forEach((el) => (el.textContent = ""));
    const state = await setup({ announce: false });
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    try {
      expect(await state.copy("quiet")).toBe(true);
      // Past the moment an announcement would land.
      await vi.advanceTimersByTimeAsync(500);
    } finally {
      vi.useRealTimers();
    }
    expect(document.querySelector("[data-e-announcer=polite]")?.textContent ?? "").toBe("");
  });
});
