import { describe, expect, test } from "vitest";
import { createApp, defineComponent, h } from "vue";
import { createEos } from "../plugin.js";
import { useDir } from "./useDir.js";

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
});
