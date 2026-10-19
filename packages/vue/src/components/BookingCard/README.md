# EBookingCard

One upcoming booking with provider or date, status stamp, facts and an optional actions bar. Use it on the home page and the bookings list.

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

| Prop           | Type                         | Default | Notes                                                                                     |
| -------------- | ---------------------------- | ------- | ----------------------------------------------------------------------------------------- |
| `date`         | `Date`                       |         | Required. The day.                                                                        |
| `time`         | `string`                     |         | Required. As it should be read: "9:30 am".                                                |
| `title`        | `string`                     |         | Required. The kind of booking.                                                            |
| `subtitle`     | `string`                     |         | A line under the title when there is no provider.                                         |
| `provider`     | `{ name, role?, photo? }`    |         | Leads the card with photo (initials if none), name and role. Otherwise a date tile leads. |
| `location`     | `string`                     |         | Where it happens.                                                                         |
| `status`       | `StampStatus`                |         | Preset for the stamp.                                                                     |
| `tone`         | `StampTone`                  |         | Overrides the status's tone.                                                              |
| `label`        | `string`                     |         | The stamp's word. Overrides the status's; on its own it shows a stamp.                    |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `3`     | Heading level of the name or title.                                                       |

`class`, `style` and attributes land on the `article` element. Date wording follows the configured locale.

## Slots

| Slot      | Use                                                      |
| --------- | -------------------------------------------------------- |
| `actions` | Buttons for the tinted bar at the foot. No slot, no bar. |

## Accessibility

- The name or title is a heading. The date tile is hidden from assistive technology; the date is read in words, with the time, in the facts list.
