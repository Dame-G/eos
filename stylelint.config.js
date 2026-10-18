/** @type {import('stylelint').Config} */
export default {
  extends: ["stylelint-config-standard", "stylelint-config-html"],
  ignoreFiles: ["**/dist/**", "reference/**", "**/node_modules/**"],
  rules: {
    // Class names are the public contract and follow the reference: ae-block, ae-block-part, ae-block--modifier.
    "selector-class-pattern": null,
    "custom-property-pattern": null,
    "keyframes-name-pattern": null,
    // One declaration per line, tokens for colours: raw hex stays out of components except where a mix needs black.
    "declaration-property-value-disallowed-list": { "z-index": ["/^[1-9][0-9]*$/"] },
    "declaration-no-important": true,
    // The layer order statement is added by the build.
    "at-rule-no-unknown": [true, { ignoreAtRules: ["layer"] }],
    "no-descending-specificity": null,
    "value-keyword-case": null,
    "color-function-notation": null,
    "alpha-value-notation": null,
    "media-feature-range-notation": null,
    "property-no-vendor-prefix": null,
    "value-no-vendor-prefix": null,
    "selector-pseudo-element-colon-notation": null,
  },
};
