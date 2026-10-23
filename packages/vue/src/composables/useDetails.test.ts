import { describe, expect, test } from "vitest";
import { defineComponent, h, nextTick, ref } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { useDetails } from "./useDetails.js";

function host(options: { group?: string; disabled?: boolean } = {}, start = false) {
  const open = ref<boolean | undefined>(start);
  const disabled = ref(options.disabled);
  const Comp = defineComponent({
    setup() {
      const { details, summary } = useDetails(open, { group: options.group, disabled });
      return () => h("details", details.value, [h("summary", summary.value, "Title"), h("p", "Body")]);
    },
  });
  return { open, disabled, Comp };
}

describe("useDetails", () => {
  test("a click and the keyboard write the native state back to the model", async () => {
    const { open, Comp } = host();
    const { container } = await render(Comp);
    await userEvent.click(page.getByText("Title").element());
    expect(open.value).toBe(true);
    await userEvent.keyboard("{Enter}");
    expect(open.value).toBe(false);
    await userEvent.keyboard(" ");
    expect(open.value).toBe(true);
    expect(container.querySelector("details")!.open).toBe(true);
  });

  test("the model opens and closes the details", async () => {
    const { open, Comp } = host();
    const { container } = await render(Comp);
    open.value = true;
    await nextTick();
    expect(container.querySelector("details")!.open).toBe(true);
    open.value = false;
    await nextTick();
    expect(container.querySelector("details")!.open).toBe(false);
  });

  test("details of one group open one at a time, and the closed one reports it", async () => {
    const a = host({ group: "g" });
    const b = host({ group: "g" });
    await render(a.Comp);
    await render(b.Comp);
    const [first, second] = [...document.querySelectorAll("summary")] as HTMLElement[];
    await userEvent.click(first!);
    await userEvent.click(second!);
    await expect.poll(() => a.open.value).toBe(false);
    expect(b.open.value).toBe(true);
  });

  test("disabled marks the summary and stops it toggling, by click or key", async () => {
    const { open, Comp } = host({ disabled: true });
    const { container } = await render(Comp);
    const summary = container.querySelector("summary")!;
    expect(summary.getAttribute("aria-disabled")).toBe("true");
    await userEvent.click(summary);
    await userEvent.keyboard("{Enter}");
    expect(open.value).toBe(false);
    expect(container.querySelector("details")!.open).toBe(false);
  });

  test("a disabled one can still be opened through the model", async () => {
    const { open, Comp } = host({ disabled: true });
    const { container } = await render(Comp);
    open.value = true;
    await nextTick();
    expect(container.querySelector("details")!.open).toBe(true);
  });
});
