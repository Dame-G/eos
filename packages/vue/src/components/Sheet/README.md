# ESheet

A panel docked over one side of a container (or the window) that leaves the content beside it usable, for a profile or settings opened over a live view. Use [`EDrawer`](../Drawer/README.md) when the page behind should wait, and [`EPopover`](../Popover/README.md) for a small panel anchored to a control.

```vue
<div class="workspace" style="position: relative">
  <BoardView />
  <ESheet v-model:open="profile" title="Your profile" size="lg" modal-below="48rem">
    <template #leading><EIconButton icon="arrow-left" label="Back" @click="back" /></template>
    <ProfileSections />
  </ESheet>
</div>
```

## Props

<!-- props:start -->

| Prop           | Type                         | Default      | Notes                                                                                                                                                         |
| -------------- | ---------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`         | `boolean`                    | `false`      | `v-model:open`: whether it is open. Without a binding it keeps its own state.                                                                                 |
| `title`        | `string`                     | **Required** | The heading and the accessible name: the thing the sheet shows, such as a profile or the settings.                                                            |
| `description`  | `string`                     | None         | A sentence under the title that says what it is for. It is shown, and read out as the description.                                                            |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `2`          | The level of the title's heading element, 1 to 6.                                                                                                             |
| `side`         | `"end" \| "start"`           | `"end"`      | The edge it docks to. `end` is the right in a left-to-right page and `start` the left; both flip in a right-to-left page.                                     |
| `size`         | `"sm" \| "md" \| "lg"`       | `"sm"`       | The width: `sm` (28rem), `md` (32rem) or `lg` (36rem), never wider than what it docks over.                                                                   |
| `viewport`     | `boolean`                    | `false`      | Docks it over the window instead of its nearest positioned container.                                                                                         |
| `modalBelow`   | `string`                     | None         | A width such as `48rem`: below it the sheet covers the whole window and is modal, so focus stays inside until it closes. Without it the sheet is never modal. |

<!-- props:end -->

`class`, `style` and attributes land on the sheet's `section`. It docks over its nearest positioned ancestor (give that one `position: relative`), full height and as wide as `size`, or over the window with `viewport`.

## Slots

| Slot      | Use                                                   |
| --------- | ----------------------------------------------------- |
| `default` | The content. It scrolls inside the sheet.             |
| `leading` | Before the title in the head, such as a Back button.  |
| `actions` | Buttons for the foot bar, with the main action first. |

## Events

| Event   | Payload | Notes                                                                            |
| ------- | ------- | -------------------------------------------------------------------------------- |
| `close` |         | The person closed it with the Close button or Escape. `open` is already `false`. |

## Accessibility

- A `role="dialog"` named by its title, without `aria-modal`: the content beside it stays in reach, for the keyboard and the pointer.
- Opening moves focus to the title, so a screen reader starts at the sheet's name. Closing returns focus to the control that opened it, unless the person has already moved on to the page.
- Escape closes it from anywhere on the page. A menu, popover or dialog open over it takes Escape first.
- With `modalBelow`, a window narrower than that width shows the sheet over the whole window with `aria-modal="true"`, and focus stays inside until it closes.
- The body takes a tab stop only while its content scrolls, so it can be scrolled with the arrow keys.
- The slide takes its length from `--e-duration-move`, so it stops moving under `prefers-reduced-motion`.

## Keyboard

| Key            | Action                                                                                                |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| Escape         | Closes the sheet and returns focus to the opener.                                                     |
| Tab, Shift+Tab | Moves through the sheet and on to the page. Below `modalBelow`, focus wraps inside the sheet instead. |

## Related

[`EAppShell`](../AppShell/README.md) for the page frame it often sits in.
