## Packages
(none needed)

## Notes
Uses existing shadcn/ui components already in repo (Dialog, Sheet, Table, Toast, etc.)
LocalStorage-backed “API simulation” lives fully in client/src/lib/localStoreApi.ts and is queried via TanStack Query hooks.
Maps: uses iframe embed with https://www.google.com/maps?q={lat},{lng}&z=12&output=embed (no API key).
Tailwind: uses existing font family vars (sans/serif/mono). Display font applied in CSS headings (no tailwind font-display class needed).
