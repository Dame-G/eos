import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { render } from "vitest-browser-vue";
import EHighlight from "./EHighlight.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("EHighlight", () => {
  test("is a mark by default and a code element with the code prop", async () => {
    const mark = await render(EHighlight, { slots: { default: "due" } });
    expect(mark.container.querySelector("mark")!.className).toBe("e-highlight");
    const code = await render(EHighlight, { props: { code: true }, slots: { default: "brand" } });
    const el = code.container.querySelector("code")!;
    expect(el.className).toBe("e-highlight e-highlight--code");
    expect(getComputedStyle(el).fontFamily).toContain("mono");
  });

  test("is a marker over the accent, not the browser's yellow mark", async () => {
    const { container } = await render(EHighlight, { slots: { default: "due" } });
    const cs = getComputedStyle(container.querySelector("mark")!);
    expect(cs.backgroundImage).toContain("linear-gradient");
    expect(cs.backgroundColor).toBe("rgba(0, 0, 0, 0)");
  });

  test("attributes fall through to the element", async () => {
    const { container } = await render(EHighlight, {
      props: { code: true },
      attrs: { "data-testid": "h", class: "mine" },
      slots: { default: "x" },
    });
    const el = container.querySelector("code")!;
    expect(el.getAttribute("data-testid")).toBe("h");
    expect(el.classList.contains("mine")).toBe(true);
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("p", ["Set ", h(EHighlight, { code: true }, () => "brand"), " and pay ", h(EHighlight, null, () => "by Oct 22"), "."]),
      }),
    );
    await expectNoViolations(container);
  });
});
