import axe from "axe-core";

/** Page-level rules that cannot pass for one component rendered alone. */
const PAGE_RULES = [
  "region",
  "landmark-one-main",
  "page-has-heading-one",
  "document-title",
  "html-has-lang",
  "landmark-no-duplicate-contentinfo",
  "landmark-unique",
];

/**
 * Fails when axe finds a component-level accessibility violation. Run it against every story state:
 * open, invalid, disabled, loading.
 */
export async function expectNoViolations(root: Element, options: { disable?: string[] } = {}): Promise<void> {
  const rules = Object.fromEntries([...PAGE_RULES, ...(options.disable ?? [])].map((id) => [id, { enabled: false }]));
  const result = await axe.run(root, { rules, resultTypes: ["violations"] });
  if (result.violations.length) {
    const text = result.violations
      .map(
        (v) =>
          `${v.id} (${v.impact}): ${v.help}\n` +
          v.nodes
            .map(
              (n) =>
                `    ${n.target.join(" ")}\n    ${n.html.slice(0, 160)}\n    ${n.failureSummary?.replace(/\n/g, " ")}`,
            )
            .join("\n"),
      )
      .join("\n");
    throw new Error("Accessibility violations:\n" + text);
  }
}
