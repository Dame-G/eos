# EPageHeader

The top of a page: title, optional breadcrumb, description, status and main actions. Every page has exactly one.

```vue
<EPageHeader title="Visit on Oct 2" description="Statement 4471 · Main office">
  <template #breadcrumb><EBreadcrumb :items="crumbs" /></template>
  <template #status><EStamp status="due" detail="Nov 1" /></template>
  <template #actions>
    <EButton icon="card">Pay $162.40</EButton>
    <EButton variant="outline" icon="download">Download</EButton>
  </template>
</EPageHeader>
```

## Props

| Prop           | Type                         | Default | Notes                                                                            |
| -------------- | ---------------------------- | ------- | -------------------------------------------------------------------------------- |
| `title`        | `string`                     |         | Required. Where the person is, in their words ("Visit on Oct 2").                |
| `description`  | `string`                     |         | A line under the title.                                                          |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `1`     | Heading level of the title. Change only when the header is not the page's title. |

`class`, `style` and attributes land on the `div` element.

## Slots

| Slot         | Use                                                                      |
| ------------ | ------------------------------------------------------------------------ |
| `breadcrumb` | An `EBreadcrumb`, above the title.                                       |
| `status`     | An `EStamp`, beside the title.                                           |
| `actions`    | `EButton`s, main one first (one primary, rest outline); hidden in print. |

## Accessibility

- The title is a heading (`h1` by default); keep one `h1` per page.
