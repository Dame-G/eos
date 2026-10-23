// Arrow keys in a right-to-left page follow the reading direction: the key that points towards the end of the line
// (ArrowLeft) moves forward, the one that points towards its start (ArrowRight) moves back. The app says so with
// createEos({ dir: "rtl" }), which also sets dir on the page; here the page is a wrapper of its own.
import { describe, expect, test } from "vitest";
import { defineComponent, h, ref, type Component } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { createEos } from "../src/plugin.js";
import ESlider from "../src/components/Slider/ESlider.vue";
import EMenu from "../src/components/Menu/EMenu.vue";
import ETabs from "../src/components/Tabs/ETabs.vue";
import EDataGrid from "../src/components/DataGrid/EDataGrid.vue";
import EOtpField from "../src/components/OtpField/EOtpField.vue";

const rtl = { plugins: [createEos({ dir: "rtl", themeTarget: null })] };
/** Renders `child` in a right-to-left block, with the app set to right to left. */
const inRtl = (child: () => unknown) =>
  render(defineComponent({ render: () => h("div", { dir: "rtl" }, [child()]) }), { global: rtl });

describe("right to left keyboard", () => {
  test("ESlider: ArrowRight lowers the value and ArrowLeft raises it", async () => {
    const model = ref(50);
    await inRtl(() =>
      h(ESlider, {
        label: "Volume",
        modelValue: model.value,
        "onUpdate:modelValue": (v: unknown) => (model.value = v as number),
      }),
    );
    await userEvent.tab();
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => model.value).toBe(49);
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    await expect.poll(() => model.value).toBe(51);
  });

  test("EMenu: ArrowLeft opens a submenu and ArrowRight closes it", async () => {
    const { container } = await inRtl(() =>
      h(EMenu, {
        label: "More",
        items: [{ type: "submenu", label: "Share", items: [{ label: "Email" }, { label: "Link" }] }],
      }),
    );
    await container.querySelector<HTMLButtonElement>("button.e-btn")!.click();
    await expect.poll(() => document.activeElement?.textContent?.trim()).toBe("Share");
    // The physical key that opens a submenu in a left-to-right page does nothing here.
    await userEvent.keyboard("{ArrowRight}");
    expect(document.querySelectorAll("[role=menu]")).toHaveLength(1);
    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(() => document.querySelectorAll("[role=menu]").length).toBe(2);
    await expect.poll(() => document.activeElement?.textContent?.trim()).toBe("Email");
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => document.querySelectorAll("[role=menu]").length).toBe(1);
    await expect.poll(() => document.activeElement?.textContent?.trim()).toBe("Share");
  });

  test("ETabs: ArrowLeft goes to the next tab and ArrowRight to the one before", async () => {
    const model = ref("a");
    const items = [
      { id: "a", label: "One" },
      { id: "b", label: "Two" },
      { id: "c", label: "Three" },
    ];
    await inRtl(() =>
      h(
        ETabs,
        { items, modelValue: model.value, "onUpdate:modelValue": (v?: string) => (model.value = v!) },
        { a: () => "A", b: () => "B", c: () => "C" },
      ),
    );
    await page.getByRole("tab", { name: "One" }).click();
    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(() => model.value).toBe("b");
    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(() => model.value).toBe("c");
    await userEvent.keyboard("{ArrowRight}");
    await expect.poll(() => model.value).toBe("b");
  });

  test("EDataGrid: on a column's resize edge, ArrowLeft widens the column and ArrowRight narrows it", async () => {
    const { container } = await inRtl(() =>
      h(EDataGrid as Component, {
        cards: false,
        caption: "Invoices",
        rows: [{ id: 1, n: "Alpha" }],
        resizable: true,
        columns: [{ key: "n", label: "Name", width: 2000, minWidth: 100 }],
      }),
    );
    const sep = container.querySelector<HTMLElement>("[role=separator]")!;
    const width = () => container.querySelector<HTMLElement>("col")?.style.width;
    sep.focus();
    await userEvent.keyboard("{ArrowLeft}");
    await expect.poll(width).toBe("2010px");
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await expect.poll(width).toBe("1990px");
  });

  test("EOtpField: ArrowLeft moves to the next box and ArrowRight to the one before", async () => {
    const { container } = await inRtl(() => h(EOtpField, { label: "Code", modelValue: "1234" }));
    const boxes = [...container.querySelectorAll<HTMLInputElement>("input.e-otp-box")];
    boxes[2]!.focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(boxes[3]);
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    expect(document.activeElement).toBe(boxes[1]);
  });
});
