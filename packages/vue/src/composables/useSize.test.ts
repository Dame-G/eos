import { afterEach, beforeEach, describe, expect, test, vi, type MockInstance } from "vitest";
import { h, nextTick, reactive } from "vue";
import { render } from "vitest-browser-vue";
import { useDeprecated, warnOnce } from "./useSize.js";

let warn: MockInstance<typeof console.warn>;
beforeEach(() => {
  warn = vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => warn.mockRestore());
const messages = () => warn.mock.calls.map(([m]) => String(m)).filter((m) => m.startsWith("[eos]"));

describe("warnOnce and useDeprecated", () => {
  test("warnOnce logs a message once per page", () => {
    warnOnce("a test message");
    warnOnce("a test message");
    expect(messages()).toEqual(["[eos] a test message"]);
  });

  test("useDeprecated names the prop and its replacement, and watches props set later", async () => {
    const props = reactive<{ old?: boolean; tone?: string }>({});
    await render({
      setup() {
        useDeprecated("ETest", props, { old: "`new`", tone: (v) => (v === "ink" ? 'tone="neutral"' : undefined) });
        return () => h("i");
      },
    });
    expect(messages()).toEqual([]);
    props.tone = "info";
    props.old = true;
    await nextTick();
    props.tone = "ink";
    await nextTick();
    expect(messages()).toEqual([
      "[eos] ETest `old` is deprecated. Use `new`.",
      '[eos] ETest tone="ink" is deprecated. Use tone="neutral".',
    ]);
  });
});
