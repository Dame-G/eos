---
"@eos-ui/vue": minor
---

New opt-in font entries: `@eos-ui/vue/fonts-self-hosted.css` serves Bricolage Grotesque (with its optical-size axis) and Geist Mono from woff2 files in the package, so no request goes to Google, and `@eos-ui/vue/fonts-fallback.css` has only the metric-matched fallback faces, for an app that serves the fonts itself. The JavaScript in `dist` is no longer minified and ships without source maps: your bundler minifies it, and the modules read like the source. The README now says the package root has one side effect besides the CSS (it registers the built-in icons).
