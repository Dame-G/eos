import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EStepper from "./EStepper.vue";
import { createEos } from "../../plugin.js";
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

  test("the done and error words come whole from the messages, brackets and all", async () => {
    const { container } = await render(EStepper, {
      props: {
        steps: [
          { label: "One", state: "done" as const },
          { label: "Two", state: "error" as const },
        ],
      },
      global: { plugins: [createEos({ themeTarget: null, messages: { done: "– fertig", stepError: "– Fehler" } })] },
    });
    const sr = [...container.querySelectorAll(".e-sr")].map((s) => s.textContent);
    expect(sr).toEqual([" – fertig", " – Fehler"]);
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

  test("an error step is marked for screen readers and drawn with an icon, not the number", async () => {
    const { container } = await render(EStepper, {
      props: {
        steps: [
          { label: "Account", state: "done" },
          { label: "Payment", state: "error" },
          { label: "Review", state: "upcoming" },
        ],
      },
    });
    container.classList.add("e-root");
    const lis = container.querySelectorAll("li");
    expect(lis[1]!.getAttribute("data-state")).toBe("error");
    expect(lis[1]!.querySelector(".e-step-dot svg")).not.toBeNull();
    expect(lis[1]!.querySelector(".e-sr")!.textContent).toContain("has an error");
    expect(getComputedStyle(lis[1]!.querySelector(".e-step-dot")!).borderTopColor).not.toBe(
      getComputedStyle(lis[2]!.querySelector(".e-step-dot")!).borderTopColor,
    );
  });

  test("an optional step says so under its label", async () => {
    const { container } = await render(EStepper, {
      props: {
        steps: [
          { label: "Account", state: "current" },
          { label: "Insurance", state: "upcoming", optional: true },
        ],
      },
    });
    expect(container.querySelectorAll(".e-step-optional").length).toBe(1);
    expect(container.querySelector(".e-step-optional")!.textContent).toBe("Optional");
  });

  test("a display-only stepper has no buttons; interactive makes each step a button that emits select", async () => {
    const plain = await render(EStepper, { props: { steps } });
    expect(plain.container.querySelectorAll("button").length).toBe(0);
    const { container, emitted } = await render(EStepper, { props: { steps, interactive: true } });
    expect(container.querySelectorAll("li > button.e-step-body").length).toBe(steps.length);
    await userEvent.click(container.querySelectorAll("button")[1]!);
    expect(emitted().select).toEqual([[1, steps[1]]]);
  });

  test("interactive: Tab walks the steps, Enter and Space choose, a disabled step is reached but not chosen, the current one is aria-current", async () => {
    const list = [
      { label: "One", state: "done" as const },
      { label: "Two", state: "current" as const },
      { label: "Three", state: "upcoming" as const, disabled: true },
      { label: "Four", state: "upcoming" as const },
    ];
    const { container, emitted } = await render(EStepper, { props: { steps: list, interactive: true } });
    container.classList.add("e-root");
    await userEvent.tab();
    expect(document.activeElement!.textContent).toContain("One");
    expect(getComputedStyle(document.activeElement!).outlineStyle).toBe("solid");
    await userEvent.keyboard("{Enter}");
    await userEvent.tab();
    expect(document.activeElement!.getAttribute("aria-current")).toBe("step");
    await userEvent.tab();
    expect(document.activeElement!.textContent).toContain("Three");
    expect(document.activeElement!.getAttribute("aria-disabled")).toBe("true");
    await userEvent.keyboard("{Enter}");
    await userEvent.tab();
    expect(document.activeElement!.textContent).toContain("Four");
    await userEvent.keyboard(" ");
    expect(emitted().select).toEqual([
      [0, list[0]],
      [3, list[3]],
    ]);
    expect(container.querySelectorAll("li[aria-current]").length).toBe(0);
  });

  test("a disabled interactive step is aria-disabled and stays focusable, and a press does nothing", async () => {
    const list = [
      { label: "One", state: "current" as const },
      { label: "Two", state: "upcoming" as const, disabled: true },
    ];
    const { container, emitted } = await render(EStepper, { props: { steps: list, interactive: true } });
    const two = container.querySelectorAll("button")[1]!;
    expect(two.disabled).toBe(false);
    expect(two.getAttribute("aria-disabled")).toBe("true");
    two.focus();
    expect(document.activeElement).toBe(two);
    two.click();
    expect(emitted().select).toBeUndefined();
  });

  test("orientation vertical stacks the steps in any width, horizontal never stacks", async () => {
    const wide = await render(EStepper, { props: { steps, orientation: "vertical" } });
    wide.container.classList.add("e-root");
    const rows = [...wide.container.querySelectorAll("li")].map((li) => li.getBoundingClientRect().top);
    expect(new Set(rows).size).toBe(steps.length);
    const narrow = await render(
      defineComponent({
        render: () => h("div", { style: "width: 20rem" }, [h(EStepper, { steps, orientation: "horizontal" })]),
      }),
    );
    narrow.container.classList.add("e-root");
    const tops = [...narrow.container.querySelectorAll("li")].map((li) => li.getBoundingClientRect().top);
    expect(new Set(tops).size).toBe(1);
  });

  test("the steps are their own stacking context, so the raised dots stay under a sticky header", async () => {
    const { container } = await render(EStepper, { props: { steps } });
    container.classList.add("e-root");
    expect(getComputedStyle(container.querySelector(".e-steps")!).isolation).toBe("isolate");
  });

  test("an interactive stepper has no accessibility violations", async () => {
    const { container } = await render(EStepper, {
      props: { steps: [...steps.slice(0, 2), { label: "Pay", state: "error", optional: true }], interactive: true },
    });
    await expectNoViolations(container);
  });

  test("the dot's corners are concentric with the step's face, inset by the step's padding", async () => {
    const { container } = await render(EStepper, { props: { steps } });
    container.classList.add("e-root");
    const body = container.querySelector(".e-step-body")!;
    const dot = container.querySelector(".e-step-dot")!;
    const inset = parseFloat(getComputedStyle(body).paddingTop);
    for (const md of ["2px", "8px", "14px"]) {
      container.style.setProperty("--e-radius-md", md);
      const outer = parseFloat(getComputedStyle(body).borderTopLeftRadius);
      expect(parseFloat(getComputedStyle(dot).borderTopLeftRadius)).toBeCloseTo(Math.max(0, outer - inset), 0);
    }
  });
});
