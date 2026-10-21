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

  test("changes only the text colour, with no background and not the browser's yellow mark", async () => {
    const { container } = await render(EHighlight, { slots: { default: "due" } });
    const cs = getComputedStyle(container.querySelector("mark")!);
    expect(cs.backgroundImage).toBe("none");
    expect(cs.backgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(cs.color).not.toBe(getComputedStyle(container).color);
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
          h("p", [
            "Set ",
            h(EHighlight, { code: true }, () => "brand"),
            " and pay ",
            h(EHighlight, null, () => "by Oct 22"),
            ".",
          ]),
      }),
    );
    await expectNoViolations(container);
  });

  test("swatch draws a hidden square of the colour after the text, and nothing without it", async () => {
    const withSwatch = await render(EHighlight, {
      props: { code: true, swatch: "#2c95b4" },
      slots: { default: "#2c95b4" },
    });
    const square = withSwatch.container.querySelector<HTMLElement>(".e-highlight-swatch")!;
    expect(square.getAttribute("aria-hidden")).toBe("true");
    expect(getComputedStyle(square).backgroundColor).toBe("rgb(44, 149, 180)");
    expect(withSwatch.container.querySelector("code")!.textContent).toBe("#2c95b4");
    const without = await render(EHighlight, { props: { code: true }, slots: { default: "brand" } });
    expect(without.container.querySelector(".e-highlight-swatch")).toBeNull();
  });
});
