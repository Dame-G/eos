---
"@eos-ui/vue": minor
---

Patterns for dense app workspaces: a side sheet, a popover, list rows, a tree, a virtual list and a stat link.

- `ESheet`: a panel docked over one side of its positioned container (or the window with `viewport`) that leaves the content beside it usable. Focus moves to its title on open and back to the opener on close; Escape closes it from anywhere unless a menu, popover or dialog is open over it. `modalBelow` (such as `48rem`) makes it a full-window modal on narrower screens. Slots: `default`, `leading` (a Back button), `actions`.
- `EPopover`: a non-modal panel anchored to a trigger you provide in the `trigger` slot, which receives `aria-haspopup`, `aria-expanded` and `aria-controls`. It flips when there is no room, closes on Escape or an outside press, and Up, Down, Home and End move between its controls. `side` and `align` place it.
- `EList` and `EListRow`: a keyboard-navigable list with one tab stop (Up, Down, Home, End), either a list of buttons or links with one `aria-current` row (`mode="current"`) or a listbox with one `aria-selected` row (`mode="select"`). `followFocus` chooses the row focus moves to. A row has a `title`, a muted `subtitle`, `leading` and `trailing` slots and a `live` mark.
- `ETree`: nested rows drawn as list rows, on Reka's tree: `v-model` (the selected `id`), `v-model:expanded`, Right and Left to open, close and move between levels.
- `EVirtualList`: renders only the rows in view, with a fixed `rowHeight` or `measure`d rows. Inside an `EList`, the list's keys reach rows that are not rendered yet.
- `EStatLink`: a compact link showing a label and one figure in mono ("You 1,840"), with `href`, or `to` and a `linkComponent`, and `current`.
- New message `live` ("Live").
