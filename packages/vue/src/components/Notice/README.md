# ENotice

An inline message that stays until it is dealt with. Use [`EToast`](../Toast/README.md) for a message that follows an action and then goes.

```vue
<ENotice tone="warning" title="Form due" :heading-level="2">
  Please sign before Oct 22.
  <template #actions><EButton variant="outline">Sign now</EButton></template>
</ENotice>
```

## Props

<!-- props:start -->

| Prop           | Type                                                        | Default                             | Notes                                                                                                                                                          |
| -------------- | ----------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tone`         | `"neutral" \| "info" \| "success" \| "warning" \| "danger"` | `"info"`                            | `neutral` is plain information with no colour, `info` informs, `success` confirms, `warning` needs attention and `danger` is an error.                         |
| `title`        | `string`                                                    | **Required**                        | What happened, in one short line.                                                                                                                              |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6`                                | None                                | Renders the title as a heading of this level (1 to 6) so the notice is findable by heading. Without it the title is a paragraph.                               |
| `titleId`      | `string`                                                    | None                                | The id of the title element, for a parent that labels itself by it.                                                                                            |
| `role`         | `"alert" \| "status" \| false`                              | `"alert" for danger, else "status"` | The live role, which announces a change of the notice's words: `alert` at once, `status` politely. `false` removes it, for a parent that announces the notice. |
| `icon`         | `IconProp`                                                  | None                                | Replaces the icon of the tone.                                                                                                                                 |
| `closable`     | `boolean`                                                   | `false`                             | Shows the close button. Handle `@close` to remove the notice.                                                                                                  |
| `retry`        | `boolean`                                                   | `false`                             | Shows a retry button in the actions, for a failure that can be tried again. Handle `@retry`. It comes after anything in the `actions` slot.                    |
| `retryLabel`   | `string`                                                    | `"Try again"`                       | The retry button's label.                                                                                                                                      |
| `retrying`     | `boolean`                                                   | `false`                             | Marks the retry button busy while the retry runs: it shows a spinner and ignores presses.                                                                      |

<!-- props:end -->

`class`, `style` and attributes land on the `div` element.

`retry` adds a "Try again" button after anything in `actions` and emits `retry`; set `retrying` while the retry runs and the button shows it is busy and ignores presses. Use it on a `danger` notice for a failed load.

```vue
<ENotice tone="danger" title="The games could not be loaded" retry :retrying="loading" @retry="load" />
```

## Slots

| Slot      | Use                                                                                                                                                             |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default` | One sentence of detail under the title.                                                                                                                         |
| `actions` | Buttons for the next step, best as `outline` or `quiet`. They sit at the end of the row when the notice is 36rem wide or more and under the text when narrower. |

## Events

| Event   | Payload | Notes                         |
| ------- | ------- | ----------------------------- |
| `close` |         | The close button was pressed. |

## Accessibility

- `role="alert"` for `danger` and `role="status"` otherwise. The live role announces a change of the words once the notice is in the page; a notice that appears with its words in it is not reliably announced, so announce that moment with `useAnnouncer()` when it matters. Set `role` to `false` when a parent already announces it.
- The close button is named "Dismiss". It shows when `closable` is set; handle `@close` to remove the notice.
- The coloured edge is the slab on the inline start, so it flips in a right-to-left page. `neutral` is the plain tone, for a note with no urgency; colour is never the only cue, since the icon and the title say what it is.

## Keyboard

| Key          | Action                                          |
| ------------ | ----------------------------------------------- |
| Tab          | Moves to the actions, then to the close button. |
| Enter, Space | Presses the focused button.                     |

## Related

[`EEmptyState`](../EmptyState/README.md) for nothing to show.
