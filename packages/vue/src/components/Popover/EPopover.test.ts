import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EPopover from "./EPopover.vue";
import EButton from "../Button/EButton.vue";
import { expectNoViolations } from "../../../test/axe.js";

const panel = () => document.querySelector<HTMLElement>(".e-popover");

function mount(props: Record<string, unknown> = {}, slots: Record<string, unknown> = {}) {
  return render(
    defineComponent({
      render: () =>
        h("div", { style: "padding: 40px" }, [
          h(
            EPopover,
            { label: "Background work", ...props },
            {
              trigger: ({ open }: { open: boolean }) =>
                h(EButton, { variant: "outline", "data-open": String(open) }, () => "Queue"),
              default: () => [
                h("p", "Two tests are running."),
                h(EButton, { variant: "quiet" }, () => "Pause"),
                h(EButton, { variant: "quiet" }, () => "Stop"),
                h(EButton, { variant: "quiet" }, () => "Show all"),
              ],
              ...slots,
            },
          ),
          h("button", { type: "button" }, "Elsewhere"),
        ]),
    }),
  );
}
const trigger = () => page.getByRole("button", { name: "Queue" }).element() as HTMLButtonElement;

describe("EPopover", () => {
  test("the trigger is the consumer's own control, wired with aria-haspopup, aria-expanded and aria-controls", async () => {
    await mount();
    const b = trigger();
    expect(b.classList.contains("e-btn")).toBe(true);
    expect(b.getAttribute("aria-haspopup")).toBe("dialog");
    expect(b.getAttribute("aria-expanded")).toBe("false");
    expect(b.getAttribute("data-open")).toBe("false");
    expect(panel()).toBeNull();
    await b.click();
    await expect.poll(() => panel()).not.toBeNull();
    expect(b.getAttribute("aria-expanded")).toBe("true");
    await expect.poll(() => b.getAttribute("data-open")).toBe("true");
    expect(b.getAttribute("aria-controls")).toBe(panel()!.id);
  });

  test("opens a non-modal dialog named by the label, under the trigger and 8px away", async () => {
    await mount();
    await trigger().click();
    const dialog = page.getByRole("dialog", { name: "Background work" });
    await expect.element(dialog).toBeVisible();
    expect(panel()!.getAttribute("aria-modal")).toBeNull();
    const t = trigger().getBoundingClientRect();
    await expect.poll(() => Math.round(panel()!.getBoundingClientRect().top - t.bottom)).toBe(8);
    expect(Math.round(panel()!.getBoundingClientRect().left)).toBe(Math.round(t.left));
  });

  test("side top opens above the trigger when there is room", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { style: "padding-top: 400px" }, [
            h(
              EPopover,
              { label: "Above", side: "top" },
              { trigger: () => h(EButton, null, () => "Up"), default: () => "Body" },
            ),
          ]),
      }),
    );
    const up = container.querySelector("button")!;
    await up.click();
    await expect.poll(() => panel()).not.toBeNull();
    await expect.poll(() => panel()!.getBoundingClientRect().bottom <= up.getBoundingClientRect().top).toBe(true);
  });

  test("side top flips below the trigger when there is no room above", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h(
            EPopover,
            { label: "Flipped", side: "top" },
            { trigger: () => h(EButton, null, () => "Flip"), default: () => "Body" },
          ),
      }),
    );
    const flip = container.querySelector("button")!;
    await flip.click();
    await expect.poll(() => panel()).not.toBeNull();
    await expect.poll(() => panel()!.getBoundingClientRect().top >= flip.getBoundingClientRect().bottom).toBe(true);
  });

  test("Escape closes it and returns focus to the trigger; an outside press closes it", async () => {
    await mount();
    await userEvent.tab();
    expect(document.activeElement).toBe(trigger());
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => panel()).not.toBeNull();
    await expect.poll(() => panel()!.contains(document.activeElement)).toBe(true);
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => panel()).toBeNull();
    await expect.poll(() => document.activeElement).toBe(trigger());
    await trigger().click();
    await expect.poll(() => panel()).not.toBeNull();
    await page.getByRole("button", { name: "Elsewhere" }).click();
    await expect.poll(() => panel()).toBeNull();
  });

  test("Up and Down move between the panel's controls, wrapping, and Home and End go to the ends", async () => {
    await mount();
    await trigger().click();
    await expect.poll(() => panel()?.contains(document.activeElement)).toBe(true);
    const name = () => document.activeElement?.textContent?.trim();
    expect(name()).toBe("Pause");
    await userEvent.keyboard("{ArrowDown}");
    expect(name()).toBe("Stop");
    await userEvent.keyboard("{ArrowDown}");
    expect(name()).toBe("Show all");
    await userEvent.keyboard("{ArrowDown}");
    expect(name()).toBe("Pause");
    await userEvent.keyboard("{ArrowUp}");
    expect(name()).toBe("Show all");
    await userEvent.keyboard("{Home}");
    expect(name()).toBe("Pause");
    await userEvent.keyboard("{End}");
    expect(name()).toBe("Show all");
  });

  test("a field inside keeps its own arrow keys", async () => {
    await mount({}, { default: () => [h("input", { "aria-label": "Filter", value: "abc" }), h("button", "Go")] });
    await trigger().click();
    await expect.poll(() => panel()?.querySelector("input")).toBeTruthy();
    const field = panel()!.querySelector("input")!;
    field.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(field);
  });

  test("a title adds a heading and a Close button that closes it and returns focus", async () => {
    await mount({ title: "Queue" });
    await trigger().click();
    await expect.element(page.getByRole("dialog", { name: "Queue" })).toBeVisible();
    expect(panel()!.querySelector(".e-pop-title")!.tagName).toBe("H3");
    await page.getByRole("button", { name: "Close" }).click();
    await expect.poll(() => panel()).toBeNull();
    await expect.poll(() => document.activeElement).toBe(trigger());
  });

  test("actions sit in a footer bar after the body", async () => {
    await mount({}, { actions: () => h(EButton, { variant: "outline" }, () => "Open the queue") });
    await trigger().click();
    await expect.poll(() => panel()).not.toBeNull();
    const bar = panel()!.querySelector(".e-actions--bar")!;
    expect(bar.previousElementSibling!.classList.contains("e-pop-body")).toBe(true);
  });

  test("v-model opens and closes it", async () => {
    const open = ref(false);
    await render(
      defineComponent({
        render: () =>
          h(
            EPopover,
            { label: "About", modelValue: open.value, "onUpdate:modelValue": (v: boolean) => (open.value = v) },
            { trigger: () => h(EButton, null, () => "Queue"), default: () => "Body" },
          ),
      }),
    );
    open.value = true;
    await nextTick();
    await expect.poll(() => panel()).not.toBeNull();
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => open.value).toBe(false);
  });

  test("class, style and attributes land on the panel", async () => {
    await render(EPopover, {
      props: { label: "About", modelValue: true },
      attrs: { class: "mine", "data-test": "x" },
      slots: { trigger: () => h(EButton, null, () => "Queue"), default: () => "Body" },
    });
    await expect.poll(() => panel()).not.toBeNull();
    expect(panel()!.classList.contains("mine")).toBe(true);
    expect(panel()!.getAttribute("data-test")).toBe("x");
  });

  test("has no axe violations, closed and open", async () => {
    const { container } = await mount({ title: "Queue" });
    await expectNoViolations(container);
    await trigger().click();
    await expect.poll(() => panel()).not.toBeNull();
    await expectNoViolations(document.body);
  });
});
