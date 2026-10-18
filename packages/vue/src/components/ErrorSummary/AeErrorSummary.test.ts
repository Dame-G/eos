import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeErrorSummary from "./AeErrorSummary.vue";
import { expectNoViolations } from "../../../test/axe.js";

const errors = [{ field: "Name", message: "Enter your name" }, { message: "Choose a date" }];

describe("AeErrorSummary", () => {
  test("takes focus, lists messages as plain text with an optional field name", async () => {
    const { container } = await render(AeErrorSummary, { props: { errors } });
    const root = container.querySelector<HTMLElement>(".ae-errsum")!;
    await expect.poll(() => document.activeElement).toBe(root);
    expect(container.querySelectorAll(".ae-errsum-list li").length).toBe(2);
    expect(container.querySelectorAll(".ae-errsum a").length).toBe(0);
    expect(container.querySelector(".ae-errsum-list strong")!.textContent).toBe("Name");
    expect(container.querySelectorAll(".ae-errsum-list li")[0]!.textContent!.replace(/\s+/g, " ").trim()).toBe(
      "Name: Enter your name",
    );
    expect(container.querySelectorAll(".ae-errsum-list li")[1]!.textContent!.trim()).toBe("Choose a date");
  });

  test("is an alert named by its heading, a danger notice without a second role", async () => {
    const { container } = await render(AeErrorSummary, { props: { errors } });
    await expect.element(page.getByRole("alert", { name: "There is a problem" })).toBeVisible();
    expect(container.querySelectorAll("[role=alert]").length).toBe(1);
    expect(container.querySelector(".ae-notice--danger")).not.toBeNull();
    expect(container.querySelector("h2.ae-notice-title")!.textContent).toBe("There is a problem");
  });

  test("title and headingLevel change the heading", async () => {
    const { container } = await render(AeErrorSummary, { props: { errors, title: "Fix these", headingLevel: 3 } });
    expect(container.querySelector("h3")!.textContent).toBe("Fix these");
  });

  test("renders nothing while there are no errors", async () => {
    const { container } = await render(AeErrorSummary, { props: { errors: [] } });
    expect(container.querySelector(".ae-errsum")).toBeNull();
  });

  test("takes focus when errors appear later, and again when their number changes", async () => {
    const list = ref<{ message: string }[]>([]);
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [h("input", { id: "other" }), h(AeErrorSummary, { errors: list.value, headingLevel: 2 })]),
      }),
    );
    (container.querySelector("#other") as HTMLElement).focus();
    list.value = [{ message: "One" }];
    await nextTick();
    await expect.poll(() => document.activeElement?.classList.contains("ae-errsum")).toBe(true);
    (container.querySelector("#other") as HTMLElement).focus();
    list.value = [{ message: "One" }, { message: "Two" }];
    await expect.poll(() => document.activeElement?.classList.contains("ae-errsum")).toBe(true);
  });

  test("autoFocus false leaves focus where it is", async () => {
    const { container } = await render(AeErrorSummary, { props: { errors, autoFocus: false } });
    expect(document.activeElement).not.toBe(container.querySelector(".ae-errsum"));
    expect(container.querySelector(".ae-errsum")!.getAttribute("tabindex")).toBe("-1");
  });

  test("class and data attributes fall through to the root", async () => {
    const { container } = await render(AeErrorSummary, { props: { errors }, attrs: { class: "mine", "data-x": "1" } });
    const el = container.querySelector<HTMLElement>(".ae-errsum")!;
    expect(el.classList.contains("mine")).toBe(true);
    expect(el.dataset.x).toBe("1");
  });

  test("axe finds nothing", async () => {
    const { container } = await render(AeErrorSummary, { props: { errors } });
    container.classList.add("ae-root");
    await expectNoViolations(container);
  });
});
