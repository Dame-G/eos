---
"@eos-ui/vue": patch
---

An inline EDialog (the preview form) no longer moves focus when it opens or closes. Closing one used to send focus back to whatever had it when the dialog mounted, such as a tab, which then switched to that tab.
