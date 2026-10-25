import { computed, nextTick, ref, watch, type Ref } from "vue";
import type ECalendar from "../Calendar/ECalendar.vue";
import { parseIso } from "../Calendar/dates.js";
import { useQuietFocus } from "../../composables/useQuietFocus.js";

/** A bound as a consumer gives it: a `Date`, or a `YYYY-MM-DD` string as with `valueFormat="iso"`. */
export type DateBound = Date | string;

/** A bound as a day, or undefined when it is unset or not a real day. */
export const toBound = (v: DateBound | undefined): Date | undefined =>
  v == null ? undefined : typeof v === "string" ? (parseIso(v) ?? undefined) : v;

interface PickerProps {
  disabled?: boolean | undefined;
  readonly?: boolean | undefined;
  error?: string | undefined;
}

/**
 * What EDatePicker and ERangePicker share: the calendar popup (opening, where focus goes when it opens and closes,
 * Escape inside the month and year views, Alt+Arrow Down) and the error of typed text that cannot be used.
 * Bind `popup` on PopoverContent, `trigger` on the PopoverTrigger, and call `onKey` from the text boxes' keydown.
 */
export function useDatePopover(
  props: PickerProps,
  open: Ref<boolean>,
  options: {
    /** Where focus goes back to when the calendar closes by Escape or a choice. */
    returnFocus: () => void;
    /** Reads what was typed: on Enter, and when focus leaves the text. */
    commit: () => void;
    /** Told when the typed text cannot be used, with that text and the error shown. */
    onInvalid: (text: string, message: string) => void;
  },
) {
  const calendar = ref<InstanceType<typeof ECalendar> | null>(null);
  const shown = computed(() => open.value && !props.disabled && !props.readonly);
  const quiet = useQuietFocus(shown, (el) => !!el.closest(".e-calpanel, .e-combo"));

  const typedError = ref("");
  /** The typed text could not be used. The field then posts nothing rather than the value it had before. */
  const unusable = ref(false);
  const shownError = computed(() => props.error || typedError.value);

  /** The typed text is fine, or was replaced: drop its error. */
  function accept() {
    typedError.value = "";
    unusable.value = false;
  }
  /** The typed text cannot be used: show why, post nothing, and say so. */
  function reject(text: string, message: string) {
    typedError.value = message;
    unusable.value = true;
    options.onInvalid(text, message);
  }

  let clickedOutside = false;
  watch(open, (isOpen) => {
    if (isOpen) clickedOutside = false;
  });

  function onKey(e: KeyboardEvent) {
    if (e.key === "Enter") options.commit();
    else if (e.key === "ArrowDown" && e.altKey && !props.disabled && !props.readonly) {
      e.preventDefault();
      quiet.intent();
      open.value = true;
    }
  }

  /** The handlers of PopoverContent. */
  const popup = {
    onOpenAutoFocus(e: Event) {
      e.preventDefault();
      if (!quiet.personOpened()) return;
      void nextTick(() => calendar.value?.focusDay());
    },
    onCloseAutoFocus(e: Event) {
      e.preventDefault();
      // A click outside leaves focus where it landed; Escape or a choice returns it to the field.
      if (quiet.returnsFocus() && !clickedOutside) options.returnFocus();
    },
    onInteractOutside() {
      clickedOutside = true;
    },
    onEscapeKeyDown(e: KeyboardEvent) {
      // Escape in the month or year view goes back to the days; the calendar handles it.
      if (calendar.value && calendar.value.view !== "days") e.preventDefault();
    },
  };

  return {
    calendar,
    shown,
    /** The handlers of the calendar button. */
    trigger: { onClick: quiet.intent, onKeydown: quiet.intent },
    popup,
    onKey,
    typedError,
    unusable,
    shownError,
    accept,
    reject,
  };
}
