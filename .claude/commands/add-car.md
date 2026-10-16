---
description: Add cars to the site from Instagram post URLs
argument-hint: <instagram-post-url> [more urls…]
---

Use the `add-vehicle` skill for every Instagram post URL below. One vehicle per post.

URLs: $ARGUMENTS

For each post: scrape caption + photos, review the sheet, drop the price/name cover and any other overlaid
frames, crop padding, save to `assets/images/vehicles/<make>/<model>/<YYYYMMDD-HHmm>/` (post time, Tehran),
append the record to `data/vehicles.js` with a `coverIndex` pointing at an exterior shot, then verify
`car.html?id=<id>`. Report per car: id, status, price, images kept / dropped.
