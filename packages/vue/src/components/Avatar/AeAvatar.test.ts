import { describe, expect, test } from "vitest";
import { defineComponent, h } from "vue";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import AeAvatar from "./AeAvatar.vue";
import { expectNoViolations } from "../../../test/axe.js";

// A 1 x 1 transparent GIF that always loads.
const PIXEL = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

describe("AeAvatar", () => {
  test("shows initials and is an image named by the person", async () => {
    const { container } = await render(AeAvatar, { props: { name: "Ada Lovelace" } });
    await expect.element(page.getByRole("img", { name: "Ada Lovelace" })).toBeVisible();
    expect(container.querySelector(".ae-avatar")!.textContent!.trim()).toBe("AL");
  });

  test("initials are the first and last name only", async () => {
    const { container } = await render(AeAvatar, { props: { name: "grace brewster murray hopper" } });
    expect(container.textContent!.trim()).toBe("GH");
  });

  test("one name gives one letter", async () => {
    const { container } = await render(AeAvatar, { props: { name: "Cher" } });
    expect(container.textContent!.trim()).toBe("C");
  });

  test("a photo replaces the initials and is decorative", async () => {
    const { container } = await render(AeAvatar, { props: { name: "Ada Lovelace", src: PIXEL } });
    const img = container.querySelector("img.ae-avatar-img")!;
    expect(img.getAttribute("alt")).toBe("");
    expect(container.textContent!.trim()).toBe("");
  });

  test("falls back to the initials if the photo fails to load", async () => {
    const { container } = await render(AeAvatar, {
      props: { name: "Ada Lovelace", src: "http://127.0.0.1:1/nope.png" },
    });
    await expect.poll(() => container.querySelector("img")).toBeNull();
    expect(container.textContent!.trim()).toBe("AL");
  });

  test("small and large are 28px and 56px, the default 40px", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { class: "ae-root" }, [
            h(AeAvatar, { name: "A B" }),
            h(AeAvatar, { name: "A B", small: true }),
            h(AeAvatar, { name: "A B", large: true }),
          ]),
      }),
    );
    const sizes = [...container.querySelectorAll(".ae-avatar")].map((e) => e.getBoundingClientRect().width);
    expect(sizes).toEqual([40, 28, 56]);
  });

  test("attributes fall through to the root", async () => {
    const { container } = await render(AeAvatar, { props: { name: "Ada Lovelace" }, attrs: { "data-testid": "a" } });
    expect(container.querySelector(".ae-avatar")!.getAttribute("data-testid")).toBe("a");
  });

  test("has no accessibility violations in any state", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", [
            h(AeAvatar, { name: "Ada Lovelace" }),
            h(AeAvatar, { name: "Ada Lovelace", src: PIXEL, small: true }),
            h(AeAvatar, { name: "Ada Lovelace", large: true }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});
