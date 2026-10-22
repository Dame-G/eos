---
"@eos-ui/vue": patch
---

The range summary in ECalendar reads "(1 day)" for a one-day range instead of "(1 days)". `rangeDone` is now a plural message and takes `n`. An override that uses `{days}` keeps working.
