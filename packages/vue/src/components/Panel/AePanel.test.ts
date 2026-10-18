import { describe, expect, test } from "vitest";
import { h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AePanel from "./AePanel.vue";
import AeButton from "../Button/AeButton.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("AePanel", () => {
  test("is an outlined section with a header and a body", async () => {
    const { container } = await render(AePanel, { props: { title: "Details" }, slots: { default: "Body" } });
    container.classList.add("ae-root");
    const el = container.querySelector("section")!;
    expect(el.classList.contains("ae-surface")).toBe(true);
    expect(el.classList.contains("ae-panel")).toBe(true);
    expect(el.querySelector(".ae-panel-head")).not.toBeNull();
    expect(el.querySelector(".ae-panel-body")!.textContent).toBe("Body");
    expect(getComputedStyle(el).boxShadow).not.toBe("none");
  });

  test("the title is an h3 by default and headingLevel changes it", async () => {
    const a = await render(AePanel, { props: { title: "B" } });
    expect(a.container.querySelector("h3.ae-panel-title")).not.toBeNull();
    const b = await render(AePanel, { props: { title: "B", headingLevel: 4 } });
    expect(b.container.querySelector("h4.ae-panel-title")).not.toBeNull();
  });

  test("a kicker shows above the title", async () => {
    const { container } = await render(AePanel, { props: { title: "Details", kicker: "Account" } });
    const kicker = container.querySelector(".ae-kicker")!;
    expect(kicker.textContent).toBe("Account");
    expect(kicker.nextElementSibling!.className).toBe("ae-panel-title");
  });

  test("the action slot sits at the end of the header", async () => {
    const { container } = await render(AePanel, {
      props: { title: "Details" },
      slots: { action: () => h(AeButton, { variant: "outline" }, () => "Edit") },
    });
    container.classList.add("ae-root");
    const head = container.querySelector(".ae-panel-head")!;
    expect(head.lastElementChild!.tagName).toBe("BUTTON");
    expect(head.lastElementChild!.getBoundingClientRect().left).toBeGreaterThan(
      head.firstElementChild!.getBoundingClientRect().right,
    );
    await expect.element(page.getByRole("button", { name: "Edit" })).toBeVisible();
  });

  test("with no title and no action there is no header", async () => {
    const { container } = await render(AePanel, { slots: { default: "Body" } });
    expect(container.querySelector(".ae-panel-head")).toBeNull();
  });

  test("an action alone still gets a header", async () => {
    const { container } = await render(AePanel, { slots: { action: () => h(AeButton, null, () => "Go") } });
    expect(container.querySelector(".ae-panel-head")).not.toBeNull();
    expect(container.querySelector(".ae-panel-title")).toBeNull();
  });

  test("class, id and aria attributes fall through to the section", async () => {
    const { container } = await render(AePanel, {
      props: { title: "Details" },
      attrs: { class: "mine", id: "p", "aria-label": "Details panel" },
    });
    const el = container.querySelector("section")!;
    expect(el.classList.contains("mine")).toBe(true);
    expect(el.id).toBe("p");
    await expect.element(page.getByRole("region", { name: "Details panel" })).toBeVisible();
  });

  test("axe finds nothing", async () => {
    const { container } = await render(AePanel, {
      props: { title: "Details", kicker: "Account" },
      slots: { default: "Body", action: () => h(AeButton, { variant: "outline" }, () => "Edit") },
    });
    container.classList.add("ae-root");
    await expectNoViolations(container);
  });
});
