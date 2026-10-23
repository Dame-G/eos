import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EStepper from "./EStepper.vue";
import { expectNoViolations } from "../../../test/axe.js";

const steps = [
  { label: "About you", state: "done" as const },
  { label: "Contact", state: "done" as const },
  { label: "Insurance", state: "current" as const },
  { label: "Forms", state: "upcoming" as const },
  { label: "Review", state: "upcoming" as const },
];

describe("EStepper", () => {
  test("is an ordered list named Progress by default, or by the label prop", async () => {
    await render(EStepper, { props: { steps } });
    await expect.element(page.getByRole("list", { name: "Progress" })).toBeVisible();
    await render(EStepper, { props: { steps, label: "Registration" } });
    await expect.element(page.getByRole("list", { name: "Registration" })).toBeVisible();
  });

  test("the current step has aria-current=step, and only that one", async () => {
    const { container } = await render(EStepper, { props: { steps } });
    const current = container.querySelectorAll("[aria-current]");
    expect(current.length).toBe(1);
    expect(current[0]!.getAttribute("aria-current")).toBe("step");
    expect(current[0]!.textContent).toContain("Insurance");
  });

  test("states: done steps get a check and are announced as done, others are numbered", async () => {
    const { container } = await render(EStepper, { props: { steps } });
    const lis = [...container.querySelectorAll<HTMLElement>("li")];
    expect(lis.map((li) => li.dataset.state)).toEqual(["done", "done", "current", "upcoming", "upcoming"]);
    expect(lis[0]!.querySelector(".e-step-dot .e-icon")).not.toBeNull();
    expect(lis[0]!.querySelector(".e-sr")!.textContent).toBe(" (done)");
    expect(lis[2]!.querySelector(".e-step-dot")!.textContent).toBe("3");
    expect(lis[3]!.querySelector(".e-step-dot")!.textContent).toBe("4");
    expect(lis[3]!.querySelector(".e-sr")).toBeNull();
  });

  test("`todo` is the same as `upcoming`", async () => {
    const { container } = await render(EStepper, {
      props: {
        steps: [
          { label: "A", state: "current" },
          { label: "B", state: "todo" },
        ],
      },
    });
    expect(container.querySelectorAll<HTMLElement>("li")[1]!.dataset.state).toBe("upcoming");
  });

  test("the states look different without relying on colour: dashed, outlined and filled dots", async () => {
    const { container } = await render(EStepper, { props: { steps } });
    const dots = [...container.querySelectorAll<HTMLElement>(".e-step-dot")].map((d) => getComputedStyle(d));
    expect(dots[3]!.outlineStyle).toBe("dashed");
    expect(dots[2]!.borderTopWidth).toBe("2px");
    expect(dots[2]!.borderTopColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(dots[0]!.outlineStyle).toBe("none");
    expect(dots[0]!.backgroundColor).not.toBe(dots[3]!.backgroundColor);
  });

  test("steps sit in a row in a wide container and stack with connector lines in a narrow one, whatever the viewport", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", { id: "box", style: { width: "600px" } }, [h(EStepper, { steps })]),
      }),
    );
    const box = container.querySelector<HTMLElement>("#box")!;
    const lis = [...container.querySelectorAll<HTMLElement>("li")];
    expect(lis[1]!.getBoundingClientRect().top).toBe(lis[0]!.getBoundingClientRect().top);
    box.style.width = "300px";
    await expect
      .poll(() => lis[1]!.getBoundingClientRect().top > lis[0]!.getBoundingClientRect().bottom - 1)
      .toBe(true);
    expect(getComputedStyle(lis[1]!, "::before").display).toBe("block");
    expect(getComputedStyle(lis[0]!, "::before").display).toBe("none");
  });

  test("class and attributes fall through to the list", async () => {
    const { container } = await render(EStepper, { props: { steps }, attrs: { class: "mine", "data-x": "1" } });
    const ol = container.querySelector("ol")!;
    expect(ol.classList.contains("mine")).toBe(true);
    expect(ol.classList.contains("e-steps")).toBe(true);
    expect(ol.getAttribute("data-x")).toBe("1");
  });

  test("has no accessibility violations", async () => {
    const { container } = await render(EStepper, { props: { steps, label: "Registration" } });
    await expectNoViolations(container);
    const first = await render(EStepper, {
      props: { steps: steps.map((s, i) => ({ ...s, state: i ? ("upcoming" as const) : ("current" as const) })) },
    });
    await expectNoViolations(first.container);
  });
});
