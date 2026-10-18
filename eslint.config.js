import js from "@eslint/js";
import tseslint from "typescript-eslint";
import vue from "eslint-plugin-vue";
import a11y from "eslint-plugin-vuejs-accessibility";
import globals from "globals";

export default tseslint.config(
  { ignores: ["**/dist/**", "**/node_modules/**", "reference/**", "**/generated/**", "**/storybook-static/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs["flat/recommended"],
  ...a11y.configs["flat/recommended"],
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    files: ["**/*.vue"],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    rules: {
      // Components are named EThing, which is multi-word; folders and tests are not components.
      "vue/multi-word-component-names": "off",
      "vue/block-order": ["error", { order: ["script", "template", "style"] }],
      "vue/define-macros-order": ["error", { order: ["defineOptions", "defineProps", "defineEmits", "defineSlots"] }],
      "vue/no-v-html": "off", // the icon set is our own markup; see EIcon
      "vue/require-default-prop": "off",
      // Formatting is Prettier's job.
      "vue/html-self-closing": "off",
      "vue/max-attributes-per-line": "off",
      "vue/singleline-html-element-content-newline": "off",
      "vue/html-indent": "off",
      "vue/html-closing-bracket-newline": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "vuejs-accessibility/label-has-for": "off", // labels are wired by id with useUid
    },
  },
  {
    files: ["**/*.mjs", "**/scripts/**", "**/*.config.*"],
    rules: { "no-console": "off" },
  },
  {
    // Tests build small wrapper components inline.
    files: ["**/*.test.ts"],
    rules: { "vue/one-component-per-file": "off" },
  },
);
