---
"@eos-ui/vue": minor
"@eos-ui/tokens": minor
---

Printing. A page prints in its theme's light palette whatever the screen shows: every token a dark or high-contrast variant changes is set back under `@media print`, and `apply()` does the same with its own theme while the page prints. Colours print exactly, so a fill that carries meaning (a checked box, a switch that is on, a progress bar, a chosen day) is on the paper even where the browser leaves background graphics out. Headings stay with what follows them, paragraphs leave no lone line at a page edge, and cards, notices, fields, calendars, code blocks, images and table rows move to the next page rather than being cut. Open menus, list panels, date panels and tooltips are not printed.

- `EDataGrid` prints as the table it shows: no search, filters, selection column, column tools, resizers or pager; only the sorted column keeps its arrow; the heading row repeats at the top of each page (a sort button there is laid out as text, since a repeated button is not painted).
- `ETable` and `EDataGrid` headings are in the flow on paper, so they repeat on every page.
- `ECodeBlock` wraps long lines instead of cutting them off.
- `EDisclosure` and `EExpandableRow` print open, without the chevron.
- `EUpload` leaves out an empty zone, the count and the files turned away.
- `ELink` prints the address only of a link to another site (`http:`, `https:`); a path on the same site prints as its text.
- `EAppHeader` prints as the brand alone: no actions, and a sticky header prints once.
