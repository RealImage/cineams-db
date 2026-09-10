# FLM Feed Comparison & Mapping Page

Replace the small side panel that opens from "View FLM Details" with a full page that puts the incoming feed on the left and the theatre in our system on the right, so the two can be compared and acted on.

## Behaviour

Opens at a new page from the row menu (and row click) on the FLM Feeds list. Two side-by-side panels, sticky action bar at the bottom.

### Status = Manual, New Theatre = No (mapped theatre)

```text
+---------------------------+---------------------------+
| Incoming FLM Feed         | Mapped Theatre (current)  |
| (editable)                | (read-only)               |
|  Theatre Name             |  Theatre Name             |
|  Display Name             |  Display Name             |
|  Address / City / State   |  Address / City / State   |
|  Country / Postal Code    |  Country / Postal Code    |
|  Chain (Circuit)          |  Chain                    |
|  Time Zone                |  Time Zone                |
|  Source Theatre ID        |  Theatre ID / UUID        |
|  Contact name/phone/email |  Contact                  |
|  Screens (auditoriums)    |  Screens                  |
+---------------------------+---------------------------+
```

- Incoming-side fields are read-only; the user selects which fields to copy over, not edit them.
- Fields that differ between the two sides are highlighted and auto-selected with a checkbox; the user can uncheck any field they do not want to copy over.
- A "Clear all" action at the top of the panel unselects every field.
- Bottom bar: Cancel, and "Update Theatre" which opens a confirmation dialog listing exactly which fields will change (old value to new value) before committing.

### Status = Manual, New Theatre = Yes (unmapped)

- Left panel: the same read-only incoming FLM details.
- Right panel: an empty state with two choices.
  1. **Map to existing theatre** — search box (theatre name, theatre ID, chain, location), matching results listed below, user selects one; the right panel then fills with that theatre's details and behaves exactly like the mapped case above (select fields to copy over), with the action becoming "Map & Update Theatre".
  2. **Create New Theatre** — creates the theatre from the incoming FLM values as-is; the user reviews the summary and confirms.
- Both paths end in a confirmation dialog summarising the action before it is applied.

### After confirming

- A success toast, feed status moves to Auto-Updated / Mapped, and the user returns to the FLM Feeds list.

## Screens data from the feed

The sample XML carries auditoriums with seating capacity, suites and devices. The incoming panel shows a compact screens summary (screen number/name, seating capacity, device count) with an expandable list; screen-level data is shown for comparison but is not editable in this first version.

## Technical notes

- New page `src/pages/FlmFeedDetails.tsx`, route `/theatres/flm-feeds/:id`, plus a Header title entry.
- Extend `src/data/flmFeedsData.ts` with the richer feed shape modelled on the sample XML (facility name, alternate IDs, circuit, timezone, contacts, structured address, auditorium/suite/device summary) and a `mappedTheatreId` for feeds where New Theatre = No.
- Reuse existing mock theatre data for the right-hand panel and the search; existing search/lookup dialog patterns (`AddTheatreLookupDialog`) are reused for the theatre search.
- `FlmDetailSheet` is removed from the row menu; the row menu item now navigates to the new page. Non-Manual feeds open the same page in read-only comparison mode.
- All state is local mock state, consistent with the rest of this prototype; no backend calls.
