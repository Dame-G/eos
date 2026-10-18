import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EErrorSummary from "./EErrorSummary.vue";
import { expectNoViolations } from "../../../test/axe.js";

const errors = [{ field: "Name", message: "Enter your name" }, { message: "Choose a date" }];

describe("EErrorSummary", () => {
  test("takes focus, lists messages as plain text with an optional field name", async () => {
    const { container } = await render(EErrorSummary, { props: { errors } });
    const root = container.querySelector<HTMLElement>(".e-errsum")!;
    await expect.poll(() => document.activeElement).toBe(root);
    expect(container.querySelectorAll(".e-errsum-list li").length).toBe(2);
    expect(container.querySelectorAll(".e-errsum a").length).toBe(0);
    expect(container.querySelector(".e-errsum-list strong")!.textContent).toBe("Name");
    expect(container.querySelectorAll(".e-errsum-list li")[0]!.textContent!.replace(/\s+/g, " ").trim()).toBe(
      "Name: Enter your name",
    );
    expect(container.querySelectorAll(".e-errsum-list li")[1]!.textContent!.trim()).toBe("Choose a date");
  });

  test("is an alert named by its heading, a danger notice without a second role", async () => {
    const { container } = await render(EErrorSummary, { props: { errors } });
    await expect.element(page.getByRole("alert", { name: "There is a problem" })).toBeVisible();
    expect(container.querySelectorAll("[role=alert]").length).toBe(1);
    expect(container.querySelector(".e-notice--danger")).not.toBeNull();
    expect(container.querySelector("h2.e-notice-title")!.textContent).toBe("There is a problem");
  });

  test("title and headingLevel change the heading", async () => {
    const { container } = await render(EErrorSummary, { props: { errors, title: "Fix these", headingLevel: 3 } });
    expect(container.querySelector("h3")!.textContent).toBe("Fix these");
  });

  test("renders nothing while there are no errors", async () => {
    const { container } = await render(EErrorSummary, { props: { errors: [] } });
    expect(container.querySelector(".e-errsum")).toBeNull();
  });

  test("takes focus when errors appear later, and again when their number changes", async () => {
    const list = ref<{ message: string }[]>([]);
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [h("input", { id: "other" }), h(EErrorSummary, { errors: list.value, headingLevel: 2 })]),
      }),
    );
    (container.querySelector("#other") as HTMLElement).focus();
    list.value = [{ message: "One" }];
    await nextTick();
    await expect.poll(() => document.activeElement?.classList.contains("e-errsum")).toBe(true);
    (container.querySelector("#other") as HTMLElement).focus();
    list.value = [{ message: "One" }, { message: "Two" }];
    await expect.poll(() => document.activeElement?.classList.contains("e-errsum")).toBe(true);
  });

  test("autoFocus false leaves focus where it is", async () => {
    const { container } = await render(EErrorSummary, { props: { errors, autoFocus: false } });
    expect(document.activeElement).not.toBe(container.querySelector(".e-errsum"));
    expect(container.querySelector(".e-errsum")!.getAttribute("tabindex")).toBe("-1");
  });

  test("class and data attributes fall through to the root", async () => {
    const { container } = await render(EErrorSummary, { props: { errors }, attrs: { class: "mine", "data-x": "1" } });
    const el = container.querySelector<HTMLElement>(".e-errsum")!;
    expect(el.classList.contains("mine")).toBe(true);
    expect(el.dataset.x).toBe("1");
  });

  test("axe finds nothing", async () => {
    const { container } = await render(EErrorSummary, { props: { errors } });
    container.classList.add("e-root");
    await expectNoViolations(container);
  });
});
