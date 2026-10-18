import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EFormSection from "./EFormSection.vue";
import ETextField from "../TextField/ETextField.vue";
import { expectNoViolations } from "../../../test/axe.js";

const sections = () =>
  defineComponent({
    render: () =>
      h("form", [
        h(EFormSection, { title: "Your details", description: "As on your card." }, () => [
          h(ETextField, { label: "Name" }),
          h(ETextField, { label: "Email" }),
        ]),
        h(EFormSection, { title: "How you will pay" }, () => h(ETextField, { label: "Account" })),
      ]),
  });

describe("EFormSection", () => {
  test("is a region named by its heading, an h2 by default", async () => {
    const { container } = await render(EFormSection, {
      props: { title: "Your details" },
      slots: { default: "<p>Fields</p>" },
    });
    await expect.element(page.getByRole("region", { name: "Your details" })).toBeVisible();
    const heading = container.querySelector("h2.e-formsection-title")!;
    expect(heading.textContent).toBe("Your details");
    expect(container.querySelector("section")!.getAttribute("aria-labelledby")).toBe(heading.id);
  });

  test("headingLevel sets the heading element", async () => {
    const { container } = await render(EFormSection, { props: { title: "A", headingLevel: 3 } });
    expect(container.querySelector("h3.e-formsection-title")).not.toBeNull();
    expect(container.querySelector("h2")).toBeNull();
  });

  test("shows the description under the title when given", async () => {
    const { container } = await render(EFormSection, { props: { title: "A", description: "Why we ask" } });
    expect(container.querySelector(".e-formsection-desc")!.textContent).toBe("Why we ask");
    const none = await render(EFormSection, { props: { title: "B" } });
    expect(none.container.querySelector(".e-formsection-desc")).toBeNull();
  });

  test("the fields are spaced by gap (4 by default)", async () => {
    const { container } = await render(EFormSection, {
      props: { title: "A" },
      slots: { default: "<p>x</p><p>y</p>" },
    });
    const stack = container.querySelector(".e-stack")!;
    expect(stack.getAttribute("style")).toContain("--e-space-4");
    const wide = await render(EFormSection, { props: { title: "B", gap: 6 }, slots: { default: "<p>x</p>" } });
    expect(wide.container.querySelector(".e-stack")!.getAttribute("style")).toContain("--e-space-6");
  });

  test("sections after the first are ruled apart", async () => {
    const { container } = await render(sections());
    const [first, second] = container.querySelectorAll("section");
    expect(getComputedStyle(first!).borderTopWidth).toBe("0px");
    expect(getComputedStyle(second!).borderTopWidth).not.toBe("0px");
  });

  test("id sets the heading id", async () => {
    const { container } = await render(EFormSection, { props: { title: "A", id: "mine" } });
    expect(container.querySelector("h2")!.id).toBe("mine");
  });

  test("class and attributes fall through to the section", async () => {
    const { container } = await render(EFormSection, {
      props: { title: "A" },
      attrs: { class: "mine", "data-x": "1" },
    });
    expect(container.querySelector("section")!.className).toBe("e-formsection mine");
    expect(container.querySelector("section")!.getAttribute("data-x")).toBe("1");
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(sections());
    await expectNoViolations(container);
  });
});
