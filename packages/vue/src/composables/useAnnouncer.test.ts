import { afterEach, describe, expect, test } from "vitest";
import { useAnnouncer } from "./useAnnouncer.js";

const polite = () => document.querySelector("[data-e-announcer=polite]");
const assertive = () => document.querySelector("[data-e-announcer=assertive]");

afterEach(() => {
  document.querySelectorAll("[data-e-announcer]").forEach((el) => (el.textContent = ""));
});

describe("useAnnouncer", () => {
  test("puts the message in a hidden polite status region", async () => {
    useAnnouncer().announce("3 rows selected");
    await expect.poll(() => polite()?.textContent).toBe("3 rows selected");
    const el = polite()!;
    expect(el.getAttribute("role")).toBe("status");
    expect(el.getAttribute("aria-live")).toBe("polite");
    expect(el.getBoundingClientRect().width).toBeLessThanOrEqual(1);
  });

  test("the region does not make a one-screen page scroll", async () => {
    document.querySelectorAll("[data-e-announcer]").forEach((el) => el.remove());
    const page = document.createElement("div");
    page.style.height = "100vh";
    document.body.append(page);
    const before = document.documentElement.scrollHeight;
    useAnnouncer().announce("Copied");
    await expect.poll(() => polite()?.textContent).toBe("Copied");
    expect(document.documentElement.scrollHeight).toBe(before);
    page.remove();
  });

  test("assertive messages go to an alert region", async () => {
    useAnnouncer().announce("Payment failed", { assertive: true });
    await expect.poll(() => assertive()?.textContent).toBe("Payment failed");
    expect(assertive()!.getAttribute("role")).toBe("alert");
  });

  test("the page shares one region per politeness", async () => {
    useAnnouncer().announce("a");
    useAnnouncer().announce("b");
    await expect.poll(() => polite()?.textContent).toBe("b");
    expect(document.querySelectorAll("[data-e-announcer=polite]")).toHaveLength(1);
  });

  test("the same message twice in a row still changes the text", async () => {
    const { announce } = useAnnouncer();
    announce("Saved");
    await expect.poll(() => polite()?.textContent).toBe("Saved");
    announce("Saved");
    await expect.poll(() => polite()?.textContent).toBe(`Saved${String.fromCharCode(160)}`);
  });

  test("an empty message does nothing", async () => {
    useAnnouncer().announce("");
    await new Promise((r) => setTimeout(r, 80));
    expect(polite()?.textContent ?? "").toBe("");
  });
});
