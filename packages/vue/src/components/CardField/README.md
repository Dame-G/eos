# ECardField

The frame for a payment provider's hosted card fields. Card numbers must never touch your own page or server, so this component draws the label, the edge, the focus ring and the reassurance note, and leaves a mount point for the provider's element. It renders no card inputs of its own.

```vue
<ECardField ref="card" :state="state" :error="declined" />
```

```ts
onMounted(() => provider.mount(card.value.mount)); // or mount-id="card-mount" and mount by id
```

## Props

| Prop       | Type                              | Notes                                                                                                 |
| ---------- | --------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `label`    | `string`                          | The mono kicker above the frame. Default "Card details".                                              |
| `state`    | `"loading" \| "ready" \| "error"` | `loading` shows a spinner while the provider loads; `error` turns the edge `danger`. Default `ready`. |
| `error`    | `string`                          | What to fix, such as a declined card. Shown under the frame, announced; implies `error` state.        |
| `note`     | `string`                          | The reassurance line. Default says the details go straight to the payment provider.                   |
| `required` | `boolean`                         | The word "Required" beside the label.                                                                 |
| `mountId`  | `string`                          | The id of the mount point, for a provider that mounts by id. Generated when left out.                 |
| `id`       | `string`                          | The id the label, error and note ids are built from. Generated when left out.                         |

Slot: the provider's element (default), when you render it rather than mount it. While `loading` the slot is replaced by a spinner. Exposed: `mount` (the mount point element, for a provider that mounts into an element). `class` and other attributes land on the wrapper.

## Rules

- The frame is a `role="group"` named by the label and described by the error, or by the note when there is none.
- The frame gets the same edge, hover and focus treatment as an input, and shows the focus ring when the provider's iframe is focused (`:focus-within`).
- Style the provider's own field to match: 16px text, `ink` colour, no border of its own.
- The frame is 48px tall at least and the provider's element fills it.
