import { afterEach, beforeEach, describe, expect, test, vi, type MockInstance } from "vitest";
import { h, nextTick, reactive, ref, type Component } from "vue";
import { render } from "vitest-browser-vue";
import EAvatar from "../components/Avatar/EAvatar.vue";
import EDescriptionList from "../components/DescriptionList/EDescriptionList.vue";
import EInline from "../components/Inline/EInline.vue";
import EKbd from "../components/Kbd/EKbd.vue";
import ESpinner from "../components/Spinner/ESpinner.vue";
import EStamp from "../components/Stamp/EStamp.vue";
import ESurface from "../components/Surface/ESurface.vue";
import ETable from "../components/Table/ETable.vue";
import EText from "../components/Text/EText.vue";
import EToast from "../components/Toast/EToast.vue";
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

// Each old spelling still works, and says once what to write instead.
describe.each<[string, Component, Record<string, unknown>, Record<string, unknown>, string]>([
  ["EKbd small", EKbd, { small: true }, { size: "sm" }, 'EKbd `small` is deprecated. Use size="sm".'],
  ["ESpinner small", ESpinner, { small: true }, { size: "sm" }, 'ESpinner `small` is deprecated. Use size="sm".'],
  ["ESpinner large", ESpinner, { large: true }, { size: "lg" }, 'ESpinner `large` is deprecated. Use size="lg".'],
  ["EStamp small", EStamp, { small: true }, { size: "sm" }, 'EStamp `small` is deprecated. Use size="sm".'],
  ["EStamp ink", EStamp, { tone: "ink" }, { tone: "neutral" }, 'EStamp tone="ink" is deprecated. Use tone="neutral".'],
  ["EText small", EText, { small: true }, { size: "sm" }, 'EText `small` is deprecated. Use size="sm".'],
  ["EText large", EText, { large: true }, { size: "lg" }, 'EText `large` is deprecated. Use size="lg".'],
  ["EText muted", EText, { muted: true }, { tone: "neutral" }, 'EText `muted` is deprecated. Use tone="neutral".'],
  ["EText tone muted", EText, { tone: "muted" }, { tone: "neutral" }, 'EText tone="muted" is deprecated.'],
  ["ESurface small", ESurface, { small: true }, { size: "sm" }, 'ESurface `small` is deprecated. Use size="sm".'],
  ["ESurface large", ESurface, { large: true }, { size: "lg" }, 'ESurface `large` is deprecated. Use size="lg".'],
  ["ESurface pad", ESurface, { pad: "lg" }, { size: "lg" }, "ESurface `pad` is deprecated. Use `size`."],
  ["ESurface paper", ESurface, { paper: true }, { variant: "paper" }, "ESurface `paper` is deprecated."],
  ["ESurface raised", ESurface, { raised: true }, { variant: "raised" }, "ESurface `raised` is deprecated."],
  ["ESurface tone", ESurface, { variant: "tone" }, { variant: "tinted" }, 'ESurface variant="tone" is deprecated.'],
  [
    "EAvatar small",
    EAvatar,
    { name: "Ada", small: true },
    { name: "Ada", size: "sm" },
    "EAvatar `small` is deprecated.",
  ],
  [
    "EAvatar large",
    EAvatar,
    { name: "Ada", large: true },
    { name: "Ada", size: "lg" },
    "EAvatar `large` is deprecated.",
  ],
  [
    "EAvatar status",
    EAvatar,
    { name: "Ada", status: "away" },
    { name: "Ada", presence: "away" },
    "EAvatar `status` is deprecated. Use presence.",
  ],
  ["EInline nowrap", EInline, { nowrap: true }, { wrap: false }, 'EInline `nowrap` is deprecated. Use :wrap="false".'],
  [
    "ETable dense",
    ETable,
    { caption: "Rows", dense: true },
    { caption: "Rows", size: "sm" },
    'ETable `dense` is deprecated. Use size="sm".',
  ],
])("%s", (_, Component, old, current, message) => {
  const slots = { default: () => h("tbody", h("tr", h("td", "x"))) };
  test("renders as the new spelling does, and warns once", async () => {
    const a = await render(Component, { props: old, slots });
    await render(Component, { props: old, slots });
    const b = await render(Component, { props: current, slots });
    const html = (r: typeof a) => r.container.innerHTML.replace(/ (id|for|aria-[a-z]+)="[^"]*"/g, "");
    expect(html(a)).toBe(html(b));
    expect(messages().filter((m) => m.includes(message))).toHaveLength(1);
  });
});

describe("the new vocabulary", () => {
  test("EText tone neutral is the muted colour", async () => {
    const { container } = await render(EText, { props: { tone: "neutral" }, slots: { default: "Quiet" } });
    const p = container.querySelector("p")!;
    expect(p.style.getPropertyValue("--_tone")).toBe("var(--e-muted)");
    expect(messages()).toEqual([]);
  });

  test("ESurface variant tinted is the tinted ground", async () => {
    const { container } = await render(ESurface, { props: { variant: "tinted" }, slots: { default: "x" } });
    const el = container.querySelector(".e-surface")!;
    expect(el.classList.contains("e-surface--tinted")).toBe(true);
    expect(getComputedStyle(el).backgroundColor).not.toBe(getComputedStyle(document.body).backgroundColor);
  });

  test("EToast takes the neutral tone, announced politely", async () => {
    const { container } = await render(EToast, { props: { title: "Synced", tone: "neutral" } });
    const toast = container.querySelector(".e-toast")!;
    expect(toast.classList.contains("e-toast--neutral")).toBe(true);
    expect(toast.getAttribute("role")).toBe("status");
  });

  test("EDescriptionList takes stamp and stampTone, and badge still works with one warning", async () => {
    const items = ref([{ label: "Email", text: "ada@example.com", stamp: "Verified", stampTone: "success" as const }]);
    const { container, rerender } = await render(EDescriptionList, { props: { items: items.value } });
    expect(container.querySelector(".e-stamp--success")?.textContent).toContain("Verified");
    expect(messages()).toEqual([]);
    await rerender({ items: [{ label: "Email", text: "ada@example.com", badge: "Old", badgeTone: "danger" }] });
    expect(container.querySelector(".e-stamp--danger")?.textContent).toContain("Old");
    expect(messages().filter((m) => m.includes("EDescriptionList item `badge`"))).toHaveLength(1);
  });
});
