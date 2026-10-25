---
"@eos-ui/vue": minor
---

Follow-ups to the audit: forced colours, private properties, file names and plugin cleanup.

Breaking (rename or remove, then update every use):

- `ESegmented` shows its `label` above the control by default, as a field does. `showLabel` is removed; pass `hideLabel` to keep the label for screen readers only (the old default).
- `useLocale()` no longer returns `dir`; use `useDir()`.
- `createEos({ themeTarget: null })` applies nothing to the document: no theme stylesheet, `lang` or `dir`. It used to fall back to `<html>`.
- The private `--e-ring` property of text inputs, selects and `EOtpField` is now `--_ring`. Only tokens and the documented hooks `--e-header-height` and `--e-xrow-lead` use the `--e-` prefix.

Fixed:

- Forced colours (Windows High Contrast): the rules moved from `base.css` into each component's own layer, where the components' rules no longer override them. An invalid field draws a heavier edge, a disabled checkbox or radio a GrayText edge, a checked switch a Highlight track edge and a HighlightText thumb, and a selected tab a Highlight edge; checks, switches, tabs and the buttons inside a field ring in Highlight when focused; a dialog, drawer or surface draws its outline. A count inside a selected tab is no longer painted in theme colours.
- Unmounting the app puts back the `lang` and `dir` that `createEos` wrote on the theme target.
- `ECommandPalette` shows Ctrl in its keycaps on the server and the first render, then the platform's keys once mounted, so a server-rendered palette hydrates without a mismatch. `formatShortcut` documents passing `apple` for server-rendered markup.
- The Nuxt recipe in the README builds the theme once with `defineTheme` and sets `lang` and `dir` for the server.
