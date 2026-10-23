import { describe, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import ECopyButton from "./ECopyButton.vue";
import { expectNoViolations } from "../../../test/axe.js";

function stubClipboard() {
  const writeText = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
  return writeText;
}

describe("ECopyButton", () => {
  test("is a button named Copy by default, or by label", async () => {
    await render(ECopyButton, { props: { text: "x", label: "Copy invite link" } });
    await expect.element(page.getByRole("button", { name: "Copy invite link" })).toBeVisible();
  });

  test("the default name is Copy", async () => {
    await render(ECopyButton, { props: { text: "x" } });
    await expect.element(page.getByRole("button", { name: "Copy", exact: true })).toBeVisible();
  });

  test("copies the text, emits copy and announces it", async () => {
    const writeText = stubClipboard();
    const { emitted } = await render(ECopyButton, { props: { text: "secret-link" } });
    await page.getByRole("button", { name: "Copy" }).click();
    expect(writeText).toHaveBeenCalledWith("secret-link");
    expect(emitted().copy).toEqual([[true]]);
    await expect.poll(() => document.querySelector("[data-e-announcer=polite]")?.textContent).toBe("Copied");
    vi.unstubAllGlobals();
  });

  test("text can be a function read at press time", async () => {
    const writeText = stubClipboard();
    let value = "one";
    await render(ECopyButton, { props: { text: () => value } });
    value = "two";
    await page.getByRole("button", { name: "Copy" }).click();
    expect(writeText).toHaveBeenCalledWith("two");
    vi.unstubAllGlobals();
  });

  test("shows a visible failure and announces it when nothing reaches the clipboard", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    const exec = vi.spyOn(document, "execCommand").mockReturnValue(false);
    const { emitted, container } = await render(ECopyButton, { props: { text: "x" } });
    await page.getByRole("button", { name: "Copy" }).click();
    expect(emitted().copy).toEqual([[false]]);
    await expect.poll(() => container.querySelector(".e-copy--failed")).not.toBeNull();
    await expect.poll(() => document.querySelector("[data-e-announcer=assertive]")?.textContent).toBe("Couldn't copy");
    exec.mockRestore();
    vi.unstubAllGlobals();
  });

  test("has no axe violations", async () => {
    const { container } = await render(ECopyButton, { props: { text: "x" } });
    await expectNoViolations(container);
  });

  test("keyboard: Tab reaches it, Enter and Space copy and announce", async () => {
    const writeText = stubClipboard();
    await render(ECopyButton, { props: { text: "from-keys" } });
    await userEvent.tab();
    expect(document.activeElement!.getAttribute("aria-label")).toBe("Copy");
    await userEvent.keyboard("{Enter}");
    await expect.poll(() => writeText).toHaveBeenCalledTimes(1);
    await expect.poll(() => document.querySelector("[data-e-announcer=polite]")?.textContent).toBe("Copied");
    await userEvent.keyboard(" ");
    await expect.poll(() => writeText).toHaveBeenCalledTimes(2);
    expect(writeText).toHaveBeenLastCalledWith("from-keys");
    vi.unstubAllGlobals();
  });

  test("the failure colour lands on the icon button", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
    const exec = vi.spyOn(document, "execCommand").mockReturnValue(false);
    const { container } = await render(ECopyButton, { props: { text: "x" } });
    await page.getByRole("button", { name: "Copy" }).click();
    await expect.poll(() => container.querySelector("button.e-icon-btn.e-copy--failed")).not.toBeNull();
    exec.mockRestore();
    vi.unstubAllGlobals();
  });
});
