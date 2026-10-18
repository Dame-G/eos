import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeCardField from "./AeCardField.vue";
import { expectNoViolations } from "../../../test/axe.js";

const provider = () => h("span", { style: "color: var(--ae-muted)" }, "1234 5678 9012 3456");

describe("AeCardField", () => {
  test("is a group named by its label, with a mount point for the provider and a note", async () => {
    const { container } = await render(AeCardField, { slots: { default: provider } });
    await expect.element(page.getByRole("group", { name: "Card details" })).toBeVisible();
    const mount = container.querySelector(".ae-cardfield-mount")!;
    expect(mount.textContent).toBe("1234 5678 9012 3456");
    await expect.element(page.getByText(/never see or store them/)).toBeVisible();
    expect(container.querySelector(".ae-cardfield-note svg")).not.toBeNull();
    expect(container.querySelector(".ae-cardfield")!.getAttribute("data-state")).toBe("ready");
  });

  test("renders no card inputs of its own", async () => {
    const { container } = await render(AeCardField);
    expect(container.querySelector("input, textarea, select")).toBeNull();
  });

  test("a custom label, note and required flag are used", async () => {
    await render(AeCardField, { props: { label: "Pay with card", note: "Handled by Stripe.", required: true } });
    await expect.element(page.getByRole("group", { name: /Pay with card/ })).toBeVisible();
    await expect.element(page.getByText("Handled by Stripe.")).toBeVisible();
    await expect.element(page.getByText("Required")).toBeVisible();
  });

  test("mountId names the mount point and the exposed element is that same div", async () => {
    const { container } = await render(AeCardField, { props: { mountId: "card-mount" } });
    expect(container.querySelector("#card-mount.ae-cardfield-mount")).not.toBeNull();
    const generated = await render(AeCardField, { props: { id: "pay" } });
    expect(generated.container.querySelector("#pay-mount")).not.toBeNull();
  });

  test("a provider can mount into the exposed element", async () => {
    let mountEl: HTMLElement | null = null;
    const { container } = await render(
      defineComponent({
        render: () =>
          h(AeCardField, { ref: (r: unknown) => (mountEl = (r as { mount: HTMLElement } | null)?.mount ?? null) }),
      }),
    );
    expect(mountEl).toBe(container.querySelector(".ae-cardfield-mount"));
    const el = document.createElement("div");
    el.id = "hosted-field";
    mountEl!.appendChild(el);
    expect(container.querySelector(".ae-cardfield-mount #hosted-field")).not.toBeNull();
  });

  test("loading shows a spinner and announces it", async () => {
    const { container } = await render(AeCardField, {
      props: { state: "loading" },
      slots: { default: provider },
    });
    expect(container.querySelector(".ae-cardfield")!.getAttribute("data-state")).toBe("loading");
    await expect.element(page.getByRole("status")).toHaveTextContent("Loading secure card fields");
    expect(container.querySelector(".ae-cardfield-mount")!.textContent).not.toContain("1234");
  });

  test("an error shows under the frame, is announced and turns the edge danger", async () => {
    const { container } = await render(AeCardField, {
      props: { error: "Your card was declined. Try another card." },
      slots: { default: provider },
    });
    const frame = container.querySelector(".ae-cardfield")!;
    expect(frame.getAttribute("data-state")).toBe("error");
    const alert = container.querySelector("[role=alert]")!;
    expect(alert.textContent).toContain("declined");
    expect(frame.getAttribute("aria-describedby")).toBe(alert.id);
    const danger = getComputedStyle(container.querySelector(".ae-cardfield-mount")!).borderColor;
    const plain = await render(AeCardField);
    expect(danger).not.toBe(getComputedStyle(plain.container.querySelector(".ae-cardfield-mount")!).borderColor);
  });

  test("the frame is described by the note when there is no error", async () => {
    const { container } = await render(AeCardField);
    expect(container.querySelector(".ae-cardfield")!.getAttribute("aria-describedby")).toBe(
      container.querySelector(".ae-cardfield-note")!.id,
    );
  });

  test("the frame is as tall as an input (48px)", async () => {
    const { container } = await render(AeCardField, { slots: { default: provider } });
    container.classList.add("ae-root");
    expect(container.querySelector(".ae-cardfield-mount")!.getBoundingClientRect().height).toBe(48);
  });

  test("class and attributes fall through to the wrapper", async () => {
    const { container } = await render(AeCardField, { attrs: { class: "mine", "data-x": "1" } });
    expect(container.firstElementChild!.className).toBe("ae-field mine");
    expect(container.firstElementChild!.getAttribute("data-x")).toBe("1");
  });

  test("has no accessibility violations: ready, loading, error", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(AeCardField, { id: "a" }, () => provider()),
            h(AeCardField, { id: "b", state: "loading" }),
            h(AeCardField, { id: "c", error: "Your card was declined." }, () => provider()),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});
