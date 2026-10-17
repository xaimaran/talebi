/*
 * xpin viewer: drag-to-spin with zoom for a spin.json built by the xpin backend.
 *
 *   <div data-xpin="/spins/ABC123/spin.json"></div>
 *   <script src="/spins/ABC123/xpin-viewer.js" defer></script>
 *
 * Or programmatically: Xpin.mount(element, "/spins/ABC123/spin.json").
 *
 * Offline (opened from disk as file://, where browsers block fetch): embed the manifest in
 * the page and point at it; frame paths resolve relative to the page or data-xpin-base.
 *
 *   <script type="application/json" id="spin-data">{ ...spin.json... }</script>
 *   <div data-xpin-inline="spin-data"></div>
 *
 * Controls: drag to rotate. Zoom with the mouse wheel, the +/- buttons,
 * double-click / double-tap, or pinch. While zoomed, drag pans and the
 * arrow keys rotate. High-resolution frames load on demand while zoomed.
 */
(function () {
  "use strict";

  var MAX_ZOOM = 4;
  var DOUBLE_TAP_ZOOM = 2.5;

  var STYLE =
    ".xpin{position:relative;overflow:hidden;background:#111;cursor:grab;touch-action:pan-y;user-select:none;-webkit-user-select:none;outline:none}" +
    ".xpin.xpin-drag{cursor:grabbing}" +
    ".xpin.xpin-zoomed{touch-action:none;cursor:move}" +
    ".xpin img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none;transform-origin:50% 50%;will-change:transform}" +
    ".xpin-bar{position:absolute;left:0;bottom:0;height:3px;width:0;background:#fff;opacity:.8;transition:width .15s,opacity .4s}" +
    ".xpin-hint{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);padding:6px 12px;border-radius:999px;" +
    "background:rgba(0,0,0,.55);color:#fff;font:500 13px/1.2 system-ui,sans-serif;pointer-events:none;transition:opacity .4s;white-space:nowrap}" +
    ".xpin-tools{position:absolute;right:10px;bottom:10px;display:flex;gap:6px}" +
    ".xpin-tools button{width:36px;height:36px;border:0;border-radius:8px;background:rgba(0,0,0,.6);color:#fff;" +
    "font:600 18px/1 system-ui,sans-serif;cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center}" +
    ".xpin-tools button:hover{background:rgba(0,0,0,.8)}" +
    ".xpin-tools button:disabled{opacity:.35;cursor:default}" +
    ".xpin-tools button:focus-visible,.xpin:focus-visible{box-shadow:0 0 0 3px #4c9ffe}";

  function injectStyle() {
    if (document.getElementById("xpin-style")) return;
    var s = document.createElement("style");
    s.id = "xpin-style";
    s.textContent = STYLE;
    document.head.appendChild(s);
  }

  function mount(el, src) {
    injectStyle();
    var base = src.slice(0, src.lastIndexOf("/") + 1);
    return fetch(src)
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status + " for " + src);
        return r.json();
      })
      .then(function (spin) {
        init(el, spin, base);
      })
      .catch(function (e) {
        el.textContent = "360 view failed to load.";
        console.error("xpin:", e);
      });
  }

  function pickWidth(el, widths) {
    var need = el.clientWidth * (window.devicePixelRatio || 1);
    var sorted = widths.slice().sort(function (a, b) { return a - b; });
    for (var i = 0; i < sorted.length; i++) if (sorted[i] >= need) return sorted[i];
    return sorted[sorted.length - 1];
  }

  function button(label, title) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.title = title;
    b.setAttribute("aria-label", title);
    return b;
  }

  function init(el, spin, base) {
    var n = spin.frames;
    el.classList.add("xpin");
    el.style.aspectRatio = spin.width + " / " + spin.height;
    el.tabIndex = 0;
    el.setAttribute("role", "img");
    el.setAttribute("aria-label", (spin.title || "Vehicle") + ", 360 degree view. Drag or use arrow keys to rotate, plus and minus to zoom.");

    var w = pickWidth(el, spin.widths);
    function url(width, i) {
      return base + spin.pattern.replace("{w}", width).replace("{i}", String(i).padStart(spin.pad, "0"));
    }

    var img = document.createElement("img");
    img.alt = "";
    img.draggable = false;
    img.src = url(w, 0);
    var bar = document.createElement("div");
    bar.className = "xpin-bar";
    var hint = document.createElement("div");
    hint.className = "xpin-hint";
    hint.textContent = "Drag to rotate";
    var tools = document.createElement("div");
    tools.className = "xpin-tools";
    var zoomOutBtn = button("−", "Zoom out");
    var zoomInBtn = button("+", "Zoom in");
    var resetBtn = button("↺", "Reset zoom");
    tools.append(zoomOutBtn, zoomInBtn, resetBtn);
    el.replaceChildren(img, bar, hint, tools);

    var frames = new Array(n);
    var zoomFrames = new Array(n);
    var loaded = 0;
    var ready = false;
    for (var i = 0; i < n; i++) {
      frames[i] = new Image();
      frames[i].onload = frames[i].onerror = onLoad;
      frames[i].src = url(w, i);
    }
    function onLoad() {
      loaded++;
      bar.style.width = (loaded / n) * 100 + "%";
      if (loaded === n) {
        ready = true;
        bar.style.opacity = "0";
      }
    }

    // ---- frame display ----
    // pos is fractional (drag, inertia); the nearest whole frame is shown, no blending.
    var pos = 0;
    var shown = -1;
    function show(p) {
      pos = p;
      var idx = ((Math.round(p) % n) + n) % n;
      if (idx !== shown) {
        shown = idx;
        setFrame(img, idx);
      }
    }

    function paint() {
      setFrame(img, shown);
    }

    /** Shows the display frame at once, then swaps in the high-res frame while zoomed. */
    function setFrame(layer, idx) {
      layer.dataset.idx = idx;
      if (zoom > 1 && spin.zoomWidth) {
        var z = zoomFrames[idx];
        if (!z) {
          z = zoomFrames[idx] = new Image();
          z.src = url(spin.zoomWidth, idx);
        }
        if (z.complete && z.naturalWidth) {
          layer.src = z.src;
          return;
        }
        z.addEventListener("load", function () {
          if (layer.dataset.idx === String(idx) && zoom > 1) layer.src = z.src;
        }, { once: true });
      }
      layer.src = frames[idx].src;
    }

    function settle() {
      show(Math.round(pos));
    }

    // ---- zoom and pan ----
    var zoom = 1;
    var panX = 0;
    var panY = 0;

    function clampPan() {
      var maxX = ((zoom - 1) * el.clientWidth) / 2;
      var maxY = ((zoom - 1) * el.clientHeight) / 2;
      panX = Math.max(-maxX, Math.min(maxX, panX));
      panY = Math.max(-maxY, Math.min(maxY, panY));
    }

    function applyTransform() {
      img.style.transform = zoom === 1 ? "" : "translate(" + panX + "px," + panY + "px) scale(" + zoom + ")";
      el.classList.toggle("xpin-zoomed", zoom > 1);
      zoomOutBtn.disabled = zoom <= 1;
      zoomInBtn.disabled = zoom >= MAX_ZOOM;
      resetBtn.disabled = zoom <= 1;
    }

    /** Zooms to z keeping the point (cx, cy), in element pixels, fixed on screen. */
    function zoomTo(z, cx, cy) {
      z = Math.max(1, Math.min(MAX_ZOOM, z));
      if (cx === undefined) {
        cx = el.clientWidth / 2;
        cy = el.clientHeight / 2;
      }
      var dx = cx - el.clientWidth / 2;
      var dy = cy - el.clientHeight / 2;
      var wasZoomed = zoom > 1;
      panX = dx - ((dx - panX) * z) / zoom;
      panY = dy - ((dy - panY) * z) / zoom;
      zoom = z;
      if (zoom === 1) panX = panY = 0;
      clampPan();
      applyTransform();
      if (wasZoomed !== zoom > 1) paint();
      hint.style.opacity = "0";
    }

    function local(e) {
      var r = el.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    zoomInBtn.addEventListener("click", function () { stop(); zoomTo(zoom * 1.5); });
    zoomOutBtn.addEventListener("click", function () { zoomTo(zoom / 1.5); });
    resetBtn.addEventListener("click", function () { zoomTo(1); });
    tools.addEventListener("pointerdown", function (e) { e.stopPropagation(); });

    el.addEventListener("wheel", function (e) {
      // The wheel zooms while the pointer is over the viewer (the page does not scroll there).
      e.preventDefault();
      stop();
      var p = local(e);
      zoomTo(zoom * Math.exp(-e.deltaY * 0.01), p.x, p.y);
    }, { passive: false });

    el.addEventListener("dblclick", function (e) {
      var p = local(e);
      stop();
      zoomTo(zoom > 1 ? 1 : DOUBLE_TAP_ZOOM, p.x, p.y);
    });

    // ---- rotation animation ----
    var anim = 0;
    function stop() {
      cancelAnimationFrame(anim);
      anim = 0;
    }

    var reduceMotion = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

    // One drag across the full width = one full turn.
    function framesPerPx() {
      return n / Math.max(el.clientWidth, 1);
    }

    // ---- pointers: 1 = rotate (or pan when zoomed), 2 = pinch ----
    var pointers = {};
    var lastX = 0;
    var lastY = 0;
    var lastT = 0;
    var vel = 0;
    var pinchDist = 0;
    var lastTap = 0;

    function pointerList() {
      return Object.keys(pointers).map(function (k) { return pointers[k]; });
    }

    el.addEventListener("pointerdown", function (e) {
      if (!ready) return;
      stop();
      el.setPointerCapture(e.pointerId);
      pointers[e.pointerId] = local(e);
      var list = pointerList();
      if (list.length === 2) {
        pinchDist = Math.hypot(list[0].x - list[1].x, list[0].y - list[1].y);
        return;
      }
      // Double tap on touch screens (dblclick does not fire reliably there).
      if (e.pointerType === "touch") {
        if (e.timeStamp - lastTap < 300) {
          var p = local(e);
          zoomTo(zoom > 1 ? 1 : DOUBLE_TAP_ZOOM, p.x, p.y);
          lastTap = 0;
        } else {
          lastTap = e.timeStamp;
        }
      }
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = e.timeStamp;
      vel = 0;
      hint.style.opacity = "0";
      el.classList.add("xpin-drag");
    });

    el.addEventListener("pointermove", function (e) {
      if (!pointers[e.pointerId]) return;
      pointers[e.pointerId] = local(e);
      var list = pointerList();
      if (list.length >= 2) {
        var d = Math.hypot(list[0].x - list[1].x, list[0].y - list[1].y);
        if (pinchDist > 0) zoomTo((zoom * d) / pinchDist, (list[0].x + list[1].x) / 2, (list[0].y + list[1].y) / 2);
        pinchDist = d;
        return;
      }
      var dx = e.clientX - lastX;
      var dy = e.clientY - lastY;
      var dt = Math.max(e.timeStamp - lastT, 1);
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = e.timeStamp;
      if (zoom > 1) {
        panX += dx;
        panY += dy;
        clampPan();
        applyTransform();
        return;
      }
      var df = -dx * framesPerPx();
      vel = 0.8 * (df / dt) + 0.2 * vel;
      show(pos + df);
    });

    function release(e) {
      if (!pointers[e.pointerId]) return;
      delete pointers[e.pointerId];
      var list = pointerList();
      if (list.length === 1) {
        // Pinch ended with one finger still down: continue as a drag from here.
        pinchDist = 0;
        var r = el.getBoundingClientRect();
        lastX = list[0].x + r.left;
        lastY = list[0].y + r.top;
        vel = 0;
        return;
      }
      if (list.length) return;
      el.classList.remove("xpin-drag");
      if (zoom > 1 || reduceMotion || Math.abs(vel) < 0.005) {
        settle();
        return;
      }
      var prev = performance.now();
      function coast(t) {
        var dt = t - prev;
        prev = t;
        vel *= Math.pow(0.994, dt);
        show(pos + vel * dt);
        if (Math.abs(vel) > 0.002) anim = requestAnimationFrame(coast);
        else settle();
      }
      anim = requestAnimationFrame(coast);
    }
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);

    el.addEventListener("keydown", function (e) {
      if (!ready) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        stop();
        hint.style.opacity = "0";
        show(Math.round(pos) + (e.key === "ArrowRight" ? 1 : -1));
      } else if (e.key === "+" || e.key === "=") {
        zoomTo(zoom * 1.5);
      } else if (e.key === "-") {
        zoomTo(zoom / 1.5);
      } else if (e.key === "0" || e.key === "Escape") {
        zoomTo(1);
      }
    });

    window.addEventListener("resize", function () {
      clampPan();
      applyTransform();
    });

    show(0);
    applyTransform();
  }

  /** Mounts from a manifest embedded in the page (no network request; works from file://). */
  function mountInline(el, id) {
    injectStyle();
    try {
      var spin = JSON.parse(document.getElementById(id).textContent);
      init(el, spin, el.getAttribute("data-xpin-base") || "");
    } catch (e) {
      el.textContent = "360 view failed to load.";
      console.error("xpin:", e);
    }
  }

  function auto() {
    var els = document.querySelectorAll("[data-xpin]");
    for (var i = 0; i < els.length; i++) mount(els[i], els[i].getAttribute("data-xpin"));
    var inline = document.querySelectorAll("[data-xpin-inline]");
    for (var j = 0; j < inline.length; j++) mountInline(inline[j], inline[j].getAttribute("data-xpin-inline"));
  }

  window.Xpin = { mount: mount };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", auto);
  else auto();
})();
