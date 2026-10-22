import { describe, expect, test } from "vitest";
import { defineComponent, h, ref } from "vue";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EUpload from "./EUpload.vue";
import { expectNoViolations } from "../../../test/axe.js";

const file = (name: string, size = 2048, type = "application/pdf") => new File([new Uint8Array(size)], name, { type });

function listOf(...files: File[]): DataTransfer {
  const data = new DataTransfer();
  files.forEach((f) => data.items.add(f));
  return data;
}

function choose(input: HTMLInputElement, ...files: File[]) {
  input.files = listOf(...files).files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
}

function drop(target: Element, ...files: File[]) {
  const event = new DragEvent("drop", { dataTransfer: listOf(...files), bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
}

describe("EUpload", () => {
  test("the whole dropzone is the label of a file input, and the field label names it too", async () => {
    const { container } = await render(EUpload, { props: { label: "Insurance card" } });
    const input = container.querySelector<HTMLInputElement>("input[type=file]")!;
    expect(input.className).toBe("e-drop-input");
    expect(input.labels!.length).toBe(2);
    const text = [...input.labels!].map((l) => l.textContent!.replace(/\s+/g, " ").trim());
    expect(text).toContain("Insurance card");
    expect(text).toContain("Drag a file here or choose one");
    expect(container.querySelector("label.e-drop")!.getAttribute("for")).toBe(input.id);
    expect(container.querySelector("label.e-drop svg.e-icon")).not.toBeNull();
  });

  test("accept shows as a hint inside the zone and goes to the input", async () => {
    const { container } = await render(EUpload, { props: { label: "Card", accept: ".pdf,.jpg" } });
    expect(container.querySelector(".e-drop-hint")!.textContent).toBe("PDF, JPG");
    expect(container.querySelector("input")!.accept).toBe(".pdf,.jpg");
  });

  test("choosing files lists them with their size, emits the files and updates v-model", async () => {
    const model = ref<File[]>([]);
    const emitted: File[][] = [];
    const { container } = await render(
      defineComponent({
        render: () =>
          h(EUpload, {
            label: "Card",
            multiple: true,
            modelValue: model.value,
            "onUpdate:modelValue": (v: File[]) => (model.value = v),
            onFiles: (v: File[]) => emitted.push(v),
          }),
      }),
    );
    choose(container.querySelector("input")!, file("front.pdf", 2048), file("back.pdf", 100));
    await new Promise((r) => setTimeout(r, 0));
    expect(emitted.length).toBe(1);
    expect(emitted[0]!.map((f) => f.name)).toEqual(["front.pdf", "back.pdf"]);
    expect(model.value.length).toBe(2);
    const rows = [...container.querySelectorAll(".e-files li")];
    expect(rows.map((r) => r.querySelector(".e-file-name")!.textContent)).toEqual(["front.pdf", "back.pdf"]);
    expect(rows.map((r) => r.querySelector(".e-file-size")!.textContent)).toEqual(["2 kB", "100 byte"]);
  });

  test("sizes use bytes, kilobytes or megabytes", async () => {
    const { container } = await render(EUpload, { props: { label: "Card", multiple: true } });
    choose(container.querySelector("input")!, file("a.pdf", 5 * 1024 * 1024 + 512 * 1024), file("b.pdf", 0));
    await new Promise((r) => setTimeout(r, 0));
    const sizes = [...container.querySelectorAll(".e-file-size")].map((s) => s.textContent);
    expect(sizes).toEqual(["5.5 MB", "0 byte"]);
  });

  test("without multiple, a drop of three files keeps the first", async () => {
    const { container } = await render(EUpload, { props: { label: "Card" } });
    drop(container.querySelector(".e-drop")!, file("1.pdf"), file("2.pdf"), file("3.pdf"));
    await new Promise((r) => setTimeout(r, 0));
    expect([...container.querySelectorAll(".e-file-name")].map((n) => n.textContent)).toEqual(["1.pdf"]);
    expect(container.querySelector("input")!.files!.length).toBe(1);
  });

  test("accept filters dropped and chosen files by extension, MIME type and wildcard, ignoring case", async () => {
    const { container } = await render(EUpload, {
      props: { label: "Card", multiple: true, accept: ".pdf, image/png,audio/*" },
    });
    const names = () => [...container.querySelectorAll(".e-file-name")].map((n) => n.textContent);
    drop(
      container.querySelector(".e-drop")!,
      file("a.PDF", 10, ""),
      file("virus.exe", 10, "application/x-msdownload"),
      file("pic", 10, "image/png"),
      file("pic2", 10, "image/jpeg"),
      file("song", 10, "audio/mpeg"),
    );
    await new Promise((r) => setTimeout(r, 0));
    expect(names()).toEqual(["a.PDF", "pic", "song"]);
    choose(container.querySelector("input")!, file("b.exe", 10, "application/x-msdownload"));
    await new Promise((r) => setTimeout(r, 0));
    expect(names()).toEqual([]);
  });

  test("announces how many files were added and how many were not accepted", async () => {
    const { container } = await render(EUpload, { props: { label: "Card", multiple: true, accept: ".pdf" } });
    const said = (kind: string) =>
      document.querySelector(`[data-e-announcer=${kind}]`)?.textContent?.replace(/\u00a0/g, "");
    drop(container.querySelector(".e-drop")!, file("a.pdf"), file("b.pdf"));
    await expect.poll(() => said("polite")).toBe("2 files added");
    drop(container.querySelector(".e-drop")!, file("c.pdf"), file("d.exe", 10, "x/y"));
    await expect.poll(() => said("assertive")).toBe("1 file added. 1 file was not accepted");
    drop(container.querySelector(".e-drop")!, file("e.exe", 10, "x/y"), file("f.exe", 10, "x/y"));
    await expect.poll(() => said("assertive")).toMatch(/^2 files were not accepted/);
  });

  test("files with the same name are all listed, and each can be removed with a labelled button", async () => {
    const model = ref<File[]>([]);
    const { container } = await render(
      defineComponent({
        render: () =>
          h(EUpload, {
            label: "Card",
            multiple: true,
            modelValue: model.value,
            "onUpdate:modelValue": (v: File[]) => (model.value = v),
          }),
      }),
    );
    choose(container.querySelector("input")!, file("scan.pdf", 100), file("scan.pdf", 200), file("other.pdf"));
    await new Promise((r) => setTimeout(r, 0));
    expect(container.querySelectorAll(".e-files li").length).toBe(3);
    const buttons = container.querySelectorAll<HTMLButtonElement>(".e-files button");
    expect(buttons[0]!.getAttribute("aria-label")).toBe("Remove scan.pdf");
    buttons[1]!.click();
    await new Promise((r) => setTimeout(r, 0));
    expect(model.value.map((f) => f.size)).toEqual([100, 2048]);
    expect(container.querySelectorAll(".e-files li").length).toBe(2);
    expect(container.querySelector("input")!.files!.length).toBe(2);
    expect(document.activeElement).toBe(container.querySelector("input"));
    await expect
      .poll(() => document.querySelector("[data-e-announcer=polite]")?.textContent?.replace(/\u00a0/g, ""))
      .toBe("Removed scan.pdf");
  });

  test("an invalid zone gets a danger edge, a disabled one keeps the disabled look", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { class: "e-root" }, [
            h(EUpload, { label: "Bad", error: "Too large" }),
            h(EUpload, { label: "Off", error: "Too large", disabled: true }),
            h(EUpload, { label: "Fine" }),
          ]),
      }),
    );
    const [bad, off, fine] = [...container.querySelectorAll<HTMLElement>(".e-drop")];
    expect(bad!.hasAttribute("data-invalid")).toBe(true);
    const danger = (el: Element) => getComputedStyle(el).outlineColor;
    expect(danger(bad!)).not.toBe(danger(fine!));
    expect(danger(off!)).toBe(danger(fine!));
  });

  test("without v-model it still lists the chosen files", async () => {
    const { container } = await render(EUpload, { props: { label: "Card" } });
    choose(container.querySelector("input")!, file("one.pdf"));
    await new Promise((r) => setTimeout(r, 0));
    expect(container.querySelectorAll(".e-files li").length).toBe(1);
  });

  test("dropping files on the zone takes them; dragging over highlights the zone", async () => {
    const emitted: File[][] = [];
    const { container } = await render(EUpload, {
      props: { label: "Card", onFiles: (v: File[]) => emitted.push(v) },
    });
    const zone = container.querySelector(".e-drop")!;
    zone.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true }));
    await new Promise((r) => setTimeout(r, 0));
    expect(zone.classList.contains("e-drop--over")).toBe(true);
    const event = drop(zone, file("dropped.pdf"));
    await new Promise((r) => setTimeout(r, 0));
    expect(event.defaultPrevented).toBe(true);
    expect(zone.classList.contains("e-drop--over")).toBe(false);
    expect(emitted[0]!.map((f) => f.name)).toEqual(["dropped.pdf"]);
    expect(container.querySelector(".e-file-name")!.textContent).toBe("dropped.pdf");
  });

  test("leaving the zone clears the highlight", async () => {
    const { container } = await render(EUpload, { props: { label: "Card" } });
    const zone = container.querySelector(".e-drop")!;
    zone.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true }));
    await new Promise((r) => setTimeout(r, 0));
    zone.dispatchEvent(new DragEvent("dragleave", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    expect(zone.classList.contains("e-drop--over")).toBe(false);
  });

  test("a disabled upload ignores drops and dims its edge", async () => {
    const emitted: File[][] = [];
    const { container } = await render(EUpload, {
      props: { label: "Card", disabled: true, onFiles: (v: File[]) => emitted.push(v) },
    });
    const zone = container.querySelector(".e-drop")!;
    zone.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true }));
    drop(zone, file("x.pdf"));
    await new Promise((r) => setTimeout(r, 0));
    expect(emitted.length).toBe(0);
    expect(zone.classList.contains("e-drop--over")).toBe(false);
    expect(zone.classList.contains("e-drop--disabled")).toBe(true);
    expect(container.querySelector("input")!.disabled).toBe(true);
  });

  test("keyboard: the input takes focus and the zone shows the focus outline", async () => {
    const { container } = await render(EUpload, { props: { label: "Card" } });
    await userEvent.tab();
    expect(document.activeElement).toBe(container.querySelector("input"));
    expect(getComputedStyle(container.querySelector(".e-drop")!).outlineStyle).toBe("solid");
  });

  test("multiple, name and required reach the input", async () => {
    const { container } = await render(EUpload, {
      props: { label: "Card", multiple: true, name: "docs", required: true },
    });
    const input = container.querySelector("input")!;
    expect(input.multiple).toBe(true);
    expect(input.name).toBe("docs");
    expect(input.required).toBe(true);
    expect(container.querySelector(".e-field-flag")!.textContent).toBe("Required");
  });

  test("a hint is linked to the input; an error replaces it, marks it invalid and is announced", async () => {
    const hinted = await render(EUpload, { props: { label: "Card", hint: "PDF up to 5 MB" } });
    expect(hinted.container.querySelector("input")!.getAttribute("aria-describedby")).toBe(
      hinted.container.querySelector(".e-field-hint")!.id,
    );
    const bad = await render(EUpload, { props: { label: "Card", hint: "Hint", error: "File too large" } });
    expect(bad.container.querySelector(".e-field-hint")).toBeNull();
    expect(bad.container.querySelector(".e-field-error")!.getAttribute("role")).toBe("alert");
    expect(bad.container.querySelector("input")!.getAttribute("aria-invalid")).toBe("true");
  });

  test("the hint sits 8px under the zone and the zone is a dashed box", async () => {
    const { container } = await render(EUpload, { props: { label: "Card", hint: "Hint" } });
    container.classList.add("e-root");
    const zone = container.querySelector(".e-drop")!;
    const hint = container.querySelector(".e-field-hint")!.getBoundingClientRect();
    expect(getComputedStyle(zone).outlineStyle).toBe("dashed");
    expect(hint.top - zone.getBoundingClientRect().bottom).toBe(8);
  });

  test("attributes land on the file input, class and style on the wrapper", async () => {
    const { container } = await render(EUpload, {
      props: { label: "Card" },
      attrs: { "data-x": "1", class: "mine" },
    });
    expect(container.querySelector("input")!.dataset["x"]).toBe("1");
    expect(container.firstElementChild!.className).toBe("e-field mine");
  });

  test("has no accessibility violations in any state", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(EUpload, { label: "Plain" }),
            h(EUpload, { label: "Hinted", hint: "PDF up to 5 MB", accept: ".pdf", required: true }),
            h(EUpload, { label: "Invalid", error: "File too large", optional: true }),
            h(EUpload, { label: "Disabled", disabled: true }),
            h(EUpload, { label: "With files", modelValue: [file("a.pdf")], multiple: true }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});
