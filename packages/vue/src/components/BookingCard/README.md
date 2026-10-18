# EBookingCard

One upcoming booking. An ESurface (`article`) with an EAvatar or a date tile, an EStamp, an EMetaList and an actions bar.

```vue
<EBookingCard
  :date="new Date(2026, 9, 22)"
  time="9:30 am"
  title="Check-up"
  :provider="{ name: 'Amara Singh', role: 'Physician' }"
  location="Main office"
  status="confirmed"
>
  <template #actions><EButton variant="outline">Reschedule</EButton></template>
</EBookingCard>
```

## Props

| Prop            | Type                      | Notes                                                               |
| --------------- | ------------------------- | ------------------------------------------------------------------- |
| `date`          | `Date`                    | The day. Required.                                                  |
| `time`          | `string`                  | As you want it read: "9:30 am". Required.                           |
| `title`         | `string`                  | The kind of booking. Required.                                      |
| `subtitle`      | `string`                  | A line under the title when there is no provider.                   |
| `provider`      | `{ name, role?, photo? }` | Photo (initials if none), name and role lead the card.              |
| `location`      | `string`                  | Where it happens.                                                   |
| `status`        | `StampStatus`             | A preset for the stamp. Or give `tone` and `label`.                 |
| `tone`, `label` | `StampTone`, `string`     | Override the status's tone and word. A `label` alone shows a stamp. |
| `headingLevel`  | `1 \| 2 \| 3 \| 4`        | The level of the name or title. Default 3.                          |

## Slots

| Slot      | Use                                                      |
| --------- | -------------------------------------------------------- |
| `actions` | Buttons for the tinted bar at the foot. No slot, no bar. |

`class`, `style`, `id` and other attributes fall through to the `article`.

## Layout

- The provider leads: a 56px photo (initials if none), their name with the status at the end of the line, then their role with the booking type at the end of the same line in ink, then a ruled list with date, time and place. Everything lines up under the name.
- With no provider, the date tile takes the photo's place and the title takes the name's line. The status is top-right on every card, and the second line is always reserved, so all cards are the same height.
- In an EGrid, cards in a row take the tallest height, so a name that wraps never leaves a short card: the actions bar stays at the foot of every card.

## Accessibility

The name or title is a heading. The date tile is decorative (`aria-hidden`); the date is read in words, with the time, in the list of facts. Month names and the long date follow the configured locale; the "{date} at {time}" wording is the message `dateAtTime`.

## Rules

- Use it on the home page and the bookings list; choosing a new time is ECalendar and ESlotPicker.
