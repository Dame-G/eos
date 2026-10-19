# ECardField

The frame, label and reassurance note for a payment provider's hosted card fields, so card numbers never touch your page or server. It renders no card inputs itself.

```vue
<ECardField ref="card" :state="state" :error="declined" />
```

```ts
onMounted(() => provider.mount(card.value.mount)); // or mount-id="card-mount" and mount by id
```

## Props

| Prop       | Type                              | Default        | Notes                                                                   |
| ---------- | --------------------------------- | -------------- | ----------------------------------------------------------------------- |
| `label`    | `string`                          | `Card details` | The kicker above the frame.                                             |
| `state`    | `"loading" \| "ready" \| "error"` | `ready`        | `loading` shows a spinner in place of the slot.                         |
| `error`    | `string`                          |                | What to fix, such as a declined card. Announced; implies `error` state. |
| `note`     | `string`                          | built-in       | The reassurance line; the default says details go to the provider.      |
| `required` | `boolean`                         |                | Shows the word "Required".                                              |
| `mountId`  | `string`                          | generated      | Id of the mount point, for a provider that mounts by id.                |
| `id`       | `string`                          | generated      | Base for the label, error and note ids.                                 |

`class`, `style` and attributes land on the `div` element. Exposes `mount`, the mount point element. Style the provider's field to match: 16px text, `ink` colour, no border.

## Slots

| Slot      | Use                                                             |
| --------- | --------------------------------------------------------------- |
| `default` | The provider's element, when you render it instead of mounting. |

## Accessibility

- The frame is a `role="group"` named by the label and described by the error, or by the note when there is none.
- The focus ring shows when the provider's iframe is focused.
