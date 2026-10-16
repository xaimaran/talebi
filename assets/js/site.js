/* ==========================================================================
   Talebi JDM Automotive — site script
   Shell (header, full-screen menu, search, footer), theme, motion, card renderer,
   and page initialisers chosen by <body data-page>.
   Data: data/vehicles.js (window.SITE, window.VEHICLES).
   ========================================================================== */
(function () {
  "use strict";

  const SITE = window.SITE || {};
  const ALL = (window.VEHICLES || []).slice()
    .sort((a, b) => (a.status === "sold") - (b.status === "sold") || String(b.postedAt).localeCompare(String(a.postedAt)));

  /* ---------- theme ---------- */
  const THEME_KEY = "talebi-theme";
  const readTheme = () => { try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; } };
  function setTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem(THEME_KEY, t); } catch (e) { /* storage blocked */ }
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.content = t === "light" ? "#ffffff" : "#0c0c0c";
  }
  setTheme(readTheme() || "dark");
  const toggleTheme = () => setTheme(document.documentElement.getAttribute("data-theme") === "light" ? "dark" : "light");

  /* ---------- helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const fa = new Intl.NumberFormat("fa-IR", { useGrouping: false });
  const faG = new Intl.NumberFormat("fa-IR");
  const n = (x) => fa.format(x);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const isSold = (v) => v.status === "sold";
  const title = (v) => `${v.make.fa} ${v.model.fa}${v.trim ? " " + v.trim : ""}`;
  const titleY = (v) => `${title(v)} ${n(v.year)}`;
  const href = (v) => `car.html?id=${encodeURIComponent(v.id)}`;
  // photos with the chosen exterior cover first (coverIndex in data; default 0)
  const pics = (v) => { const c = v.coverIndex || 0; return [v.images[c], ...v.images.filter((_, i) => i !== c)]; };
  // 4:3 card cover cropped around the car (cover.jpg next to the photos)
  const coverSrc = (v) => v.images[0].replace(/\d{2}\.jpg$/, "cover.jpg");
  const gYear = (v) => (v.calendar === "jalali" ? v.year + 621 : v.year);
  const priceFull = (v) => (v.price ? faG.format(v.price) : "توافقی");
  const kmText = (v) => (v.mileageKm != null ? `${faG.format(v.mileageKm)} کیلومتر` : "کارکرد اعلام نشده");
  const initials = (en) => en.replace(/[^A-Za-z0-9 ]/g, "").split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  // brand logo from SITE.logos, falling back to a text monogram when no file exists (e.g. Proton)
  const logoImg = (en, cls) => {
    const l = (SITE.logos || {})[en];
    return l ? `<img class="${cls} logo-img${l.invert ? " inv" : ""}" src="${l.src}" alt="${esc(en)}" loading="lazy">`
      : `<span class="${cls} logo-txt">${initials(en)}</span>`;
  };
  const tel = `tel:${SITE.phone}`;
  const sms = `sms:${SITE.phone}`;

  /* ---------- icons ---------- */
  const svg = (d, cls = "ico") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const I = {
    search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    moon: svg('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>', "ico moon"),
    sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>', "ico sun"),
    phone: svg('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>'),
    close: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
    left: svg('<path d="m15 18-6-6 6-6"/>'),
    right: svg('<path d="m9 18 6-6-6-6"/>'),
    down: svg('<path d="m6 9 6 6 6-6"/>'),
    arrow: svg('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
    share: svg('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>'),
    chat: svg('<path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.5L3 21l2-5.5A8.5 8.5 0 1 1 21 11.5z"/>'),
    link: svg('<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>'),
    expand: svg('<path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>'),
    pin: svg('<path d="M12 22s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>')
  };
  // plate mark: steering wheel in a ring (the red number-plate badge on his cars)
  const MARK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="2.6"/><path d="M2.5 10.5h7M14.5 10.5h7M12 14.6V22"/></svg>';
  const LOGO = `<a class="logo" href="index.html" aria-label="${esc(SITE.brandFa)}"><span class="plate">${MARK}<span><b>TALEBI</b><em>JDM AUTOMOTIVE</em></span></span></a>`;

  /* ---------- shell ---------- */
  // [label, href | null, children[[label, href, hint]]] — items with children open in place
  const NAV = [
    ["خودروها", null, [["خودروهای موجود", "cars.html?status=available", "آماده بازدید"], ["آرشیو فروش", "cars.html?status=sold", "خودروهای فروخته‌شده"], ["همه برندها", "cars.html?status=available#brands", "هوندا، هیوندای، مزدا…"]]],
    ["رسانه", null, [["گالری تصاویر", "gallery.html", "عکس‌های واقعی خودروها"], ["خودروهای موجود", "gallery.html?tab=available", "گالری موجودی"], ["آرشیو تصاویر", "gallery.html?tab=sold", "گالری فروخته‌شده‌ها"]]],
    ["درباره ما", null, [["داستان نمایشگاه", "about.html", "امیر طالبی و کلاسیک‌ها"], ["روش کار ما", "about.html#how", "گزارش فنی شفاف"]]],
    ["تماس", "contact.html", null]
  ];

  function shell() {
    const body = document.body;
    const header = document.createElement("header");
    header.className = "site-header";
    header.innerHTML = `
      <div class="bar">
        <button class="menu-btn" type="button" aria-label="منو" aria-expanded="false" data-menu>
          <span class="lines"><i></i><i></i><i></i></span><span class="label">منو</span>
        </button>
        ${LOGO}
        <div class="actions">
          <button class="icon-btn" type="button" aria-label="جستجو" data-search>${I.search}</button>
          <button class="icon-btn theme-btn" type="button" aria-label="تغییر تم" data-theme-toggle>${I.moon}${I.sun}</button>
          <a class="icon-btn hide-sm" href="${tel}" aria-label="تماس">${I.phone}</a>
        </div>
      </div>
      <span class="progress" aria-hidden="true"></span>`;
    body.prepend(header);

    const mapSrc = `https://maps.google.com/maps?q=${encodeURIComponent(SITE.mapQuery || SITE.address)}&z=15&output=embed`;
    const mapLink = SITE.mapLink || `https://maps.google.com/?q=${encodeURIComponent(SITE.mapQuery || SITE.address)}`;
    const extra = document.createElement("div");
    extra.innerHTML = `
      <div class="curtain" aria-hidden="true"><span class="plate">${MARK}<span><b>TALEBI</b><em>JDM AUTOMOTIVE</em></span></span></div>
      <div class="menu" aria-hidden="true">
        <div class="bg"></div><div class="glow a"></div><div class="glow b"></div>
        <div class="menu-top">
          <button class="icon-btn menu-x" type="button" aria-label="بستن منو" data-menu-close>${I.close}</button>
          ${LOGO}
          <span class="spacer"></span>
        </div>
        <div class="inner">
          <nav aria-label="منوی اصلی"><ul>
            ${NAV.map(([t, h, kids], i) => {
              const head = `<span class="num">${String(i + 1).padStart(2, "0")}</span><span class="txt"><span>${t}</span></span><span class="go">${kids ? I.down : I.left}</span>`;
              return `<li style="--d:${80 + i * 60}ms" class="${kids ? "has-sub" : ""}">
                ${kids ? `<button type="button" class="row" aria-expanded="false">${head}</button>
                  <div class="sub"><div class="sub-in">${kids.map(([kt, kh, hint]) => `<a href="${kh}"><b>${kt}</b><small>${hint}</small>${I.left}</a>`).join("")}</div></div>`
                  : `<a class="row" href="${h}">${head}</a>`}
              </li>`;
            }).join("")}
          </ul></nav>
          <aside>
            <div>
              <p class="k">VISIT · محل بازدید</p>
              <a class="map-card" href="${mapLink}" target="_blank" rel="noopener" aria-label="باز کردن نقشه">
                <iframe title="نقشه محل بازدید" data-src="${mapSrc}" loading="lazy" referrerpolicy="no-referrer" tabindex="-1"></iframe>
                <span class="cap"><span>${esc(SITE.address)}</span><small>مسیریابی ${I.left}</small></span>
              </a>
              <a class="tel" href="${tel}">${I.phone}<span class="ltr">${esc(SITE.phoneFa)}</span></a>
            </div>
            <button class="mode" type="button" data-theme-toggle>${I.sun}<span>LIGHT / DARK</span></button>
          </aside>
        </div>
        <div class="menu-bar">
          <a class="tel" href="${tel}">${I.phone}<span class="ltr">${esc(SITE.phoneFa)}</span></a>
          <button class="mode" type="button" data-theme-toggle>${I.sun}<span>LIGHT / DARK</span></button>
        </div>
      </div>
      <div class="search" role="dialog" aria-modal="true" aria-label="جستجوی خودرو">
        <div class="box">
          <div class="field">${I.search}<input type="search" placeholder="برند، مدل یا سال…" aria-label="جستجو"><button class="icon-btn" type="button" data-search-close aria-label="بستن">${I.close}</button></div>
          <div class="res"></div>
        </div>
      </div>`;
    body.append(...extra.children);

    const foot = document.createElement("footer");
    foot.className = "footer";
    foot.innerHTML = `
      <div class="bgx"></div><div class="grid-lines"></div><div class="glow1"></div>
      <div class="wrap">
        <div class="cols">
          <div class="about">
            ${LOGO.replace('class="logo"', 'class="logo" style="position:static;transform:none;display:inline-flex"')}
            <p>نمایشگاه ${esc(SITE.owner)}؛ فروش خودروهای کلاسیک و گزیده از موجودی خود نمایشگاه، با گزارش فنی شفاف برای هر خودرو.</p>
            <p class="k">VISIT</p>
            <span class="addr">${esc(SITE.address)}</span>
            <a class="tel ltr" href="${tel}">${esc(SITE.phoneFa)}</a>
          </div>
          <div class="links">
            <div><h4>CARS</h4><ul>
              <li><a href="cars.html?status=available"><span>خودروهای موجود</span></a></li>
              <li><a href="cars.html?status=sold"><span>آرشیو فروش</span></a></li></ul></div>
            <div><h4>DISCOVER</h4><ul>
              <li><a href="gallery.html"><span>گالری تصاویر</span></a></li>
              <li><a href="about.html"><span>درباره نمایشگاه</span></a></li>
              <li><a href="contact.html"><span>تماس و بازدید</span></a></li></ul></div>
            <div><h4>CONTACT</h4><ul>
              <li><a href="${tel}"><span>تماس تلفنی</span></a></li>
              <li><a href="${sms}"><span>ارسال پیامک</span></a></li></ul></div>
          </div>
        </div>
        <div class="bottom"><span>© ${n(new Date().getFullYear())} ${esc(SITE.brandFa)} · ${esc(SITE.owner)} · <a href="assets/images/pages/CREDITS.md">اعتبار تصاویر</a></span><span class="latin">${esc(SITE.brandEn)}</span></div>
      </div>`;
    const main = $("main");
    main.after(foot);

    // menu
    const menuBtn = $("[data-menu]"), menu = $(".menu");
    const setMenu = (open) => {
      body.classList.toggle("menu-open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-hidden", String(!open));
      document.documentElement.style.overflow = open ? "hidden" : "";
      // the map is a third-party embed: load it only when the menu is first opened
      const fr = $(".map-card iframe", menu);
      if (open && fr && !fr.src && getComputedStyle($("aside", menu)).display !== "none") fr.src = fr.dataset.src;
    };
    menuBtn.addEventListener("click", () => setMenu(!body.classList.contains("menu-open")));
    $("[data-menu-close]").addEventListener("click", () => setMenu(false));
    $$(".menu nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
    // submenus: one open at a time
    $$(".menu .has-sub > .row").forEach((b) => b.addEventListener("click", () => {
      const li = b.parentElement, open = !li.classList.contains("open");
      $$(".menu .has-sub.open").forEach((o) => { o.classList.remove("open"); $(".row", o).setAttribute("aria-expanded", "false"); });
      li.classList.toggle("open", open); b.setAttribute("aria-expanded", String(open));
    }));
    $$("[data-theme-toggle]").forEach((b) => b.addEventListener("click", toggleTheme));

    // search
    const sbox = $(".search"), sin = $("input", sbox), sres = $(".res", sbox);
    const draw = () => {
      const q = sin.value.trim().toLowerCase();
      const list = ALL.filter((v) => !q || [v.make.fa, v.make.en, v.model.fa, v.model.en, v.trim, v.year, n(v.year), v.color].join(" ").toLowerCase().includes(q));
      sres.innerHTML = list.length ? list.map((v) => `<a href="${href(v)}"><img src="${coverSrc(v)}" alt="" loading="lazy"><span><b>${esc(titleY(v))}</b><small>${isSold(v) ? "فروخته شد" : priceFull(v) + " " + esc(SITE.currency)}</small></span></a>`).join("")
        : '<div class="none">خودرویی پیدا نشد.</div>';
    };
    const openS = () => { sbox.classList.add("open"); draw(); setTimeout(() => sin.focus(), 30); };
    const closeS = () => sbox.classList.remove("open");
    $("[data-search]").addEventListener("click", openS);
    $("[data-search-close]").addEventListener("click", closeS);
    sbox.addEventListener("click", (e) => { if (e.target === sbox) closeS(); });
    sin.addEventListener("input", draw);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { closeS(); setMenu(false); }
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); openS(); }
    });

    // scroll progress + header state
    const bar = $(".progress");
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
      header.classList.toggle("scrolled", scrollY > 20);
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // page transition: the curtain covers the page on load and lifts; internal links drop it before navigating
  function transitions() {
    const cur = $(".curtain");
    if (!cur) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add("page-in")));
    // returning via back/forward cache: never leave the curtain down
    addEventListener("pageshow", (e) => { if (e.persisted) { document.body.classList.remove("page-out"); document.body.classList.add("page-in"); } });
    if (reduce) return;
    document.addEventListener("click", (e) => {
      const a = e.target.closest("a[href]");
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || !/\.html$|\/$/.test(url.pathname)) return;
      if (url.pathname === location.pathname && url.hash) return; // in-page anchor
      e.preventDefault();
      document.body.classList.add("page-out");
      setTimeout(() => { location.href = url.href; }, 520);
    });
  }

  function reveal() {
    const els = $$("[data-reveal]");
    if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }), { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    els.forEach((e) => io.observe(e));
  }

  /* ---------- card ---------- */
  function card(v) {
    const imgs = [coverSrc(v), ...pics(v).slice(1, 4)];
    return `
      <article class="card${isSold(v) ? " sold" : ""}" data-card>
        <a class="cover" href="${href(v)}" aria-label="${esc(titleY(v))}"></a>
        <div class="media">
          <div class="slides">${imgs.map((s, i) => `<img src="${s}" alt="${esc(titleY(v))} — تصویر ${n(i + 1)}" loading="lazy" class="${i ? "" : "on"}">`).join("")}</div>
          ${imgs.length > 1 ? `<div class="nav"><button class="prev" type="button" aria-label="قبلی">${I.right}</button><button class="next" type="button" aria-label="بعدی">${I.left}</button></div>` : ""}
          <div class="shade"></div>
          ${imgs.length > 1 ? `<div class="dots">${imgs.map((_, i) => `<button type="button" aria-label="تصویر ${n(i + 1)}" class="${i ? "" : "on"}"><i></i></button>`).join("")}</div>` : ""}
        </div>
        <div class="body">
          <div class="brandline">${logoImg(v.make.en, "bm")}<span>${esc(v.make.en)}</span></div>
          <h3>${esc(titleY(v))}</h3>
          <div class="km">${esc(kmText(v))}</div>
          <div class="foot">
            <span class="price">${isSold(v) ? "فروخته شد" : `${priceFull(v)}<small>${esc(SITE.currency)}</small>`}</span>
            <span class="arrow">${I.arrow}</span>
          </div>
        </div>
      </article>`;
  }
  function wireCards(root = document) {
    $$("[data-card]", root).forEach((c) => {
      if (c.dataset.wired) return; c.dataset.wired = "1";
      const imgs = $$(".slides img", c), dots = $$(".dots button", c);
      let i = 0;
      const show = (k) => { i = (k + imgs.length) % imgs.length; imgs.forEach((im, j) => im.classList.toggle("on", j === i)); dots.forEach((d, j) => d.classList.toggle("on", j === i)); };
      const stop = (e) => { e.preventDefault(); e.stopPropagation(); };
      $(".prev", c)?.addEventListener("click", (e) => { stop(e); show(i - 1); });
      $(".next", c)?.addEventListener("click", (e) => { stop(e); show(i + 1); });
      dots.forEach((d, j) => d.addEventListener("click", (e) => { stop(e); show(j); }));
      swipe($(".media", c), (d) => show(i + d));
    });
  }

  // RTL swipe: finger moving left → next
  function swipe(el, cb) {
    if (!el) return;
    let x0 = null, y0 = null;
    el.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    el.addEventListener("touchend", (e) => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) cb(dx < 0 ? -1 : 1);
      x0 = null;
    }, { passive: true });
  }

  /* ---------- lightbox ---------- */
  let LB;
  function lightbox() {
    if (LB) return LB;
    const el = document.createElement("div");
    el.className = "lb"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true");
    el.innerHTML = `<div class="top"><span class="t"></span><span class="c ltr"></span><button class="lbtn" type="button" data-x aria-label="بستن">${I.close}</button></div>
      <div class="stage"><img alt=""></div>
      <button class="lbtn l" type="button" aria-label="قبلی">${I.left}</button>
      <button class="lbtn r" type="button" aria-label="بعدی">${I.right}</button>
      <div class="strip"></div>`;
    document.body.append(el);
    let list = [], i = 0, name = "";
    const img = $(".stage img", el);
    const draw = () => {
      img.src = list[i]; img.alt = `${name} — ${n(i + 1)}`;
      $(".t", el).textContent = name; $(".c", el).textContent = `${i + 1} / ${list.length}`;
      $$(".strip button", el).forEach((b, k) => b.classList.toggle("on", k === i));
      const on = $(".strip .on", el), st = $(".strip", el);
      if (on) st.scrollTo({ left: on.offsetLeft - (st.clientWidth - on.clientWidth) / 2, behavior: "smooth" });
    };
    const go = (d) => { i = (i + d + list.length) % list.length; draw(); };
    const close = () => { el.classList.remove("open"); document.documentElement.style.overflow = ""; };
    // gallery strip is LTR inside: left arrow = previous
    $(".l", el).onclick = () => go(-1);
    $(".r", el).onclick = () => go(1);
    $("[data-x]", el).onclick = close;
    swipe($(".stage", el), (d) => go(-d));
    document.addEventListener("keydown", (e) => {
      if (!el.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    });
    LB = {
      open(images, start, t) {
        list = images; i = start || 0; name = t || "";
        $(".strip", el).innerHTML = list.map((s, k) => `<button type="button" aria-label="${n(k + 1)}"><img src="${s}" alt="" loading="lazy"></button>`).join("");
        $$(".strip button", el).forEach((b, k) => (b.onclick = () => { i = k; draw(); }));
        el.classList.add("open"); document.documentElement.style.overflow = "hidden"; draw();
      }
    };
    return LB;
  }

  /* ---------- slider (featured) ---------- */
  // Every <li> is translated by -index*100% of its own width (f1rst model): one card per step,
  // autoplay every 3.5s, rewinds to the start after the last page. RTL: translate positive.
  function slider(root) {
    const ul = $("ul", root), prev = $(".edge.prev", root), next = $(".edge.next", root), pager = $(".pager", root.parentElement);
    const items = $$("li", ul);
    let i = 0, timer = null, hover = false;
    const perView = () => Math.max(1, Math.round(ul.clientWidth / (items[0]?.offsetWidth || 1)));
    const maxI = () => Math.max(0, items.length - perView());
    const pages = () => Math.max(1, Math.ceil(items.length / perView()));
    const draw = () => {
      items.forEach((li) => { li.style.transform = `translateX(${i * 100}%)`; });
      const pg = pages(), cur = i >= maxI() ? pg - 1 : Math.floor(i / perView());
      if (pager) {
        pager.innerHTML = pg > 1 ? Array.from({ length: pg }, (_, k) => `<button type="button" aria-label="صفحه ${n(k + 1)}" class="${k === cur ? "on" : ""}"></button>`).join("") : "";
        $$("button", pager).forEach((b, k) => b.addEventListener("click", () => go(Math.min(maxI(), k * perView()))));
      }
      root.classList.toggle("static", maxI() === 0);
    };
    const go = (k) => { i = k > maxI() ? 0 : k < 0 ? maxI() : k; draw(); restart(); };
    const restart = () => {
      clearInterval(timer);
      if (maxI() === 0 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      timer = setInterval(() => { if (!hover && !document.hidden) { i = i >= maxI() ? 0 : i + 1; draw(); } }, 3500);
    };
    next.addEventListener("click", () => go(i + 1));
    prev.addEventListener("click", () => go(i - 1));
    root.addEventListener("mouseenter", () => (hover = true));
    root.addEventListener("mouseleave", () => (hover = false));
    swipe(root, (d) => go(i + d));
    addEventListener("resize", () => { i = Math.min(i, maxI()); draw(); });
    draw(); restart();
  }

  /* ---------- pages ---------- */
  function home() {
    const avail = ALL.filter((v) => !isSold(v)), sold = ALL.filter(isSold);

    // hero — one full-bleed media (SITE.hero.video when supplied, poster image until then)
    const H = SITE.hero || {};
    const hv = ALL.find((v) => v.id === H.carId) || avail[0] || ALL[0];
    const poster = H.poster || pics(hv)[0];
    const hero = $("#hero");
    hero.innerHTML = `
      <div class="hero-media">
        ${H.video ? `<video src="${H.video}" autoplay muted loop playsinline preload="auto" aria-hidden="true"></video>`
          : `<div class="studio" style="--fy:${H.focusY || 60}%"><img src="${poster}" alt="${esc(titleY(hv))}" fetchpriority="high"></div>`}
      </div>
      <div class="hero-tint"></div>
      <div class="hero-side"></div>
      <div class="hero-fade"></div>
      <div class="hero-copy">
        <p class="make">${esc(hv.make.en)}</p>
        <h2>${esc(hv.model.fa)}${hv.trim ? " " + esc(hv.trim) : ""} ${n(hv.year)}</h2>
      </div>
      <div class="hero-cta"><a class="btn-white" href="${href(hv)}"><span>مشاهده بیشتر</span>${I.arrow}</a></div>`;
    requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add("ready")));

    // intro: letters + parallax + stats
    const bt = $(".brand-title");
    let k = 0;
    bt.innerHTML = bt.textContent.trim().split(" ").map((w) => `<span style="white-space:nowrap">${[...w].map((c) =>
      `<span class="ch${w === "JDM" ? " red" : ""}" style="transition-delay:${(k++) * 40}ms">${esc(c)}</span>`).join("")}</span>`).join('<span class="ch sp">&nbsp;</span>');
    $("#st-avail").textContent = n(avail.length);
    $("#st-sold").textContent = n(sold.length);
    // intro: one car photo sunk into a dark showroom; the stage drifts with scroll (f1rst: scale 1.1, ~±6%)
    const intro = $(".intro"), stage = $(".intro .stage"), para = $(".intro .car img");
    const IN = SITE.intro || {};
    para.src = IN.image || pics(sold[0] || ALL[0])[1];
    $(".intro .car").style.setProperty("--fy", `${IN.focusY || 70}%`);
    const onPara = () => {
      const r = intro.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const p = (innerHeight - r.top) / (innerHeight + r.height); // 0 → 1 while the band crosses the viewport
      stage.style.transform = `translate3d(0, ${(p - .5) * -12}%, 0) scale(1.1)`;
    };
    addEventListener("scroll", () => requestAnimationFrame(onPara), { passive: true });
    onPara();

    // brands marquee
    const makes = [...new Map(ALL.map((v) => [v.make.en, v.make])).values()];
    let items = makes.map((m) => `<a class="brand" href="cars.html?make=${encodeURIComponent(m.en)}"><span class="mark">${logoImg(m.en, "bl")}</span><small>${esc(m.en)}</small></a>`).join("");
    let row = items; while ((row.match(/class="brand"/g) || []).length < 12) row += items;
    $("#marquee").innerHTML = row + row;

    // featured slider: available stock only (sold cars live on cars.html?status=sold)
    $("#featured ul").innerHTML = avail.map((v) => `<li>${card(v)}</li>`).join("");
    slider($("#featured .slider"));

    // tiles — each one gets its own kind of visual (f1rst mixes showroom, product, workshop, screen shots):
    // video loop, sold mosaic, interior photo, brand emblem, workshop photo, drawn map
    const img = (v, i) => (v ? pics(v)[Math.min(i, v.images.length - 1)] : "");
    const T = SITE.tiles || {};
    // abstract night street map of the showroom block with a pulsing pin (drawn, no map tiles)
    const mapArt = `<svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="300" height="400" fill="#0f1316"/>
      <g fill="#161c20">${[[14,14,78,58],[104,14,92,58],[208,14,80,96],[14,84,78,90],[104,84,92,44],[104,140,92,34],[208,122,80,52],[14,186,120,70],[146,186,142,70],[14,268,64,118],[90,268,96,54],[90,334,96,52],[198,268,90,118]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3"/>`).join("")}</g>
      <g stroke="#2a3238" stroke-width="2" fill="none"><path d="M98 0V400M202 0V400M0 78H300M0 180H300M0 262H300M140 180V262M84 262V400M192 262V400"/></g>
      <path d="M-10 330C60 300 120 250 170 160S260 40 320 20" stroke="#3a434a" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M-10 330C60 300 120 250 170 160S260 40 320 20" stroke="#525c63" stroke-width="1.5" stroke-dasharray="6 7" fill="none"/>
      <circle cx="150" cy="130" r="26" fill="rgba(220,38,38,.18)" class="pulse"/>
      <path d="M150 150c-11-14-18-23-18-32a18 18 0 0 1 36 0c0 9-7 18-18 32z" fill="#dc2626"/>
      <circle cx="150" cy="117" r="6" fill="#fff"/>
    </svg>`;
    const art = {
      video: (src) => `<div class="img"><video src="${src}" muted loop playsinline autoplay preload="metadata" aria-hidden="true"></video></div>`,
      photo: (src) => `<div class="img" style="background-image:url('${src}')"></div>`,
      mosaic: () => `<div class="img mosaic">${sold.slice(0, 9).map((v) => `<span style="background-image:url('${coverSrc(v)}')"></span>`).join("")}</div>`,
      emblem: (make) => `<div class="img emblem"><img src="${SITE.logos[make]?.src || ""}" alt="" loading="lazy"></div>`,
      map: () => `<div class="img map">${mapArt}</div>`
    };
    const tiles = [
      ["cars.html?status=available", "خودروهای<br>موجود", art.video(T.availableVideo || SITE.hero?.video || "")],
      ["cars.html?status=sold", "آرشیو<br>فروش", art.mosaic()],
      ["gallery.html", "گالری<br>تصاویر", art.photo(T.gallery || img(sold[1] || ALL[1], 3))],
      ["cars.html?make=Honda", "کلاسیک‌های<br>هوندا", art.emblem("Honda")],
      ["about.html", "درباره<br>نمایشگاه", art.photo(T.about || img(sold[3] || ALL[2], 2))],
      ["contact.html", "تماس و<br>بازدید", art.map()]
    ];
    $("#tiles").innerHTML = tiles.map(([h, t, visual], i) => `
      <a class="tile" href="${h}" data-reveal="tile" style="transition-delay:${i * 70}ms">
        ${visual}<div class="grad"></div><div class="shine"></div>
        <div class="t"><h3>${t}</h3><span class="bar"></span></div>
        <div class="go"><span>مشاهده</span><i>${I.left}</i></div>
      </a>`).join("");

    // banner
    const bv = avail[0] || ALL[0];
    $("#banner").href = href(bv);
    $("#banner img").src = pics(bv)[0];
    $("#banner img").alt = titleY(bv);

    // contact card
    $("#reach-img").src = img(avail[0] || ALL[0], 3);
    wireCards();
  }

  function cars() {
    const P = new URLSearchParams(location.search);
    const st = { status: P.get("status") === "sold" ? "sold" : "available", make: P.get("make") || "", year: P.get("year") || "", price: P.get("price") || "", body: P.get("body") || "", sort: P.get("sort") || "new" };
    // a brand link from the home page shows that brand across both lists
    const brandOnly = !P.get("status") && st.make;

    // page hero uses a dedicated page photo (assets/images/pages), not stock photos
    $("#ph-img").src = "assets/images/pages/cars.jpg";

    const makes = [...new Map(ALL.map((v) => [v.make.en, v.make])).values()];
    const bodies = [...new Set(ALL.map((v) => v.body).filter(Boolean))];
    const YEARS = [["", "همه سال‌ها"], ["old", "قبل از ۱۹۹۵"], ["mid", "۱۹۹۵ تا ۲۰۰۵"], ["new", "بعد از ۲۰۰۵"]];
    const PRICES = [["", "همه قیمت‌ها"], ["lt7", "تا ۷۰۰ میلیون"], ["7to10", "۷۰۰ میلیون تا ۱ میلیارد"], ["gt10", "بالای ۱ میلیارد"]];
    const inYear = (v, k) => { const y = gYear(v); return !k || (k === "old" ? y < 1995 : k === "mid" ? y >= 1995 && y <= 2005 : y > 2005); };
    const inPrice = (v, k) => { const p = v.price || 0; return !k || (k === "lt7" ? p <= 7e8 : k === "7to10" ? p > 7e8 && p <= 1e9 : p > 1e9); };

    const ff = (key, label, popHtml) => `<div class="ff" data-ff="${key}"><label>${label}</label><button type="button"><span class="v"></span>${I.down}</button><div class="pop">${popHtml}<button type="button" class="apply">اعمال</button></div></div>`;
    const radios = (key, list) => list.map(([val, t]) => `<label class="opt"><input type="radio" name="${key}" value="${val}"> ${t}</label>`).join("");
    $("#filters").innerHTML =
      ff("make", "برند", `<div class="chips">${['<button type="button" data-v="">همه</button>', ...makes.map((m) => `<button type="button" data-v="${esc(m.en)}">${logoImg(m.en, "cl")}${esc(m.fa)}</button>`)].join("")}</div>`) +
      ff("year", "سال ساخت", radios("year", YEARS)) +
      ff("price", "قیمت", radios("price", PRICES)) +
      ff("body", "نوع بدنه", radios("body", [["", "همه"], ...bodies.map((b) => [b, b])])) +
      ff("sortf", "مرتب‌سازی", radios("sort", [["new", "جدیدترین"], ["year", "سال ساخت"], ["pasc", "ارزان‌ترین"], ["pdesc", "گران‌ترین"]]));

    const labels = {
      make: () => (makes.find((m) => m.en === st.make) || { fa: "همه برندها" }).fa,
      year: () => YEARS.find((y) => y[0] === st.year)[1],
      price: () => PRICES.find((p) => p[0] === st.price)[1],
      body: () => st.body || "همه بدنه‌ها",
      sortf: () => ({ new: "جدیدترین", year: "سال ساخت", pasc: "ارزان‌ترین", pdesc: "گران‌ترین" })[st.sort]
    };
    const stateKey = (k) => (k === "sortf" ? "sort" : k);

    $$(".ff").forEach((el) => {
      const key = el.dataset.ff, sk = stateKey(key);
      let pending = st[sk];
      $(":scope > button", el).addEventListener("click", (e) => {
        e.stopPropagation();
        const was = el.classList.contains("open");
        $$(".ff.open").forEach((o) => o.classList.remove("open"));
        if (!was) {
          el.classList.add("open"); pending = st[sk];
          $$(".chips button", el).forEach((b) => b.classList.toggle("on", b.dataset.v === pending));
          $$("input", el).forEach((r) => (r.checked = r.value === pending));
        }
      });
      $(".pop", el).addEventListener("click", (e) => e.stopPropagation());
      $$(".chips button", el).forEach((b) => b.addEventListener("click", () => { pending = b.dataset.v; $$(".chips button", el).forEach((x) => x.classList.toggle("on", x === b)); }));
      $$("input", el).forEach((r) => r.addEventListener("change", () => (pending = r.value)));
      $(".apply", el).addEventListener("click", () => { st[sk] = pending; el.classList.remove("open"); draw(); });
    });
    document.addEventListener("click", () => $$(".ff.open").forEach((o) => o.classList.remove("open")));
    $("#reset").addEventListener("click", () => { Object.assign(st, { make: "", year: "", price: "", body: "", sort: "new" }); draw(); });

    const seg = $("#seg");
    $$("button", seg).forEach((b) => b.addEventListener("click", () => { st.status = b.dataset.s; draw(); }));

    const TXT = {
      available: ["خودروهای", "موجود", "آماده بازدید در شهرک آپادانا"],
      sold: ["آرشیو", "فروش", "خودروهایی که از نمایشگاه فروخته شده‌اند"]
    };
    function draw() {
      const list = ALL.filter((v) => (brandOnly || v.status === st.status) && (!st.make || v.make.en === st.make) && inYear(v, st.year) && inPrice(v, st.price) && (!st.body || v.body === st.body));
      if (st.sort === "year") list.sort((a, b) => gYear(b) - gYear(a));
      if (st.sort === "pasc") list.sort((a, b) => (a.price || 0) - (b.price || 0));
      if (st.sort === "pdesc") list.sort((a, b) => (b.price || 0) - (a.price || 0));

      const t = brandOnly ? [ (makes.find((m) => m.en === st.make) || {}).fa || "", "در نمایشگاه", "موجود و فروخته‌شده" ] : TXT[st.status];
      $("#ph-h1").innerHTML = `<span>${t[0]}</span><span>${t[1]}</span>`;
      $("#crumb").textContent = `${t[0]} ${t[1]}`;
      document.title = `${t[0]} ${t[1]} | ${SITE.brandFa}`;
      $("#ph-count").textContent = `${n(list.length)} خودرو · ${t[2]}`;
      $("#results").textContent = `${n(list.length)} نتیجه`;
      $$("button", seg).forEach((b, i) => { const on = !brandOnly && b.dataset.s === st.status; b.classList.toggle("on", on); if (on) $(".thumb", seg).style.transform = `translateX(${-i * 100}%)`; });
      $(".thumb", seg).style.opacity = brandOnly ? "0" : "1";
      $$(".ff").forEach((el) => { const sk = stateKey(el.dataset.ff); $(".v", el).textContent = labels[el.dataset.ff](); el.classList.toggle("set", sk === "sort" ? st.sort !== "new" : !!st[sk]); });

      $("#grid").innerHTML = list.length ? list.map(card).join("") : '<div class="empty" style="grid-column:1/-1">خودرویی با این فیلترها پیدا نشد.</div>';
      wireCards($("#grid"));
      const q = new URLSearchParams();
      if (!brandOnly) q.set("status", st.status);
      ["make", "year", "price", "body"].forEach((k) => st[k] && q.set(k, st[k]));
      if (st.sort !== "new") q.set("sort", st.sort);
      history.replaceState(null, "", location.pathname + "?" + q);
    }
    draw();
  }

  function detail() {
    const v = ALL.find((x) => x.id === new URLSearchParams(location.search).get("id"));
    const main = $("#car");
    if (!v) { main.innerHTML = `<div class="dhead"><h1>خودرو پیدا نشد</h1><p style="margin-top:24px"><a class="btn-white" href="cars.html">بازگشت به خودروها</a></p></div>`; return; }
    const name = titleY(v);
    const imgs = pics(v);
    document.title = v.seo?.title || `${name} | ${SITE.brandFa}`;
    $('meta[name="description"]').content = v.seo?.description || v.description;
    $('meta[property="og:title"]').content = document.title;
    $('meta[property="og:image"]').content = imgs[0];
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "Car", name: `${v.make.en} ${v.model.en} ${v.year}`, brand: { "@type": "Brand", name: v.make.en }, model: v.model.en, vehicleModelDate: String(gYear(v)), color: v.color, image: v.images, description: v.description, mileageFromOdometer: v.mileageKm != null ? { "@type": "QuantitativeValue", value: v.mileageKm, unitCode: "KMT" } : undefined, offers: { "@type": "Offer", priceCurrency: "IRR", price: v.price ? v.price * 10 : undefined, availability: isSold(v) ? "https://schema.org/SoldOut" : "https://schema.org/InStock" } });
    document.head.append(ld);

    const c = v.condition || {};
    const cond = [["بدنه", c.body], ["شاسی", c.chassis], ["کابین", c.cabin], ["برق و تجهیزات", c.electrics], ["موتور و گیربکس", c.engine], ["زیربندی", c.suspension]].filter((r) => r[1]);
    const det = [["برند", `${v.make.fa} · ${v.make.en}`], ["مدل", `${v.model.fa}${v.trim ? " " + v.trim : ""}`], ["رنگ", v.color], ["گیربکس", v.transmission], ["سوخت", v.fuel], ["بدنه", v.body], ["محل بازدید", SITE.address, 1], ["کد خودرو", v.id.toUpperCase(), 1]].filter((r) => r[1]);
    const others = ALL.filter((x) => x.id !== v.id && !isSold(x)).concat(ALL.filter((x) => x.id !== v.id && isSold(x))).slice(0, 4);
    const status = isSold(v) ? "sold" : "available";

    main.innerHTML = `
      <div class="dhead">
        <nav class="crumbs" aria-label="مسیر"><a href="index.html">خانه</a><span class="sep"></span><a href="cars.html?status=${status}">${isSold(v) ? "آرشیو فروش" : "خودروهای موجود"}</a><span class="sep"></span><span class="cur">${esc(v.make.fa)} ${esc(v.model.fa)}</span></nav>
        <span class="redline"></span>
        <h1>${esc(name)}</h1>
      </div>
      <div class="dgrid">
        <div>
          <div class="utab"><span class="on">تصاویر</span></div>
          <div class="gal" id="gal">
            <div class="frame"><div class="vp">
              <div class="strip">${imgs.map((s, i) => `<figure><img src="${s}" alt="${esc(name)} — تصویر ${n(i + 1)}" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}></figure>`).join("")}</div>
              <button class="arrow l" type="button" aria-label="قبلی">${I.left}</button>
              <button class="arrow r" type="button" aria-label="بعدی">${I.right}</button>
            </div></div>
            ${isSold(v) ? '<span class="sold-tag">فروخته شد</span>' : ""}
            <div class="tools"><button type="button" data-lb>گالری</button><button type="button" data-lb aria-label="تمام صفحه">${I.expand}</button></div>
            <div class="thumbs">${imgs.map((s, i) => `<button type="button" class="${i ? "" : "on"}" aria-label="تصویر ${n(i + 1)}"><img src="${s}" alt="" loading="lazy"></button>`).join("")}</div>
          </div>
          <div class="dsec">
            <div class="utab" id="dtabs"><button type="button" class="on" data-t="desc">توضیحات</button><button type="button" data-t="cond">وضعیت فنی</button></div>
            <div class="panel desc">
              <div data-p="desc">
                <h2>${esc(title(v))}</h2>
                <p>${esc(v.description)}</p>
                ${v.features?.length ? `<div class="feat">${v.features.map((f) => `<span>${esc(f)}</span>`).join("")}</div>` : ""}
              </div>
              <div data-p="cond" hidden>
                <h2>وضعیت فنی و ظاهری</h2>
                <dl class="cond">${cond.map(([k, val]) => `<div><dt>${k}</dt><dd>${esc(val)}</dd></div>`).join("")}</dl>
              </div>
            </div>
          </div>
        </div>
        <aside class="side">
          <div class="utab"><span class="on">بازدید</span></div>
          <div class="visitbox">
            <div class="hd"><h3>هماهنگی بازدید</h3>${I.pin}</div>
            <a class="bd" href="${tel}" aria-label="تماس برای بازدید"><img src="${imgs[1] || imgs[0]}" alt="" loading="lazy"><i>${I.phone}</i></a>
          </div>
          <div class="panel spec">
            <div class="row"><span class="lbl">${isSold(v) ? "وضعیت" : "قیمت"}</span><span class="val${isSold(v) ? " sold" : ""}">${isSold(v) ? "فروخته شد" : `${priceFull(v)}<small>${esc(SITE.currency)}</small>`}</span></div>
            <div class="box">
              <div class="q4">
                <div><b>${n(v.year)}</b><span>سال${v.calendar === "gregorian" ? " میلادی" : ""}</span></div>
                <div><b>${v.mileageKm != null ? n(Math.round(v.mileageKm / 1000)) + "K" : "—"}</b><span>کیلومتر</span></div>
                <div><b>${v.insuranceMonths != null ? n(v.insuranceMonths) + " ماه" : "—"}</b><span>بیمه</span></div>
                <div><b>${v.inspectionMonths != null ? n(v.inspectionMonths) + " ماه" : "—"}</b><span>معاینه</span></div>
              </div>
              <div class="sub">
                <div class="sublbl">وضعیت</div>
                <div class="q4">
                  <div><b>${v.tiresPercent != null ? "٪" + n(v.tiresPercent) : "—"}</b><span>لاستیک</span></div>
                  <div><b>${esc(v.transmission || "—")}</b><span>گیربکس</span></div>
                  <div><b>${esc(v.body || "—")}</b><span>بدنه</span></div>
                  <div><b>${esc(v.color || "—")}</b><span>رنگ</span></div>
                </div>
              </div>
              <div class="sub">
                <div class="sublbl">جزئیات</div>
                <div class="d2" id="d2">${det.map(([k, val, full]) => `<div class="${full ? "full" : ""}"><b>${esc(val)}</b><span>${k}</span></div>`).join("")}</div>
                <button class="more" type="button" id="more">نمایش بیشتر</button>
              </div>
              <div class="sub">
                <div class="a3">
                  <button type="button" data-share>${I.share}<span>اشتراک</span></button>
                  <a href="${sms}">${I.chat}<span>پیامک</span></a>
                  <button type="button" data-copy>${I.link}<span>کپی لینک</span></button>
                </div>
              </div>
            </div>
            <div class="b2"><button type="button" class="w" data-lb>گالری</button><a class="r" href="${tel}">تماس</a></div>
          </div>
        </aside>
      </div>
      ${others.length ? `<section class="similar"><h2 class="h-mono">خودروهای دیگر</h2><div class="grid4">${others.map(card).join("")}</div></section>` : ""}`;

    // gallery slider (LTR strip inside RTL page)
    const g = $("#gal"), strip = $(".strip", g), thumbs = $$(".thumbs button", g);
    let i = 0;
    const show = (k) => {
      i = (k + v.images.length) % v.images.length;
      strip.style.transform = `translateX(${-i * 100}%)`;
      thumbs.forEach((t, j) => t.classList.toggle("on", j === i));
      const t = thumbs[i], row = t.parentElement;
      row.scrollTo({ left: t.offsetLeft - (row.clientWidth - t.clientWidth) / 2, behavior: "smooth" });
    };
    $(".arrow.l", g).onclick = () => show(i - 1);
    $(".arrow.r", g).onclick = () => show(i + 1);
    thumbs.forEach((t, j) => (t.onclick = () => show(j)));
    swipe($(".vp", g), (d) => show(i - d));
    const lb = lightbox();
    $$("[data-lb]").forEach((b) => (b.onclick = () => lb.open(imgs, i, name)));
    $$(".strip img", g).forEach((im) => (im.onclick = () => lb.open(imgs, i, name)));

    // description / condition tabs
    $$("#dtabs button").forEach((b) => b.addEventListener("click", () => {
      $$("#dtabs button").forEach((x) => x.classList.toggle("on", x === b));
      $$("[data-p]").forEach((p) => (p.hidden = p.dataset.p !== b.dataset.t));
    }));
    $("#more").addEventListener("click", (e) => { const open = $("#d2").classList.toggle("open"); e.currentTarget.textContent = open ? "نمایش کمتر" : "نمایش بیشتر"; });
    const copy = async (btn) => { try { await navigator.clipboard.writeText(location.href); $("span", btn).textContent = "کپی شد"; } catch (e) { /* clipboard blocked */ } };
    $("[data-copy]").onclick = (e) => copy(e.currentTarget);
    $("[data-share]").onclick = async (e) => { try { if (navigator.share) await navigator.share({ title: document.title, url: location.href }); else copy(e.currentTarget); } catch (err) { /* cancelled */ } };
    wireCards();
  }

  function gallery() {
    const P = new URLSearchParams(location.search);
    let tab = P.get("tab") || "all", q = "";
    $("#ph-img").src = "assets/images/pages/gallery.jpg";
    const lb = lightbox(), grid = $("#ggrid");
    const draw = () => {
      $$("#gseg button").forEach((b, i) => { const on = b.dataset.s === tab; b.classList.toggle("on", on); if (on) $("#gseg .thumb").style.transform = `translateX(${-i * 100}%)`; });
      const list = ALL.filter((v) => (tab === "all" || v.status === tab) && (!q || [v.make.fa, v.make.en, v.model.fa, v.model.en, v.year, n(v.year), v.color].join(" ").toLowerCase().includes(q)));
      const items = list.flatMap((v) => v.images.map((s, k) => ({ v, s, k })));
      $("#gcount").textContent = `${n(items.length)} تصویر`;
      grid.innerHTML = items.length ? items.map(({ v, s, k }) => `<figure class="gitem" data-id="${v.id}" data-k="${k}" style="margin:0"><img src="${s}" alt="${esc(titleY(v))} — ${n(k + 1)}" loading="lazy"><figcaption class="cap">${esc(titleY(v))}<small>${isSold(v) ? "فروخته شد" : "موجود"}</small></figcaption></figure>`).join("")
        : '<div class="empty" style="grid-column:1/-1">تصویری پیدا نشد.</div>';
      $$(".gitem", grid).forEach((f) => f.addEventListener("click", () => { const v = ALL.find((x) => x.id === f.dataset.id); lb.open(v.images, +f.dataset.k, titleY(v)); }));
    };
    $$("#gseg button").forEach((b) => b.addEventListener("click", () => { tab = b.dataset.s; draw(); }));
    $("#gq").addEventListener("input", (e) => { q = e.target.value.trim().toLowerCase(); draw(); });
    draw();
  }

  function about() {
    const avail = ALL.filter((v) => !isSold(v)).length, sold = ALL.filter(isSold).length;
    const makes = new Set(ALL.map((v) => v.make.en)).size;
    const oldest = Math.min(...ALL.map(gYear));
    $("#about-stats").innerHTML = [[n(avail), "خودروی موجود"], [n(sold), "خودروی فروخته‌شده"], [n(makes), "برند در آرشیو"], [n(oldest), "قدیمی‌ترین مدل"]]
      .map(([b, s]) => `<div class="sc"><b>${b}</b><span>${s}</span></div>`).join("");
  }

  function contact() {
    const q = encodeURIComponent(SITE.mapQuery || SITE.address);
    const link = SITE.mapLink || `https://maps.google.com/?q=${q}`;
    $("#map-lg").src = `https://maps.google.com/maps?q=${q}&z=16&output=embed`;
    $("#map-open").href = link;
    $("#dir-link").href = link;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const page = document.body.dataset.page;
    if (page === "home") document.body.classList.add("page-home");
    shell();
    transitions();
    ({ home, cars, car: detail, gallery, about, contact }[page] || (() => {}))();
    reveal();
  });
})();
