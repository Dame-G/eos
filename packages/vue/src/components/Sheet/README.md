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

| Prop           | Type                          | Default      | Notes                                                                                                                                                                |
| -------------- | ----------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `open`         | `boolean`                     | `false`      | `v-model:open`: whether it is open. Without a binding it keeps its own state.                                                                                        |
| `title`        | `string`                      | **Required** | The heading and the accessible name: the thing the sheet shows, such as a profile or the settings.                                                                   |
| `description`  | `string`                      | None         | A sentence under the title that says what it is for. It is shown, and read out as the description.                                                                   |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6`  | `2`          | The level of the title's heading element, 1 to 6.                                                                                                                    |
| `side`         | `"end" \| "start"`            | `"end"`      | The edge it docks to. `end` is the right in a left-to-right page and `start` the left; both flip in a right-to-left page.                                            |
| `size`         | `"sm" \| "md" \| "lg"`        | `"sm"`       | The width: `sm` (28rem), `md` (32rem) or `lg` (36rem), never wider than what it docks over.                                                                          |
| `viewport`     | `boolean`                     | `false`      | Docks it over the window instead of its nearest positioned container.                                                                                                |
| `modalBelow`   | `string`                      | None         | A width such as `48rem`: below it the sheet covers the whole window and is modal, so focus stays inside until it closes. Without it the sheet is never modal.        |
| `measure`      | `boolean`                     | `false`      | Keeps the head, description and content to a readable line length (`--e-measure`) and centres them when the sheet is wider, such as when it covers the whole window. |
| `back`         | `boolean`                     | `false`      | Shows a Back button before the title, for a sheet that was reached from another view. Handle `@back`; it does not close the sheet.                                   |
| `closeLabel`   | `string`                      | `"Close"`    | The accessible name of the Close button.                                                                                                                             |
| `transition`   | `"slide" \| "fade" \| "none"` | None         | How it arrives: `slide` from its edge, `fade` in place, or `none`. Without it the sheet slides when docked and fades when it covers the window (`modalBelow`).       |

<!-- props:end -->

`class`, `style` and attributes land on the sheet's `section`. It docks over its nearest positioned ancestor (give that one `position: relative`), full height and as wide as `size`, or over the window with `viewport`.

`measure` keeps the head, description and content to `--e-measure` and centres them, so a sheet that covers the whole window (below `modalBelow`) still reads in a comfortable line. `back` adds a Back button before the title that emits `back`; the sheet stays open, so your handler decides where Back goes. `transition` sets the arrival: `slide`, `fade` or `none`. Without it the sheet slides when docked and fades over the window, which shows the page behind for the length of `--e-duration-move`; `none` skips it.

## Slots

| Slot      | Use                                                   |
| --------- | ----------------------------------------------------- |
| `default` | The content. It scrolls inside the sheet.             |
| `leading` | Before the title in the head, after the Back button.  |
| `actions` | Buttons for the foot bar, with the main action first. |

## Events

| Event   | Payload | Notes                                                                            |
| ------- | ------- | -------------------------------------------------------------------------------- |
| `close` |         | The person closed it with the Close button or Escape. `open` is already `false`. |
| `back`  |         | The person pressed the Back button (`back`). The sheet stays open.               |

## Accessibility

- A `role="dialog"` named by its title, without `aria-modal`: the content beside it stays in reach, for the keyboard and the pointer.
- Opening moves focus to the title, so a screen reader starts at the sheet's name. Closing returns focus to the control that opened it, unless the person has already moved on to the page.
- Escape closes it from anywhere on the page. A menu, popover or dialog open over it takes Escape first.
- With `modalBelow`, a window narrower than that width shows the sheet over the whole window with `aria-modal="true"`, and focus stays inside until it closes.
- The body takes a tab stop only while its content scrolls, so it can be scrolled with the arrow keys.
- A title too long for the head ends in an ellipsis and keeps its whole text as the heading's `title`. The Close button's name is `closeLabel`.
- The slide takes its length from `--e-duration-move`, so it stops moving under `prefers-reduced-motion`.

## Keyboard

| Key            | Action                                                                                                |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| Escape         | Closes the sheet and returns focus to the opener.                                                     |
| Tab, Shift+Tab | Moves through the sheet and on to the page. Below `modalBelow`, focus wraps inside the sheet instead. |

## Related

[`EAppShell`](../AppShell/README.md) for the page frame it often sits in.
