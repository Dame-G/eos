# EUpload

A dropzone for attaching files, clickable and droppable. The zone is a well pressed into the page; each chosen file is a raised tile with the icon of its kind and its size, and a file left out is listed with why. Without `multiple` the file fills the zone, shown large. Use [`ESignatureField`](../SignatureField/README.md) for a signature rather than an uploaded image.

```vue
<EUpload v-model="files" label="Insurance card" accept=".pdf,.jpg,.png" multiple hint="Up to 5 MB each." />
<EUpload label="Referral" @update:model-value="upload" />
<EUpload v-model="photos" label="Photos" accept="image/*" multiple :max-files="4" />
```

## Props

<!-- props:start -->

| Prop         | Type      | Default      | Notes                                                                                                                                                                                                                                            |
| ------------ | --------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `modelValue` | `File[]`  | `[]`         | `v-model`: the chosen files.                                                                                                                                                                                                                     |
| `hideLabel`  | `boolean` | `false`      | Hides the label from the page and keeps it for screen readers.                                                                                                                                                                                   |
| `hint`       | `string`  | None         | Help that stays under the control.                                                                                                                                                                                                               |
| `error`      | `string`  | None         | What to fix. Replaces the hint, marks the control invalid and is announced.                                                                                                                                                                      |
| `required`   | `boolean` | `false`      | Sets the `required` attribute and shows "Required" beside the label.                                                                                                                                                                             |
| `optional`   | `boolean` | `false`      | Shows "Optional" beside the label. Only the rarer of required and optional needs a flag.                                                                                                                                                         |
| `disabled`   | `boolean` | `false`      | Disables the control. A disabled control posts nothing.                                                                                                                                                                                          |
| `readonly`   | `boolean` | `false`      | Shows the value but blocks editing. The control stays focusable and selectable, and still posts its value.                                                                                                                                       |
| `id`         | `string`  | `generated`  | The id of the control. The label points at it.                                                                                                                                                                                                   |
| `label`      | `string`  | **Required** | The visible label above the dropzone.                                                                                                                                                                                                            |
| `accept`     | `string`  | None         | Accepted types, separated by commas: extensions such as `.pdf`, MIME types such as `image/png` and wildcards such as `image/*`. Passed to the input, shown under the prompt ("PDF, PNG, image/*") and also applied to dropped files.             |
| `multiple`   | `boolean` | `false`      | Allows choosing more than one file. New files are added to the list, and a file already in it (same name, size and date) is not added twice. Without it, a choice replaces the file, and the others of several are rejected with reason `count`. |
| `maxSize`    | `number`  | None         | The largest file allowed, in bytes. Shown under the prompt ("Up to 5 MB"); a larger one is left out and announced as "1 file is larger than 5 MB".                                                                                               |
| `maxFiles`   | `number`  | None         | The most files the list can hold with `multiple`. Shown under the prompt; further files are left out and announced.                                                                                                                              |
| `name`       | `string`  | None         | The name submitted with a form.                                                                                                                                                                                                                  |
| `preview`    | `boolean` | `true`       | Shows an image file as itself in place of its icon: a small thumbnail in the list, large in a single upload. Set it to `false` where images should not show on screen.                                                                           |

<!-- props:end -->

`class` and `style` land on the wrapper `div`. Other attributes land on the `input type="file"` element. Exposes `input` and `focus()`.

## Events

| Event    | Payload              | Notes                                                                                                                                                                                                                          |
| -------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `reject` | `{ file, reason }[]` | Files left out. `reason` is `type` (not in `accept`), `size` (over `maxSize`) or `count` (over `maxFiles`, or more than one file without `multiple`). The upload lists them itself; use the event to log or to block a submit. |

## Accessibility

- The visually hidden file input is the control and takes keyboard focus. Its accessible name is the label followed by the dropzone text.
- `accept`, `maxSize`, `maxFiles` and `multiple` apply to dropped files as well as chosen ones. Files that do not fit are left out, and a choice where every file is left out keeps the list as it was. With `multiple` new files are added to the list and a file already listed is not added again. Without it a choice replaces the file, and the others of several are rejected with reason `count`.
- Adding files announces "2 files added", plus "1 file was not accepted", "1 file is larger than 5 MB" or "Only 3 files can be added" (assertively) when some were left out. Removing a file announces "Removed name.pdf" and returns focus to the input.
- With `readonly` the files stay listed and the input stays focusable, but drops and the picker do nothing and there is no Remove, and the files are still submitted. A file input has no `readonly` of its own and `aria-readonly` is not allowed on it, so the input is described as "Read only".
- Files left out are listed under the zone, each with why ("Not an accepted type", "Larger than 5 MB", "Only 3 files can be added") and a Dismiss button, until dismissed or until the next choice. Dismissing returns focus to the input.
- Without `multiple` the chosen file fills the zone: the image itself, or a large icon of its kind for any other file, then its name and size. The zone stays the input's label, so choosing or dropping again replaces the file; its accessible name is the field label, then the file's name and size. Its Remove button sits in the corner.
- With `multiple` and `maxFiles`, "2 of 3" shows in the zone's corner for the eye; it is hidden from screen readers, which count the list.
- An image file shows as itself in place of its icon (a thumbnail in the list, large in a single upload), with empty `alt` since its name is beside it. Set `preview` to `false` where images should not show on screen. Each thumbnail is an object URL, released when its file leaves the list.
- While a file is dragged anywhere over the page the zone's edge turns dashed in the primary colour, and over the zone it takes the brand tint and sinks a step deeper.
- A disabled upload with `multiple` that already holds files shows only the files, disabled, and no zone. Empty, it shows the zone, disabled.
- Each listed file has a Remove button named "Remove name.pdf". A disabled or read-only file has none, since it cannot be removed. Sizes are shown in bytes, kB or MB in the configured locale.

## Keyboard

| Key          | Action                                                                           |
| ------------ | -------------------------------------------------------------------------------- |
| Tab          | Focuses the file input (the zone shows the focus ring), then each Remove button. |
| Enter, Space | Opens the file picker, or removes the file on a Remove button.                   |

## Related

[`EField`](../Field/README.md) to wrap your own control, [`ESignaturePad`](../SignaturePad/README.md) to capture a drawn signature.
