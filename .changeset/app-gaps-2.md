---
"@eos-ui/vue": minor
"@eos-ui/tokens": minor
---

Gaps found polishing an app built on eos. Everything is additive; no existing spelling changes.

- `ESheet`: `measure` (head, description and content kept to `--e-measure` and centred), `back` (a built-in Back button and a `back` event), `closeLabel`, `transition="slide" | "fade" | "none"` (a modal sheet no longer has to fade the page behind it in), and a long title ends in an ellipsis with its whole text as the `title` attribute.
- `EListRow`: `expanded` sets `aria-expanded` on the row's button; `live` passed at all reserves the dot's gutter before the title and subtitle, so live and finished rows line up; `liveTone` colours the dot (`success`, `danger`, `warning`, `info`); `trailingStack` stacks two lines in the trailing slot; an `actions` slot puts buttons beside the row's own button without nesting controls.
- `ECellRow` (new): a number and several independently chosen cells in an `EList`, for a move list. One tab stop; Left and Right step across cells, Up and Down keep the column; works in an `EVirtualList`. `EList` now moves focus by lines and cells, and leaves the arrow keys alone when they are pressed on a control beside a row.
- `ETree`: `toggleOn="chevron"` separates selecting from opening, controls inside rows keep their own presses and keys, `dense`, `indent="sm"`, and `class` and attributes reach the root.
- `EIconButton`: `href`, `to` and `linkComponent` make it a real link; `current` sets `aria-current="page"`; `size="xs"`.
- `EButton`: `size="xs"`, a dense button (32px) that keeps a 44px hit area.
- `ESegmented`: `stretch`, `multiple` (a group of toggles; the array is `v-model:values`) and `collapse` (a select in place of a track that does not fit).
- `EProgress`: `hideLabel` and `hideValue`.
- `EDialog` and `EDrawer`: `footer="row"` keeps the foot's buttons side by side at every width. `EActions` takes `stack="never"`.
- `EConfirmDialog` (new): a yes or no question as an alert dialog, with a danger tone, focus on Cancel first, `loading` and `closeOnConfirm`.
- `EEmptyState`: `align="start"`, and its parts no longer spread over a tall container (they sit together in the middle).
- `EDisclosure`: `titleStyle="text"`. `ECheckboxGroup`: `columns`. `ENotice`: `retry`, `retryLabel`, `retrying` and a `retry` event. `EMetric`: `unit`.
- Messages: `cancel` and `confirm`.
- Tokens: `danger-ink`, danger red as text with 4.5:1 on the surface and on `surface-tint`. `info` no longer follows an orange or red brand onto the hue of `warning` or `danger`: in that case a theme gives it a blue of its own (and a blue `info-soft`), so the information and warning stamps differ in a dark theme.
