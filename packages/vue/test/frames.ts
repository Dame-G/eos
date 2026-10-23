/**
 * Waits for the browser to paint `count` frames. For a check that something did not happen (a popup stays shut, focus
 * stays put): by then Vue has flushed, a popup that was going to mount has, and a focus move queued for the next frame
 * has run. A state that should change is waited for with expect.poll instead, and a delay with fake timers.
 */
export function frames(count = 3): Promise<void> {
  return new Promise((done) => {
    const step = (left: number) => (left ? requestAnimationFrame(() => step(left - 1)) : done());
    step(count);
  });
}

/** Waits until every running CSS animation and transition in the page has finished, so a check sees the end state. */
export async function settled(): Promise<void> {
  await frames(1);
  await Promise.all(document.getAnimations().map((a) => a.finished.catch(() => undefined)));
}
