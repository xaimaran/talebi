---
name: add-vehicle
description: Add cars to the Talebi dealership site from Instagram ad posts (classiccarssale / classiccarssale2), or update one (mark sold, change price, change cover photo). Use when the user gives Instagram post URLs for cars, or asks to add, update, sell-mark or remove a vehicle in data/vehicles.js.
---

# Add / update a vehicle

Data lives in **one file**: `data/vehicles.js` (`window.VEHICLES`). Pages render from it; never hard-code a car
in HTML. Edit it with the **Edit** tool only — never a script.

## Business facts (all copy must respect these)

- Amir Talebi owns a dealership and sells **his own cars**, mostly classics. He does not buy cars and is not an
  ad service.
- The Instagram pages are third-party pages where he pays to show his stock. They are **not** his accounts:
  never present the handles as his socials. The caption footer (`ماشینتو آگهی کن…`, `عکس ماشینت رو دایرکت بفرست…`)
  belongs to the ad page — ignore it.
- Only the caption and photos are data. Comments are never data.

## 1. Folder and id = post time (Tehran)

Folder: `assets/images/vehicles/<make>/<model>/<YYYYMMDD-HHmm>/NN.jpg`
id: `<make>-<model>-<YYYYMMDD-HHmm>` (e.g. `honda-accord-20260916-2207`)

`<make>/<model>` = lowercase English (`hyundai/verna`, `proton/wira`, `mazda/323`). The timestamp is the post's
`time[datetime]` (earliest one in `main` — later ones are caption edits/comments), converted from UTC to
Tehran **UTC+03:30** (Iran has no DST since 2022). `postedAt` = same instant, `YYYY-MM-DDTHH:mm+03:30`.

## 2. Start the pipeline

`node .claude/skills/add-vehicle/scripts/receiver.mjs` in the background (port 8765). It stages originals in
`%TEMP%/talebi-staging/<shortcode>/`, serves review sheets, crops, and writes final files. It refuses to
overwrite a non-empty target folder.

## 3. Scrape each post (Claude in Chrome)

Load chrome tools in one ToolSearch call (`tabs_context_mcp, tabs_create_mcp, navigate, javascript_tool,
get_page_text, computer, tabs_close_mcp`). Navigate to the post, then run in `javascript_tool`:

```js
const KEY=location.pathname.split('/').filter(Boolean).pop();const sleep=ms=>new Promise(r=>setTimeout(r,ms));
for(let i=0;i<20&&!document.querySelector('main');i++)await sleep(500);await sleep(2000);
const main=document.querySelector('main');
const times=[...main.querySelectorAll('time[datetime]')].map(t=>t.getAttribute('datetime')).sort();
const txt=main.innerText.slice(0,2500);const seen=new Map();
const grab=()=>{main.querySelectorAll('ul li img').forEach(i=>{const best=(i.srcset||'').split(',').map(s=>s.trim().split(' ')).sort((a,b)=>parseInt(b[1])-parseInt(a[1]))[0];const u=best&&best[0]?best[0]:i.src;const k=u.split('?')[0];if(!seen.has(k))seen.set(k,u)})};
grab();if(!seen.size){[...main.querySelectorAll('img')].filter(i=>i.naturalWidth>=600).forEach(i=>seen.set(i.src.split('?')[0],i.src))}
for(let k=0;k<25;k++){const nx=main.querySelector('button[aria-label="Next"]');if(!nx)break;nx.click();await sleep(1500);grab();}
const urls=[...seen.values()];
location.href='http://127.0.0.1:8765/#'+encodeURIComponent(JSON.stringify({key:KEY,urls,meta:{url:location.origin+location.pathname,times,text:txt}}));
KEY+' imgs '+urls.length+' first '+times[0]
```

Why the fragment hand-off: Chrome blocks extension-triggered downloads and javascript_tool refuses to return
signed CDN URLs; the fragment never leaves the browser. Check the receiver log: every post must show its full
image count; a `FAILED` line means a CDN timeout — rerun that post.

Read captions back with `node -e` over `%TEMP%/talebi-staging/*/meta.json` (print from the first `•` up to `🔥`).

## 4. Review, drop, crop

Open `http://127.0.0.1:8765/sheet?key=<shortcode>` and screenshot it. Decide:

- **Drop** the ad cover — frame 0 is almost always the photo with the big red/black name + price banner
  (`قیمت ۱۲۸۰`, `مدل ۸۸`). Drop any other frame with overlaid name/price text.
- White padding (letterboxed frames) is removed automatically — keep those frames.
- Note the index (after drops, renumbered from 00) of the best **exterior three-quarter** shot → `coverIndex`
  (omit when it is 0). Frame 0 after the drop is often an engine bay or interior.

Process: `http://127.0.0.1:8765/process?key=<shortcode>&dir=<make>/<model>/<YYYYMMDD-HHmm>&drop=0`
and wait for the page text to start with `DONE`. Each line shows the crop box; padded frames show a non-zero
offset.

### Card cover (`cover.jpg`)

Cards use a 4:3 crop of the cover photo saved as `<dir>/cover.jpg`. Preview, then write:
`http://127.0.0.1:8765/covers#<encodeURIComponent(JSON.stringify([{dir, file:"NN.jpg", y:0.6}]))>` →
check the whole car (roof to tyres) is inside the frame, adjust `y` (0.5–0.65 typical), then reload with
`/covers?go=1#…`. Overwrites an existing cover.

## 5. Caption → fields

| Caption | Field |
|---|---|
| `❌️فروش رفت❌️` (any variant, e.g. `در یک ساعت فروش رفت`) | `status: "sold"`, else `"available"` |
| line 1, e.g. `هوندا آکورد Exi` | `make.fa`, `model.fa`, `trim` |
| `مدل ۱۳۸۸` (13xx/14xx) / `مدل ۱۹۹۱` (19xx/20xx) | `year` + `calendar: "jalali"` / `"gregorian"` |
| `اتومات` | `transmission` (otherwise `""` — do not guess from photos) |
| `بدنه…`, `سقف و ستون…`, `دور رنگ` | `condition.body` |
| `شاسی…`, `سینی`, `پالونی` | `condition.chassis` |
| `داخل کابین…` | `condition.cabin` |
| `کولر…`, `ادوات برقی`, `آمپر` | `condition.electrics` |
| `وضعیت موتور و گیربکس…` | `condition.engine` |
| `زیربندی…` | `condition.suspension` |
| `سانروف`, `صندلی برقی`, `کروز کنترل`, `رینگ فابریک` | `features[]` |
| `کارکرد ۱۹۰.۰۰۰` | `mileageKm: 190000` |
| `بیمه ۶ ماه` / `معاینه ۱ سال` / `لاستیک ۶۰٪` | `insuranceMonths: 6` / `inspectionMonths: 12` / `tiresPercent: 60` |
| `قیمت : ۱.۲۸۰.۰۰۰.۰۰۰` or `قیمت ۷۴۰` (millions) | `price: 1280000000` / `740000000` (toman) |

Colour and body style may be read from the photos (`سفید`, `نقره‌ای`, `لیفت‌بک`, `هاچ‌بک`). Missing → `null`/`""`.
`soldAt` stays `null` unless the user gives a date. `featured: true` puts an available car in the home hero.
`description`: one or two original Persian sentences from the caption facts — no invented history.
`source`: the post URL. `seo.title` ≤ 60 chars (`… | طالبی اتوموتیو`, sold → `— فروخته شد`);
`seo.description` ≤ 160 chars (sold → prefix `آرشیو فروش:`).

Record shape — copy an existing entry in `data/vehicles.js` and change values; list every image path explicitly.

## 6. Updates

- **Mark sold** — `status: "sold"`, `featured: false`, append ` — فروخته شد` to `seo.title`, prefix
  `seo.description` with `آرشیو فروش:`; keep `price`; `soldAt` only if given.
- **Price change** — edit `price` only.
- **Cover change** — set `coverIndex`.
- **Remove** — only on explicit request; leave the image folder unless told otherwise.

## 7. Verify

Serve the repo on `127.0.0.1` and check `index.html` (hero, featured, archive), `cars.html?status=<status>`,
`car.html?id=<id>` (every thumb loads, cover is an exterior), `gallery.html`. No console errors. Stop the
receiver and close tabs you opened.
