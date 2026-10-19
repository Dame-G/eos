import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EAvatar from "./EAvatar.vue";
import EMenu from "../Menu/EMenu.vue";
import { expectNoViolations } from "../../../test/axe.js";

const PIXEL = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

describe("EAvatar", () => {
  test("shows initials and is an image named by the person", async () => {
    const { container } = await render(EAvatar, { props: { name: "Ada Lovelace" } });
    await expect.element(page.getByRole("img", { name: "Ada Lovelace" })).toBeVisible();
    expect(container.querySelector(".e-avatar")!.textContent!.trim()).toBe("AL");
  });

  test("initials are the first and last name only", async () => {
    const { container } = await render(EAvatar, { props: { name: "grace brewster murray hopper" } });
    expect(container.textContent!.trim()).toBe("GH");
  });

  test("one name gives one letter", async () => {
    const { container } = await render(EAvatar, { props: { name: "Cher" } });
    expect(container.textContent!.trim()).toBe("C");
  });

  test("a photo replaces the initials and is decorative", async () => {
    const { container } = await render(EAvatar, { props: { name: "Ada Lovelace", src: PIXEL } });
    const img = container.querySelector("img.e-avatar-img")!;
    expect(img.getAttribute("alt")).toBe("");
    expect(container.textContent!.trim()).toBe("");
  });

  test("falls back to the initials if the photo fails to load", async () => {
    const { container } = await render(EAvatar, {
      props: { name: "Ada Lovelace", src: "http://127.0.0.1:1/nope.png" },
    });
    await expect.poll(() => container.querySelector("img")).toBeNull();
    expect(container.textContent!.trim()).toBe("AL");
  });

  test("small and large are 32px and 64px, the default 44px", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { class: "e-root" }, [
            h(EAvatar, { name: "A B" }),
            h(EAvatar, { name: "A B", small: true }),
            h(EAvatar, { name: "A B", large: true }),
          ]),
      }),
    );
    const sizes = [...container.querySelectorAll(".e-avatar")].map((e) => e.getBoundingClientRect().width);
    expect(sizes).toEqual([44, 32, 64]);
  });

  test("as button renders a button named by the person, not an image", async () => {
    const { container } = await render(EAvatar, { props: { name: "Ada Lovelace", as: "button" } });
    const el = container.querySelector(".e-avatar")!;
    expect(el.tagName).toBe("BUTTON");
    expect(el.getAttribute("type")).toBe("button");
    expect(el.hasAttribute("role")).toBe(false);
    expect(el.classList.contains("e-avatar--button")).toBe(true);
    expect(el.querySelector("[aria-hidden=true]")!.textContent).toBe("AL");
    await expect.element(page.getByRole("button", { name: "Ada Lovelace" })).toBeVisible();
  });

  test("a button avatar with a photo is still named by the person", async () => {
    await render(EAvatar, { props: { name: "Ada Lovelace", src: PIXEL, as: "button" } });
    await expect.element(page.getByRole("button", { name: "Ada Lovelace" })).toBeVisible();
  });

  test("a button avatar has the pointer cursor, a focus ring and keeps its size", async () => {
    const { container } = await render(
      defineComponent({ render: () => h("div", { class: "e-root" }, [h(EAvatar, { name: "A B", as: "button" })]) }),
    );
    const el = container.querySelector<HTMLButtonElement>("button.e-avatar")!;
    expect(getComputedStyle(el).cursor).toBe("pointer");
    expect(el.getBoundingClientRect().width).toBe(44);
    await userEvent.tab();
    expect(document.activeElement).toBe(el);
    const style = getComputedStyle(el);
    expect(style.outlineStyle).toBe("solid");
    expect(style.outlineOffset).not.toBe("0px");
  });

  test("a span avatar is not interactive", async () => {
    const { container } = await render(EAvatar, { props: { name: "Ada Lovelace" } });
    const el = container.querySelector(".e-avatar")!;
    expect(el.tagName).toBe("SPAN");
    expect(el.hasAttribute("type")).toBe(false);
    expect(getComputedStyle(el).cursor).not.toBe("pointer");
  });

  test("a button avatar works as the trigger of an EMenu", async () => {
    const { container } = await render(EMenu, {
      props: { label: "Account", items: [{ label: "Sign out" }] },
      slots: { trigger: () => h(EAvatar, { name: "Ada Lovelace", as: "button" }) },
    });
    const trigger = container.querySelector<HTMLButtonElement>("button.e-avatar")!;
    expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await trigger.click();
    await expect.poll(() => document.querySelector("[role=menu]")).not.toBeNull();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    await expect.element(page.getByRole("menuitem", { name: "Sign out" })).toBeVisible();
  });

  test("attributes fall through to the root", async () => {
    const { container } = await render(EAvatar, { props: { name: "Ada Lovelace" }, attrs: { "data-testid": "a" } });
    expect(container.querySelector(".e-avatar")!.getAttribute("data-testid")).toBe("a");
  });

  test("has no accessibility violations in any state", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(EAvatar, { name: "Ada Lovelace" }),
            h(EAvatar, { name: "Ada Lovelace", src: PIXEL, small: true }),
            h(EAvatar, { name: "Ada Lovelace", large: true }),
            h(EAvatar, { name: "Ada Lovelace", as: "button" }),
            h(EAvatar, { name: "Ada Lovelace", src: PIXEL, as: "button" }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});
