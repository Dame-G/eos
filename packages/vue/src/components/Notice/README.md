# ENotice

An inline message on a soft tint that stays until it is dealt with. Use `EToast` for a message that follows an action and then goes.

```vue
<ENotice tone="warning" title="Form due" :heading-level="2">
  Please sign before Oct 22.
  <template #actions><EButton variant="outline">Sign now</EButton></template>
</ENotice>
```

## Props

| Prop           | Type                                           | Default | Notes                                                                                         |
| -------------- | ---------------------------------------------- | ------- | --------------------------------------------------------------------------------------------- |
| `tone`         | `"info" \| "success" \| "warning" \| "danger"` | `info`  | `success` confirms; `warning` needs attention; `danger` is an error and is announced at once. |
| `title`        | `string`                                       |         | Required. What happened, in one short line.                                                   |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6`                   |         | Renders the title as a heading of that level; otherwise a paragraph.                          |
| `titleId`      | `string`                                       |         | Id of the title element, for a parent that labels itself by it.                               |
| `role`         | `string \| false`                              |         | `danger` uses `alert`, the others `status`. `false` removes it.                               |
| `icon`         | `IconProp`                                     |         | Replaces the tone's icon.                                                                     |
| `closable`     | `boolean`                                      |         | Forces the close button on or off. Left out, it shows when a `@close` listener is attached.   |

`class`, `style` and attributes land on the `div` element.

## Slots

| Slot      | Use                                                                                           |
| --------- | --------------------------------------------------------------------------------------------- |
| `default` | One sentence of detail.                                                                       |
| `actions` | Buttons (`outline` or `quiet`); at the row end from 36rem wide, under the text when narrower. |

## Events

| Event   | Payload | Notes                         |
| ------- | ------- | ----------------------------- |
| `close` |         | The close button was pressed. |

## Accessibility

- A live region: `role="alert"` for `danger`, `role="status"` otherwise. Set `role` to `false` when a parent already announces it.
- The close button is named "Dismiss".
