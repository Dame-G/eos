import { describe, expect, test } from "vitest";
import { defineComponent, h, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EConfirmDialog from "./EConfirmDialog.vue";
import { expectNoViolations } from "../../../test/axe.js";

function host(props: Record<string, unknown> = {}) {
  const open = ref(true);
  const log = ref<string[]>([]);
  const Host = defineComponent({
    render: () =>
      h(
        EConfirmDialog,
        {
          title: "Delete this game?",
          description: "It cannot be restored.",
          open: open.value,
          "onUpdate:open": (v?: boolean) => (open.value = !!v),
          onConfirm: () => log.value.push("confirm"),
          onCancel: () => log.value.push("cancel"),
          ...props,
        },
        { default: () => "Its review goes with it." },
      ),
  });
  return { Host, open, log };
}

describe("EConfirmDialog", () => {
  test("is an alert dialog named by its question, and focus starts on Cancel", async () => {
    const { Host } = host({ tone: "danger", confirmLabel: "Delete game" });
    await render(Host);
    await expect.element(page.getByRole("alertdialog", { name: "Delete this game?" })).toBeVisible();
    await expect.element(page.getByRole("button", { name: "Cancel" })).toHaveFocus();
    await expect.element(page.getByText("It cannot be restored.")).toBeVisible();
    const confirm = document.querySelector<HTMLElement>(".e-btn--danger");
    expect(confirm?.textContent?.trim()).toBe("Delete game");
  });

  test("focus='confirm' starts on the confirming button", async () => {
    const { Host } = host({ focus: "confirm" });
    await render(Host);
    await expect.element(page.getByRole("button", { name: "Confirm" })).toHaveFocus();
  });

  test("Confirm emits and closes; Cancel and Escape emit cancel", async () => {
    const a = host();
    await render(a.Host);
    await page.getByRole("button", { name: "Confirm" }).click();
    expect(a.log.value).toEqual(["confirm"]);
    expect(a.open.value).toBe(false);

    const b = host();
    await render(b.Host);
    await page.getByRole("button", { name: "Cancel" }).click();
    expect(b.log.value).toEqual(["cancel"]);
    expect(b.open.value).toBe(false);

    const c = host();
    await render(c.Host);
    await userEvent.keyboard("{Escape}");
    expect(c.log.value).toEqual(["cancel"]);
  });

  test("closeOnConfirm off leaves it open, and loading ignores Confirm", async () => {
    const a = host({ closeOnConfirm: false });
    await render(a.Host);
    await page.getByRole("button", { name: "Confirm" }).click();
    expect(a.open.value).toBe(true);
    expect(a.log.value).toEqual(["confirm"]);

    const b = host({ loading: true, closeOnConfirm: false });
    await render(b.Host);
    await page.getByRole("button", { name: "Confirm" }).click({ force: true });
    expect(b.log.value).toEqual([]);
  });

  test("the buttons stay side by side in a narrow dialog", async () => {
    const { Host } = host();
    await render(Host);
    const [a, b] = [...document.querySelectorAll<HTMLElement>(".e-dialog-foot .e-btn")];
    expect(Math.abs(a!.getBoundingClientRect().top - b!.getBoundingClientRect().top)).toBeLessThan(2);
  });

  test("has no axe violations", async () => {
    const { Host } = host({ tone: "danger" });
    await render(Host);
    await expectNoViolations(document.body);
  });
});
