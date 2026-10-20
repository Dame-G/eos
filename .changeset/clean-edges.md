---
"@eos-ui/vue": minor
---

Rounded corners and raised edges are cleaner. Every outlined box is now drawn once: a border, or a box-shadow ring, is the whole stroke. Laying an identical outline over it, which these components did to thicken the curve, painted the antialiased corner pixels twice and made every rounded corner look heavier than its straight edges. A button, selected tab and selected nav item draw their raised slab as an offset copy of the face (a whole rounded box), so the curve no longer thickens or pinches at the bottom corners; a notice draws its left accent inside its outline instead of as a thick left border; and the selected segment no longer has an inset band that ended in a point against the container edge. Heights and spacing are unchanged, and a pressed button sinks onto its slab.
