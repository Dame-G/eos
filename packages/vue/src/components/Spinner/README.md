# ESpinner

A ring that shows something is loading.

```vue
<ESpinner label="Processing your payment" />
<ESpinner block />
```

## Props

| Prop    | Type      | Default | Notes                                                                                    |
| ------- | --------- | ------- | ---------------------------------------------------------------------------------------- |
| `label` | `string`  | none    | Shown beside the ring. Without it the ring is read out as "Loading" (message `loading`). |
| `block` | `boolean` | unset   | Centres the spinner in a panel.                                                          |

No slots. Native attributes land on the root `<span>`.

## Rules

- Use it after about a second of waiting, and say what is being waited for ("Processing your payment").
- Use it for a single action; use Skeleton to hold the shape of content and LoadingBar for a page or list. Do not stack it with a LoadingBar.
- Stops spinning fast under reduced motion (a slow turn, 3s).

## Accessibility

- The root has `role="status"`, so the text is announced politely when it appears.
- The ring is `aria-hidden`; the text is either the visible label or screen-reader-only.
