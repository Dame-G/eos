---
"@eos-ui/vue": minor
---

Props now follow one set of conventions (see CONTRIBUTING.md). Breaking, while we are pre-release:

- `variant` is only for `EButton` and `EMenu`. It is gone from `EChip`, `EStamp` and `EDisclosure`, which keep their former default look; `EDisclosure` loses `meta`, and `EAccordion` draws its own cards.
- `EText`: `variant="small"` is `small`, `variant="deck"` is `large`.
- `ESurface`: `tone="tint"` is removed and `tone="float"` is `raised`.
- `dense` is removed from `ENavList` and `ETabs`; vertical tabs always use the compact rows.
- `EDataGrid`: `plain` is `bare`.
- `EItemRow`: `tone`, `label` and `detail` are `statusTone`, `statusLabel` and `statusDetail`.
- `EDetailRow`: `status` and `tone` are `badge` and `badgeTone`.
- `EOtpField`: `type` is `inputmode`.
