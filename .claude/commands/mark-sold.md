---
description: Move a car from available to the sold archive
argument-hint: <vehicle-id | instagram-url> [sold date YYYY-MM-DD]
---

Use the `add-vehicle` skill, section "Updates → Mark sold".

Target: $ARGUMENTS

Find the record in `data/vehicles.js` by `id` or by its `source` URL. If nothing matches, stop and say so.
Apply the changes with the Edit tool, then verify it appears under `cars.html?status=sold`.
