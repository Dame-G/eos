import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EDetailRow from "./EDetailRow.vue";
import EPanel from "../Panel/EPanel.vue";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";

const text = (el: Element | null) => (el?.textContent ?? "").trim();

describe("EDetailRow", () => {
  test("shows the label as a kicker and the value from the slot", async () => {
    const { container } = await render(EDetailRow, {
      props: { label: "Email" },
      slots: { default: "sam@example.com" },
    });
    const root = container.firstElementChild!;
    expect(root.className).toBe("e-detail");
    const label = root.querySelector(".e-detail-label")!;
    expect(label.classList.contains("e-kicker")).toBe(true);
    expect(text(label)).toBe("Email");
    expect(text(root.querySelector(".e-detail-value"))).toBe("sam@example.com");
  });

  test("no listener, no Edit button; a spacer keeps the columns", async () => {
    const { container } = await render(EDetailRow, { props: { label: "Email" }, slots: { default: "a@b.c" } });
    expect(container.querySelector("button")).toBeNull();
    expect(container.querySelector(".e-detail-gap")!.getAttribute("aria-hidden")).toBe("true");
  });

  test("an edit listener adds a quiet Edit button named 'Edit {label}'", async () => {
    let edits = 0;
    const { container } = await render(EDetailRow, {
      props: { label: "Phone", onEdit: () => edits++ },
      slots: { default: "(555) 123-4567" },
    });
    const button = page.getByRole("button", { name: "Edit Phone" });
    await expect.element(button).toBeVisible();
    const el = container.querySelector("button")!;
    expect(el.classList.contains("e-btn--quiet")).toBe(true);
    expect(text(el)).toBe("Edit");
    await button.click();
    expect(edits).toBe(1);
  });

  test("keyboard: Tab reaches Edit; Enter and Space fire edit", async () => {
    let edits = 0;
    await render(EDetailRow, { props: { label: "Phone", onEdit: () => edits++ }, slots: { default: "x" } });
    await userEvent.tab();
    expect(document.activeElement!.getAttribute("aria-label")).toBe("Edit Phone");
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(edits).toBe(2);
  });

  test("status shows a chip with the tone; the spacer is gone", async () => {
    const { container } = await render(EDetailRow, {
      props: { label: "Email", status: "Verified", tone: "success" },
      slots: { default: "a@b.c" },
    });
    const chip = container.querySelector(".e-chip")!;
    expect(text(chip)).toBe("Verified");
    expect(chip.classList.contains("e-chip--success")).toBe(true);
    expect(container.querySelector(".e-detail-gap")).toBeNull();
  });

  test("the chip and Edit sit in their own columns at the end of the row", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { style: { width: "640px" } }, [
            h(EDetailRow, { label: "Email", status: "Needs update", tone: "warning", onEdit: () => {} }, () => "a@b.c"),
          ]),
      }),
    );
    const main = container.querySelector(".e-detail-main")!.getBoundingClientRect();
    const chip = container.querySelector(".e-chip")!.getBoundingClientRect();
    const btn = container.querySelector("button")!.getBoundingClientRect();
    expect(chip.left).toBeGreaterThanOrEqual(main.right - 1);
    expect(btn.left).toBeGreaterThanOrEqual(chip.right - 1);
  });

  test("a long value wraps inside its column instead of overflowing", async () => {
    const long = "a-very-long-address-without-any-breaks@example-organisation-with-a-long-name.example.com";
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { style: { width: "280px" } }, [h(EDetailRow, { label: "Email", onEdit: () => {} }, () => long)]),
      }),
    );
    const root = container.firstElementChild!;
    expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth + 1);
  });

  test("stacked in a Panel, only the first row has no rule above it", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h(EPanel, { title: "Details" }, () => [
            h(EDetailRow, { label: "Name" }, () => "Sam"),
            h(EDetailRow, { label: "Email" }, () => "a@b.c"),
          ]),
      }),
    );
    const rows = [...container.querySelectorAll<HTMLElement>(".e-detail")];
    expect(getComputedStyle(rows[0]!).borderTopWidth).toBe("0px");
    expect(parseFloat(getComputedStyle(rows[1]!).borderTopWidth)).toBeGreaterThan(0);
  });

  test("the Edit wording follows message overrides", async () => {
    await render(EDetailRow, {
      props: { label: "E-Mail", onEdit: () => {} },
      slots: { default: "a@b.c" },
      global: { plugins: [createEos({ themeTarget: null, messages: { edit: "Ändern", editItem: "{label} ändern" } })] },
    });
    await expect.element(page.getByRole("button", { name: "E-Mail ändern" })).toBeVisible();
    expect(text(document.querySelector("button"))).toBe("Ändern");
  });

  test("class, style and data attributes fall through to the root", async () => {
    const { container } = await render(EDetailRow, {
      props: { label: "Email" },
      attrs: { class: "mine", "data-x": "1" },
      slots: { default: "v" },
    });
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toBe("e-detail mine");
    expect(root.dataset.x).toBe("1");
  });

  test("axe: plain, with a chip, with Edit, every chip tone", async () => {
    const tones = ["neutral", "success", "info", "warning", "danger"] as const;
    const { container } = await render(
      defineComponent({
        render: () =>
          h(EPanel, { title: "Details" }, () => [
            h(EDetailRow, { label: "Name" }, () => "Sam"),
            h(EDetailRow, { label: "Email", onEdit: () => {} }, () => "a@b.c"),
            ...tones.map((tone) =>
              h(EDetailRow, { label: `Phone ${tone}`, status: tone, tone, onEdit: () => {} }, () => "x"),
            ),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});
