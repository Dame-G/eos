import type { Tone } from "../../types.js";

/** The tones of a message: `ENotice`, `EToast` and the toasts of `useToast`. */
export type NoticeTone = Extract<Tone, "neutral" | "info" | "success" | "warning" | "danger">;

/** How a message is announced: `alert` at once, `status` politely, `false` not at all (a parent announces it). */
export type NoticeRole = "alert" | "status" | false;

/** The icon each tone shows unless the message names its own. */
export const TONE_ICON: Record<NoticeTone, string> = {
  neutral: "info",
  info: "info",
  success: "check",
  warning: "alert",
  danger: "alert",
};

/** The role a message takes: the one given, else `alert` for `danger` and `status` for the rest. */
export const roleFor = (role: NoticeRole | undefined, tone: NoticeTone): "alert" | "status" | undefined =>
  role === false ? undefined : (role ?? (tone === "danger" ? "alert" : "status"));
