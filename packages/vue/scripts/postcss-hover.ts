import type { AtRule, Container, Document, Plugin, Rule } from "postcss";

// A tap leaves :hover stuck on a touch screen, so every hover style is held back for devices that can really hover.
export default function hover(): Plugin {
  return {
    postcssPlugin: "e-hover",
    Rule(rule: Rule, { AtRule: AtRuleNode }) {
      if (!rule.selector.includes(":hover")) return;
      for (let p: Container | Document | undefined = rule.parent; p; p = p.parent) {
        if (p.type === "atrule" && ((p as AtRule).name === "keyframes" || (p as AtRule).params.includes("hover:")))
          return;
      }
      const hovering = rule.selectors.filter((s) => s.includes(":hover"));
      const rest = rule.selectors.filter((s) => !s.includes(":hover"));
      const gated = rule.clone({ selectors: hovering });
      const prev = rule.prev();
      const joins =
        prev?.type === "atrule" && (prev as AtRule).name === "media" && (prev as AtRule).params === "(hover: hover)";
      if (joins) (prev as AtRule).append(gated);
      else {
        const media = new AtRuleNode({ name: "media", params: "(hover: hover)" });
        media.append(gated);
        rule.after(media);
      }
      if (rest.length) rule.selectors = rest;
      else rule.remove();
    },
  };
}
hover.postcss = true;
