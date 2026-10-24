import { describe, expect, test, vi } from "vitest";
import { defineComponent, h } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EAvatar from "./EAvatar.vue";
import EMenu from "../Menu/EMenu.vue";
import { createEos } from "../../plugin.js";
import { expectNoViolations } from "../../../test/axe.js";

const PIXEL = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

describe("EAvatar", () => {
  test("capitalises the initials in the configured language", async () => {
    const name = "ılgın işık"; // Turkish: dotless ı, dotted i
    const turkish = await render(EAvatar, {
      props: { name },
      global: { plugins: [createEos({ locale: "tr-TR" })] },
    });
    expect(turkish.container.textContent).toBe("Iİ");
    const english = await render(EAvatar, { props: { name }, global: { plugins: [createEos({ locale: "en-US" })] } });
    expect(english.container.textContent).toBe("II");
  });

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

  test("a name written without spaces gives its first whole character", async () => {
    const cjk = await render(EAvatar, { props: { name: "王小明" } });
    expect(cjk.container.textContent!.trim()).toBe("王");
    const astral = await render(EAvatar, { props: { name: "𠮷田 太郎" } });
    expect(astral.container.textContent!.trim()).toBe("𠮷太");
    const emoji = await render(EAvatar, { props: { name: "👩‍💻 Dev" } });
    expect(emoji.container.textContent!.trim()).toBe("👩‍💻D");
  });

  test("size sm, md and lg are 32, 44 and 64px, and md is the default", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { class: "e-root" }, [
            h(EAvatar, { name: "A B", size: "sm" }),
            h(EAvatar, { name: "A B", size: "md" }),
            h(EAvatar, { name: "A B", size: "lg" }),
            h(EAvatar, { name: "A B" }),
          ]),
      }),
    );
    const sizes = [...container.querySelectorAll(".e-avatar")].map((e) => e.getBoundingClientRect().width);
    expect(sizes).toEqual([32, 44, 64, 44]);
  });

  test("presence adds a dot and is read with the name", async () => {
    const { container } = await render(EAvatar, { props: { name: "Ada Lovelace", presence: "online" } });
    await expect.element(page.getByRole("img", { name: "Ada Lovelace, Online" })).toBeVisible();
    const dot = container.querySelector(".e-avatar-status")!;
    expect(dot.getAttribute("aria-hidden")).toBe("true");
    expect(dot.getBoundingClientRect().width).toBeGreaterThan(0);
    const button = await render(EAvatar, { props: { name: "Ada Lovelace", presence: "busy", as: "button" } });
    await expect.element(page.getByRole("button", { name: "Ada Lovelace, Busy" })).toBeVisible();
    for (const status of ["away", "offline"] as const) {
      const r = await render(EAvatar, { props: { name: "Ada", presence: status } });
      expect(r.container.querySelector(`.e-avatar-status--${status}`)).not.toBeNull();
    }
    expect(button.container.querySelector(".e-avatar-status")).not.toBeNull();
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

  test("size sm and lg are 32px and 64px, the default 44px", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { class: "e-root" }, [
            h(EAvatar, { name: "A B" }),
            h(EAvatar, { name: "A B", size: "sm" }),
            h(EAvatar, { name: "A B", size: "lg" }),
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

  test("hovering a button avatar fills it as well as darkening its edge", async () => {
    const { container } = await render(
      defineComponent({ render: () => h("div", { class: "e-root" }, [h(EAvatar, { name: "A B", as: "button" })]) }),
    );
    const el = container.querySelector<HTMLButtonElement>("button.e-avatar")!;
    const rest = getComputedStyle(el).backgroundColor;
    await userEvent.hover(el);
    await expect.poll(() => getComputedStyle(el).backgroundColor).not.toBe(rest);
    await userEvent.unhover(el);
    await expect.poll(() => getComputedStyle(el).backgroundColor).toBe(rest);
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

  test("a button avatar is reached with Tab and pressed with Enter or Space", async () => {
    const onClick = vi.fn();
    await render(EAvatar, { props: { name: "Ada Lovelace", as: "button" }, attrs: { onClick } });
    await userEvent.tab();
    await expect.element(page.getByRole("button", { name: "Ada Lovelace" })).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
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
            h(EAvatar, { name: "Ada Lovelace", src: PIXEL, size: "sm" }),
            h(EAvatar, { name: "Ada Lovelace", size: "lg" }),
            h(EAvatar, { name: "Ada Lovelace", as: "button" }),
            h(EAvatar, { name: "Ada Lovelace", src: PIXEL, as: "button" }),
            h(EAvatar, { name: "Ada Lovelace", presence: "away" }),
            h(EAvatar, { name: "Ada Lovelace", presence: "offline", as: "button" }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });

  test("the picture's corners are concentric with the ring, under any radius", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(EAvatar, { name: "Ada", src: PIXEL }),
            h(EAvatar, { name: "Bo", src: PIXEL, size: "sm" }),
            h(EAvatar, { name: "Cy", src: PIXEL, as: "button" }),
          ]),
      }),
    );
    container.classList.add("e-root");
    const px = (el: Element, p: string) => parseFloat(getComputedStyle(el).getPropertyValue(p));
    for (const md of ["8px", "14px", "2px"]) {
      container.style.setProperty("--e-radius-md", md);
      for (const ring of container.querySelectorAll(".e-avatar")) {
        const img = ring.querySelector(".e-avatar-img")!;
        const edge = px(ring, "border-top-width");
        const lift = px(ring, "border-bottom-width");
        expect(px(img, "border-top-left-radius")).toBeCloseTo(
          Math.max(0, px(ring, "border-top-left-radius") - edge),
          1,
        );
        expect(px(img, "border-bottom-left-radius")).toBeCloseTo(
          Math.max(0, px(ring, "border-bottom-left-radius") - lift),
          1,
        );
      }
    }
  });
});
