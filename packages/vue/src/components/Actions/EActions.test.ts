import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EActions from "./EActions.vue";
import EButton from "../Button/EButton.vue";
import { expectNoViolations } from "../../../test/axe.js";

const buttons = () => [h(EButton, null, () => "Pay"), h(EButton, { variant: "outline" }, () => "Details")];

describe("EActions", () => {
  test("inline by default: a div with the buttons in order", async () => {
    const { container } = await render(EActions, { slots: { default: buttons } });
    const el = container.firstElementChild!;
    expect(el.tagName).toBe("DIV");
    expect(el.className).toBe("e-actions");
    expect([...el.querySelectorAll("button")].map((b) => b.textContent!.trim())).toEqual(["Pay", "Details"]);
  });

  test("bar adds the footer bar class with a rule above", async () => {
    const { container } = await render(EActions, { props: { bar: true }, slots: { default: buttons } });
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toBe("e-actions e-actions--bar");
    expect(getComputedStyle(el).borderTopWidth).not.toBe("0px");
  });

  test("`as` chooses the element", async () => {
    const { container } = await render(EActions, { props: { as: "footer", bar: true }, slots: { default: buttons } });
    expect(container.querySelector("footer.e-actions--bar")).not.toBeNull();
  });

  test("buttons sit side by side, left aligned, and wrap when there is no room", async () => {
    const { container } = await render(
      defineComponent({
        render: () => h("div", { style: { width: "600px" } }, [h(EActions, null, buttons)]),
      }),
    );
    const [a, b] = [...container.querySelectorAll<HTMLElement>(".e-btn")];
    expect(Math.abs(a!.getBoundingClientRect().top - b!.getBoundingClientRect().top)).toBeLessThan(1);
    expect(a!.getBoundingClientRect().left).toBeLessThan(b!.getBoundingClientRect().left);

    const narrow = await render(
      defineComponent({
        render: () => h("div", { style: { width: "120px" } }, [h(EActions, null, buttons)]),
      }),
    );
    const [c, d] = [...narrow.container.querySelectorAll<HTMLElement>(".e-btn")];
    expect(d!.getBoundingClientRect().top).toBeGreaterThan(c!.getBoundingClientRect().bottom - 1);
  });

  test("on a phone a bar's buttons stack full width", async () => {
    await page.viewport(375, 700);
    try {
      const { container } = await render(EActions, { props: { bar: true }, slots: { default: buttons } });
      const [a, b] = [...container.querySelectorAll<HTMLElement>(".e-btn")];
      expect(b!.getBoundingClientRect().top).toBeGreaterThan(a!.getBoundingClientRect().bottom - 1);
      expect(Math.round(a!.getBoundingClientRect().width)).toBe(Math.round(b!.getBoundingClientRect().width));
    } finally {
      await page.viewport(1024, 768);
    }
  });

  test('stack="narrow" stacks full width in a narrow container and not in a wide one; always stacks at every width', async () => {
    const at = (width: number, stack: "narrow" | "always") =>
      render(
        defineComponent({
          render: () => h("div", { style: { width: `${width}px` } }, [h(EActions, { stack }, buttons)]),
        }),
      );
    const stacked = (c: Element) => {
      const [a, b] = [...c.querySelectorAll<HTMLElement>(".e-btn")];
      return (
        b!.getBoundingClientRect().top >= a!.getBoundingClientRect().bottom - 1 &&
        a!.getBoundingClientRect().width > 300
      );
    };
    expect(stacked((await at(340, "narrow")).container)).toBe(true);
    expect(stacked((await at(900, "narrow")).container)).toBe(false);
    const always = (await at(900, "always")).container;
    const [a] = [...always.querySelectorAll<HTMLElement>(".e-btn")];
    expect(a!.getBoundingClientRect().width).toBeGreaterThan(800);
  });

  test("class, style and attributes fall through to the root", async () => {
    const { container } = await render(EActions, {
      attrs: { class: "mine", style: "margin-top: 3px", "aria-label": "Row actions", role: "group", "data-x": "1" },
      slots: { default: buttons },
    });
    const el = container.firstElementChild as HTMLElement;
    expect(el.classList.contains("mine")).toBe(true);
    expect(el.style.marginTop).toBe("3px");
    await expect.element(page.getByRole("group", { name: "Row actions" })).toBeVisible();
  });

  test("the buttons are reached in order with Tab", async () => {
    await render(EActions, { slots: { default: buttons } });
    await userEvent.tab();
    await expect.element(page.getByRole("button", { name: "Pay" })).toHaveFocus();
    await userEvent.tab();
    await expect.element(page.getByRole("button", { name: "Details" })).toHaveFocus();
  });

  test("a label makes it a named group; without one it has no role", async () => {
    const { container } = await render(EActions, { props: { label: "Record actions" }, slots: { default: buttons } });
    await expect.element(page.getByRole("group", { name: "Record actions" })).toBeVisible();
    const plain = await render(EActions, { slots: { default: buttons } });
    expect(plain.container.firstElementChild!.hasAttribute("role")).toBe(false);
    expect(container.querySelectorAll("button").length).toBe(2);
  });

  test("has no accessibility violations inline or as a bar", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(EActions, null, buttons),
            h(EActions, { bar: true, as: "footer" }, buttons),
            h(EActions, { label: "Tools" }, buttons),
          ]),
      }),
    );
    await expectNoViolations(container);
  });

  test("buttons in the group are spaced by gap-snug", async () => {
    const { container } = await render(EActions, { slots: { default: buttons } });
    container.classList.add("e-root");
    expect(getComputedStyle(container.querySelector(".e-actions")!).columnGap).toBe("8px");
  });
});

describe("EActions stack never", () => {
  test("a bar keeps its buttons side by side in a narrow container and ends them at the end edge", async () => {
    const stage = (stack?: "never") =>
      render(
        defineComponent({
          render: () =>
            h("div", { style: "width: 280px" }, [
              h(EActions, { bar: true, stack }, () => [
                h(EButton, () => "Save"),
                h(EButton, { variant: "outline" }, () => "Cancel"),
              ]),
            ]),
        }),
      );
    const stacked = await stage();
    const [a, b] = [...stacked.container.querySelectorAll(".e-btn")].map((e) => e.getBoundingClientRect());
    expect(b!.top).toBeGreaterThan(a!.top + 10);
    stacked.unmount();
    const row = await stage("never");
    const [c, d] = [...row.container.querySelectorAll(".e-btn")].map((e) => e.getBoundingClientRect());
    expect(Math.abs(c!.top - d!.top)).toBeLessThan(2);
    const bar = row.container.querySelector(".e-actions")!.getBoundingClientRect();
    expect(bar.right - d!.right).toBeLessThan(40);
  });
});
