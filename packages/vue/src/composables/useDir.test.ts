import { describe, expect, test } from "vitest";
import { createApp, defineComponent, h } from "vue";
import { createEos } from "../plugin.js";
import { useDir, useLogicalSide, type LogicalSide } from "./useDir.js";

function dirIn(options: Parameters<typeof createEos>[0] = {}) {
  let dir!: ReturnType<typeof useDir>;
  const eos = createEos(options);
  createApp(
    defineComponent({
      setup() {
        dir = useDir();
        return () => h("div");
      },
    }),
  )
    .use(eos)
    .mount(document.createElement("div"));
  return { dir, eos };
}

describe("useDir", () => {
  test("is ltr without the plugin or a locale", () => {
    expect(dirIn().dir.value).toBe("ltr");
  });

  test("follows the locale and updates when it changes", () => {
    const { dir, eos } = dirIn({ locale: "ar-EG" });
    expect(dir.value).toBe("rtl");
    eos.config.locale = "fr-CA";
    expect(dir.value).toBe("ltr");
    eos.config.locale = "he";
    expect(dir.value).toBe("rtl");
  });

  test("an explicit dir wins over the locale", () => {
    const { dir, eos } = dirIn({ locale: "ar", dir: "ltr" });
    expect(dir.value).toBe("ltr");
    eos.config.dir = null;
    expect(dir.value).toBe("rtl");
  });

  test("useLogicalSide turns start and end into the physical side for the direction, and keeps the rest", () => {
    const sides: Record<string, string>[] = [];
    for (const dir of ["ltr", "rtl"] as const) {
      const out: Record<string, string> = {};
      createApp(
        defineComponent({
          setup() {
            for (const s of ["start", "end", "top", "bottom"] as LogicalSide[]) out[s] = useLogicalSide(() => s).value;
            return () => h("div");
          },
        }),
      )
        .use(createEos({ dir }))
        .mount(document.createElement("div"));
      sides.push(out);
    }
    expect(sides[0]).toEqual({
      start: "left",
      end: "right",
      top: "top",
      bottom: "bottom",
    });
    expect(sides[1]).toEqual({
      start: "right",
      end: "left",
      top: "top",
      bottom: "bottom",
    });
  });
});
