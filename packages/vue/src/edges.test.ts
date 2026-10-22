import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-vue";
import EButton from "./components/Button/EButton.vue";
import ETextField from "./components/TextField/ETextField.vue";
import ESwitch from "./components/Switch/ESwitch.vue";
import ECheckbox from "./components/Checkbox/ECheckbox.vue";
import ENotice from "./components/Notice/ENotice.vue";
import ETabs from "./components/Tabs/ETabs.vue";

/**
 * A fill under an inset-shadow edge shows through the antialiased pixels of a rounded corner as a fringe of the fill
 * colour, outside the curve. Controls draw their edge as a border and stop the fill inside it, so the outermost pixels
 * carry the edge colour alone.
 */
function expectBorderEdge(el: Element) {
  const cs = getComputedStyle(el);
  expect(parseFloat(cs.borderTopWidth)).toBeGreaterThan(0);
  expect(cs.backgroundClip).toBe("padding-box");
  expect(cs.boxShadow.match(/inset 0px 0px 0px [1-9]/g) ?? []).toEqual([]);
}

describe("edges", () => {
  test("a button's raised edge is its own border, thicker at the bottom, with no shadow", async () => {
    const { container } = await render(EButton, { slots: { default: () => "Pay" } });
    const cs = getComputedStyle(container.querySelector(".e-btn")!);
    expect(parseFloat(cs.borderBottomWidth)).toBeGreaterThan(parseFloat(cs.borderTopWidth));
    expect(cs.boxShadow).toBe("none");
    // A solid face is the colour of its edge, so it runs under the border; an outline face stops inside it.
    expect(cs.backgroundClip).toBe("border-box");
  });

  test("an outline button stops its fill inside the border", async () => {
    const { container } = await render(EButton, { props: { variant: "outline" }, slots: { default: () => "Cancel" } });
    expectBorderEdge(container.querySelector(".e-btn")!);
  });

  test.each([
    ["a text field", () => render(ETextField, { props: { label: "Email" } }), ".e-input"],
    ["a switch", () => render(ESwitch, { props: { label: "Reminders" } }), ".e-switch-track"],
    ["a checkbox", () => render(ECheckbox, { props: { label: "Agree" } }), ".e-check"],
    [
      "a notice",
      () => render(ENotice, { props: { title: "Heads up" }, slots: { default: () => "Body" } }),
      ".e-notice",
    ],
  ])("%s draws its edge as a border with the fill stopped inside it", async (_name, mount, selector) => {
    const { container } = await mount();
    expectBorderEdge(container.querySelector(selector)!);
  });

  test("a framed tab panel and tab share the same border construction", async () => {
    const { container } = await render(ETabs, {
      props: {
        items: [
          { id: "a", label: "One" },
          { id: "b", label: "Two" },
        ],
        framed: true,
      },
      slots: { a: () => "A", b: () => "B" },
    });
    expectBorderEdge(container.querySelector(".e-tabpanel")!);
    expectBorderEdge(container.querySelector(".e-tab")!);
  });
});
