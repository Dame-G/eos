import { onScopeDispose, ref, toValue, type MaybeRefOrGetter, type Ref } from "vue";
import { useMessages } from "../config.js";
import { useAnnouncer } from "./useAnnouncer.js";

export interface CopyOptions {
  /** Milliseconds `copied` stays true. @default 2000 */
  timeout?: MaybeRefOrGetter<number>;
  /** Say "Copied" (or "Couldn't copy") to screen readers. @default true */
  announce?: boolean;
}

export interface CopyState {
  /** True for a moment after a successful copy. */
  copied: Readonly<Ref<boolean>>;
  /** True for a moment after a copy that failed. */
  failed: Readonly<Ref<boolean>>;
  /** Puts the text on the clipboard. Resolves to whether it worked. */
  copy(text: string): Promise<boolean>;
}

async function write(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // An insecure page has no async clipboard, so a hidden textarea and the old command do the job.
    try {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      Object.assign(area.style, { position: "fixed", insetBlockStart: "0", opacity: "0" });
      document.body.append(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/** Copy text and know when it worked: `const { copied, copy } = useCopy(); copy("npm i @eos-ui/vue")`. */
export function useCopy(options: CopyOptions = {}): CopyState {
  const t = useMessages();
  const { announce } = useAnnouncer();
  const copied = ref(false);
  const failed = ref(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  onScopeDispose(() => clearTimeout(timer));

  return {
    copied,
    failed,
    async copy(text) {
      const ok = await write(text);
      copied.value = ok;
      failed.value = !ok;
      if (options.announce !== false)
        announce(t(ok ? "codeCopied" : "copyFailed"), ok ? undefined : { assertive: true });
      clearTimeout(timer);
      timer = setTimeout(() => (copied.value = failed.value = false), toValue(options.timeout) ?? 2000);
      return ok;
    },
  };
}
