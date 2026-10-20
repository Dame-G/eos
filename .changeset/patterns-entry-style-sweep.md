---
"@eos-ui/vue": minor
---

Style sweep: strokes, spacing and heights use the stroke, space and control-height tokens (Stepper, signature baselines, Segmented, Dialog, Avatar, Pagination, Breadcrumb, AppHeader); print styles use `--e-print-ink` and `--e-print-paper`; Checkbox, RadioGroup and Switch compute their offsets from tokens (the Switch thumb now sits symmetrically, 1px further on); the EmptyState icon draws border plus outline instead of an inset shadow; Surface, Dialog, Drawer, Upload, Avatar and EmptyState have forced-colors rules; the AppShell main landmark shows a focus ring when focused from the skip link.
