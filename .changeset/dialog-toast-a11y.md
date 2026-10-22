---
"@eos-ui/vue": minor
---

EDialog and EDrawer take a `description` prop, shown under the title and wired through `aria-describedby`, and a `role` prop that can be `alertdialog` for confirmations. A consumer's own `aria-describedby` is no longer overridden. Toasts raised while a modal dialog is open are no longer hidden from assistive technology and can be clicked. EDrawer's slide uses `--e-duration-move`, so the motion presets apply. The toast docs now say that `createEos()` already provides `useToast()` everywhere.
