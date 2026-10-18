import { describe, expect, test } from "vitest";
import { h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EPanel from "./EPanel.vue";
import EButton from "../Button/EButton.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("EPanel", () => {
  test("is an outlined section with a header and a body", async () => {
    const { container } = await render(EPanel, { props: { title: "Details" }, slots: { default: "Body" } });
    container.classList.add("e-root");
    const el = container.querySelector("section")!;
    expect(el.classList.contains("e-surface")).toBe(true);
    expect(el.classList.contains("e-panel")).toBe(true);
    expect(el.querySelector(".e-panel-head")).not.toBeNull();
    expect(el.querySelector(".e-panel-body")!.textContent).toBe("Body");
    expect(getComputedStyle(el).boxShadow).not.toBe("none");
  });

  test("the title is an h3 by default and headingLevel changes it", async () => {
    const a = await render(EPanel, { props: { title: "B" } });
    expect(a.container.querySelector("h3.e-panel-title")).not.toBeNull();
    const b = await render(EPanel, { props: { title: "B", headingLevel: 4 } });
    expect(b.container.querySelector("h4.e-panel-title")).not.toBeNull();
  });

  test("a kicker shows above the title", async () => {
    const { container } = await render(EPanel, { props: { title: "Details", kicker: "Account" } });
    const kicker = container.querySelector(".e-kicker")!;
    expect(kicker.textContent).toBe("Account");
    expect(kicker.nextElementSibling!.className).toBe("e-panel-title");
  });

  test("the action slot sits at the end of the header", async () => {
    const { container } = await render(EPanel, {
      props: { title: "Details" },
      slots: { action: () => h(EButton, { variant: "outline" }, () => "Edit") },
    });
    container.classList.add("e-root");
    const head = container.querySelector(".e-panel-head")!;
    expect(head.lastElementChild!.tagName).toBe("BUTTON");
    expect(head.lastElementChild!.getBoundingClientRect().left).toBeGreaterThan(
      head.firstElementChild!.getBoundingClientRect().right,
    );
    await expect.element(page.getByRole("button", { name: "Edit" })).toBeVisible();
  });

  test("with no title and no action there is no header", async () => {
    const { container } = await render(EPanel, { slots: { default: "Body" } });
    expect(container.querySelector(".e-panel-head")).toBeNull();
  });

  test("an action alone still gets a header", async () => {
    const { container } = await render(EPanel, { slots: { action: () => h(EButton, null, () => "Go") } });
    expect(container.querySelector(".e-panel-head")).not.toBeNull();
    expect(container.querySelector(".e-panel-title")).toBeNull();
  });

  test("class, id and aria attributes fall through to the section", async () => {
    const { container } = await render(EPanel, {
      props: { title: "Details" },
      attrs: { class: "mine", id: "p", "aria-label": "Details panel" },
    });
    const el = container.querySelector("section")!;
    expect(el.classList.contains("mine")).toBe(true);
    expect(el.id).toBe("p");
    await expect.element(page.getByRole("region", { name: "Details panel" })).toBeVisible();
  });

  test("axe finds nothing", async () => {
    const { container } = await render(EPanel, {
      props: { title: "Details", kicker: "Account" },
      slots: { default: "Body", action: () => h(EButton, { variant: "outline" }, () => "Edit") },
    });
    container.classList.add("e-root");
    await expectNoViolations(container);
  });
});
