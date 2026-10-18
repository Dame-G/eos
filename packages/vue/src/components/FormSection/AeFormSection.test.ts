import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeFormSection from "./AeFormSection.vue";
import AeTextField from "../TextField/AeTextField.vue";
import { expectNoViolations } from "../../../test/axe.js";

const sections = () =>
  defineComponent({
    render: () =>
      h("form", [
        h(AeFormSection, { title: "Your details", description: "As on your card." }, () => [
          h(AeTextField, { label: "Name" }),
          h(AeTextField, { label: "Email" }),
        ]),
        h(AeFormSection, { title: "How you will pay" }, () => h(AeTextField, { label: "Account" })),
      ]),
  });

describe("AeFormSection", () => {
  test("is a region named by its heading, an h2 by default", async () => {
    const { container } = await render(AeFormSection, {
      props: { title: "Your details" },
      slots: { default: "<p>Fields</p>" },
    });
    await expect.element(page.getByRole("region", { name: "Your details" })).toBeVisible();
    const heading = container.querySelector("h2.ae-formsection-title")!;
    expect(heading.textContent).toBe("Your details");
    expect(container.querySelector("section")!.getAttribute("aria-labelledby")).toBe(heading.id);
  });

  test("headingLevel sets the heading element", async () => {
    const { container } = await render(AeFormSection, { props: { title: "A", headingLevel: 3 } });
    expect(container.querySelector("h3.ae-formsection-title")).not.toBeNull();
    expect(container.querySelector("h2")).toBeNull();
  });

  test("shows the description under the title when given", async () => {
    const { container } = await render(AeFormSection, { props: { title: "A", description: "Why we ask" } });
    expect(container.querySelector(".ae-formsection-desc")!.textContent).toBe("Why we ask");
    const none = await render(AeFormSection, { props: { title: "B" } });
    expect(none.container.querySelector(".ae-formsection-desc")).toBeNull();
  });

  test("the fields are spaced by gap (4 by default)", async () => {
    const { container } = await render(AeFormSection, {
      props: { title: "A" },
      slots: { default: "<p>x</p><p>y</p>" },
    });
    const stack = container.querySelector(".ae-stack")!;
    expect(stack.getAttribute("style")).toContain("--ae-space-4");
    const wide = await render(AeFormSection, { props: { title: "B", gap: 6 }, slots: { default: "<p>x</p>" } });
    expect(wide.container.querySelector(".ae-stack")!.getAttribute("style")).toContain("--ae-space-6");
  });

  test("sections after the first are ruled apart", async () => {
    const { container } = await render(sections());
    const [first, second] = container.querySelectorAll("section");
    expect(getComputedStyle(first!).borderTopWidth).toBe("0px");
    expect(getComputedStyle(second!).borderTopWidth).not.toBe("0px");
  });

  test("id sets the heading id", async () => {
    const { container } = await render(AeFormSection, { props: { title: "A", id: "mine" } });
    expect(container.querySelector("h2")!.id).toBe("mine");
  });

  test("class and attributes fall through to the section", async () => {
    const { container } = await render(AeFormSection, {
      props: { title: "A" },
      attrs: { class: "mine", "data-x": "1" },
    });
    expect(container.querySelector("section")!.className).toBe("ae-formsection mine");
    expect(container.querySelector("section")!.getAttribute("data-x")).toBe("1");
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(sections());
    await expectNoViolations(container);
  });
});
