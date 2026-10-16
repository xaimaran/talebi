# Talebi JDM Automotive — dealership site

Static HTML prototype for Amir Talebi's dealership (امیر طالبی, Tehran, Shahrak-e Apadana). He sells his own
cars, mostly classics; he does not buy cars. The Instagram pages in `source` URLs are paid ad slots, not his
accounts. A .NET app will later replace the data file and manage content/SEO; keep the data shape stable.

Layout, type scale and motion are modelled on f1rstmotors.com (measured, mirrored for RTL). Code, copy,
branding and photos are our own — no f1rst text, logo, images or source.

## Layout
- `index.html`, `cars.html` (`?status=available|sold&make=&year=&price=&body=&sort=`), `car.html?id=<id>`, `gallery.html`
- `assets/css/site.css` — all styles; RTL via logical properties; dark default, light via `html[data-theme="light"]`.
- `assets/js/site.js` — header / full-screen menu / search / footer injected for every page; page logic by `<body data-page>`.
- `data/vehicles.js` — `window.SITE` + `window.VEHICLES`. Single source of truth (`.js`, so `file://` works).
- `assets/images/vehicles/<make>/<model>/<YYYYMMDD-HHmm>/NN.jpg` — post time in Tehran (UTC+03:30);
  ad covers removed, white padding cropped. `coverIndex` picks the exterior photo shown on cards.
- `_old-assets/` — superseded `001` folders kept for reference; not used by the site.
- `assets/images/makes/<make>-logo.png` — brand logos, wired through `SITE.logos` in `data/vehicles.js`
  (Proton has no file yet → text monogram).
- Home hero: set `SITE.hero.video` to an mp4 path; until then `SITE.hero.poster` is shown.

## Rules
- Persian UI, Persian digits on screen (`Intl.NumberFormat("fa-IR")`); Latin numbers in data. Prices in toman.
- Add/update cars: `/add-car <instagram urls>`, `/mark-sold <id>`; procedure in `.claude/skills/add-vehicle/SKILL.md`.
- Only captions and photos are data; never comments, never the ad page's caption footer.
