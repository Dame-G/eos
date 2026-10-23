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

| Prop           | Type                         | Default      | Notes                                                                                                                            |
| -------------- | ---------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `tone`         | `NoticeTone`                 | `"info"`     | `info` informs, `success` confirms, `warning` needs attention and `danger` is an error announced at once.                        |
| `title`        | `string`                     | **Required** | What happened, in one short line.                                                                                                |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | None         | Renders the title as a heading of this level (1 to 6) so the notice is findable by heading. Without it the title is a paragraph. |
| `titleId`      | `string`                     | None         | The id of the title element, for a parent that labels itself by it.                                                              |
| `role`         | `string \| false`            | None         | The ARIA role. `danger` uses `alert`, the others `status`. `false` removes it, for a parent that announces the notice.           |
| `icon`         | `IconProp`                   | None         | Replaces the icon of the tone.                                                                                                   |
| `closable`     | `boolean`                    | `false`      | Shows the close button. Handle `@close` to remove the notice.                                                                    |

<!-- props:end -->

`class`, `style` and attributes land on the `div` element.

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

- A live region, with `role="alert"` for `danger` and `role="status"` otherwise. Set `role` to `false` when a parent already announces it.
- The close button is named "Dismiss". It shows when `closable` is set; handle `@close` to remove the notice.
- The coloured edge sits on the inline start, so it flips in a right-to-left page.

## Keyboard

| Key          | Action                                          |
| ------------ | ----------------------------------------------- |
| Tab          | Moves to the actions, then to the close button. |
| Enter, Space | Presses the focused button.                     |

## Related

[`EToast`](../Toast/README.md) for a message that goes by itself, [`EEmptyState`](../EmptyState/README.md) for nothing to show.
