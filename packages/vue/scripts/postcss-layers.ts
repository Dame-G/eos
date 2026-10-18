// PostCSS plugin: every stylesheet the library emits starts with the layer order, so the cascade is the same
// whichever component's CSS the browser meets first. Components write their rules inside `@layer e.<name> { }`.
import type { AtRule, Plugin, Root } from "postcss";
import { LAYER_ORDER } from "@eos-ui/tokens";

export default function layers(): Plugin {
  return {
    postcssPlugin: "e-layers",
    Once(root: Root, { AtRule: AtRuleNode }) {
      const first = root.first;
      if (
        first &&
        first.type === "atrule" &&
        (first as AtRule).name === "layer" &&
        (first as AtRule).params.startsWith("e.reset")
      )
        return;
      const statement = new AtRuleNode({ name: "layer", params: LAYER_ORDER });
      // @import rules must stay first
      let lastImport: AtRule | null = null;
      root.each((n) => {
        if (n.type === "atrule" && (n as AtRule).name === "import") lastImport = n as AtRule;
      });
      if (lastImport) (lastImport as AtRule).after(statement);
      else root.prepend(statement);
    },
  };
}
layers.postcss = true;
