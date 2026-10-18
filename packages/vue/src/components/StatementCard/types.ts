import type { StampStatus, StampTone } from "../Stamp/EStamp.vue";
import type { AmountDetail } from "../Amount/EAmount.vue";
import type { DescriptionItem } from "../DescriptionList/EDescriptionList.vue";
import type { TimelineItem } from "../Timeline/ETimeline.vue";

/** What a statement shows. Shared by `EStatementCard` and `EStatementRow`. */
export interface StatementProps {
  /** The statement's name, such as "October statement". */
  title: string;
  /** A line under the title, such as the period it covers. */
  subtitle?: string;
  /** A preset for the stamp: sets its tone, word and glyph. */
  status?: StampStatus;
  /** Overrides the status's tone. */
  tone?: StampTone;
  /** Overrides the status's word. */
  label?: string;
  /** A date or day count set after the stamp's word, such as "Oct 22". */
  detail?: string;
  /** The lead amount. */
  amount: number;
  /** What the amount is ("You owe", "Paid"). */
  amountLabel?: string;
  /** Lines under the amount, or above the total in a row. A number is shown as money. */
  details?: AmountDetail[];
  /** One sentence: what this is and what to do. */
  reason?: string;
  /** Label and text rows: what it covers, how to pay, when it is due. */
  parts?: DescriptionItem[];
  /** Events, newest first, shown behind a disclosure. */
  activity?: TimelineItem[];
  /** The disclosure's title. Default "History"; the number of events follows it. */
  activityTitle?: string;
  /** ISO 4217 code for this statement's amounts. Overrides the configured currency. */
  currency?: string;
  /** BCP 47 tag for this statement's amounts. Overrides the configured locale. */
  locale?: string;
}
