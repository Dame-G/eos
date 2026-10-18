# ENotice

An inline message on a soft tint with a toned icon.

```vue
<ENotice tone="warning" title="Form due" heading-level="2">
  Please sign before Oct 22.
  <template #actions><EButton variant="outline">Sign now</EButton></template>
</ENotice>
```

## Props

| Prop           | Type                                           | Default | Notes                                                                                              |
| -------------- | ---------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------- |
| `title`        | `string`                                       |         | What happened, in one short line.                                                                  |
| `tone`         | `"info" \| "success" \| "warning" \| "danger"` | `info`  |                                                                                                    |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6`                   |         | Renders the title as a heading of that level. Otherwise it is a paragraph.                         |
| `titleId`      | `string`                                       |         | The id of the title element, for a parent that labels itself by it.                                |
| `role`         | `string \| false`                              |         | `danger` uses `alert`, the others `status`. `false` removes it when a parent announces the notice. |
| `icon`         | icon name                                      |         | Replaces the icon of the tone.                                                                     |
| `dismissible`  | `boolean`                                      |         | Forces the dismiss button on or off. Left out, it follows the `@dismiss` listener.                 |

`class`, `style` and attributes fall through to the root.

## Events and slots

| Name      | Use                                                                                                                                                                                      |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dismiss` | Emitted by the dismiss button. The button shows when a `@dismiss` listener is attached (checked on every render, so a listener added later counts), unless `dismissible` says otherwise. |
| `default` | One sentence of detail.                                                                                                                                                                  |
| `actions` | Buttons (see EActions); `outline` and `quiet` suit best. They follow the message in reading and tab order.                                                                               |

## Layout

The actions sit at the end of the row, centred on the message, when the notice is 36rem wide or more, and under the text, left-aligned, when it is narrower. The width is the notice's own (a container query), so a notice in a sidebar stacks on a wide screen.

## Accessibility

- A live region: `role="alert"` for danger, `role="status"` for the rest.
- The dismiss button is named "Dismiss" (the `dismiss` message).
- In forced colours the notice gets a visible border.

## Rules

- Say what happened and what to do in two sentences at most. One action is usually enough.
- A Notice stays until it is dealt with. A message that follows an action and then goes is an EToast.
- For a message about the whole page or session, put a Notice at the top of the main area.
