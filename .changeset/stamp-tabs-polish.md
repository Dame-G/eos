---
"@eos-ui/vue": patch
---

`EStamp`: the capitals sit in the middle of the stamp. A line box centres capitals high, so the word and the detail have a little space above the text. `ETabs`: the selected tab's edges are as thick as a focused field's outline (2px by default) instead of the slab depth, on all four sides.

`ECheckbox` and `ERadioGroup`: an unchecked box or radio has no well (the inset top shadow); the fill and edge are unchanged. `ESwitch`: the thumb is plain (no border or slab), and the track is flat on or off, so the thumb sits at the same height. `ESegmented`: every option draws its own edge and the track draws none, so corners are drawn once; the track clips only when it scrolls.

`ETabs` and `ESegmented`: an inactive tab or option answers the pointer the same way: ink text, a wash and a darker edge of the same width (no ring is added, so the edge never gets thicker).
