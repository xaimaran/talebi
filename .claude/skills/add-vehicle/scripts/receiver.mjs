// Image pipeline for the add-vehicle skill.
// Run:  node .claude/skills/add-vehicle/scripts/receiver.mjs      (http://127.0.0.1:8765)
//
// 1. STAGE   Instagram tab navigates to  /#<encoded {key, urls}>  -> originals saved to <tmp>/talebi-staging/<key>/NN.jpg
//            (Chrome blocks extension downloads and javascript_tool will not return signed CDN URLs,
//             so the URL list travels in the fragment, which never leaves the browser.)
//    or      POST /stage-local {key, from}  -> copies NN.jpg files from a local folder (re-processing existing cars)
// 2. REVIEW  /sheet?key=K        contact sheet with indices; decide which frames to drop
//            (ad covers with the big name/price banner, duplicates, screenshots)
// 3. PROCESS /process?key=K&dir=<make>/<model>/<YYYYMMDD-HHmm>&drop=0,5
//            browser auto-crops uniform white padding on every edge, re-encodes JPEG q=0.9 and the server
//            writes assets/images/vehicles/<dir>/00.jpg, 01.jpg … (refuses a non-empty target).
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../assets/images/vehicles');
const STAGE = path.join(os.tmpdir(), 'talebi-staging');
const PORT = 8765;
const KEY_RE = /^[\w-]+$/;
const DIR_RE = /^[a-z0-9-]+\/[a-z0-9-]+\/\d{8}-\d{4}$/;
fs.mkdirSync(STAGE, { recursive: true });

const html = (res, body) => { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(`<!doctype html><meta charset=utf-8><body style="font:13px system-ui;background:#111;color:#eee;margin:16px">${body}`); };
const text = (res, code, t) => { res.writeHead(code, { 'content-type': 'text/plain; charset=utf-8' }); res.end(t); };
const readBody = async (req) => { const parts = []; for await (const c of req) parts.push(c); return Buffer.concat(parts); };
const staged = (key) => fs.existsSync(path.join(STAGE, key)) ? fs.readdirSync(path.join(STAGE, key)).filter(f => f.endsWith('.jpg')).sort() : [];

const stagePage = `<pre id=o>staging…</pre><script>
const h = location.hash.slice(1);
const d = h ? JSON.parse(decodeURIComponent(h)) : null;
if (!d) o.textContent = 'no payload';
else fetch('/stage', {method:'POST', body: JSON.stringify(d)}).then(r => r.text()).then(t => { o.textContent = t; history.replaceState(null, '', '/'); });
</script>`;

const processPage = (key, dir, files) => `<pre id=o>processing…</pre><script>
const key = ${JSON.stringify(key)}, dir = ${JSON.stringify(dir)}, files = ${JSON.stringify(files)};
// a row/column is padding when >= 98% of its pixels are near-white
const WHITE = 232, FRAC = 0.98;
function bounds(ctx, w, h) {
  const d = ctx.getImageData(0, 0, w, h).data;
  const white = (x, y) => { const i = (y * w + x) * 4; return d[i] > WHITE && d[i+1] > WHITE && d[i+2] > WHITE; };
  const rowWhite = (y) => { let n = 0; for (let x = 0; x < w; x += 2) n += white(x, y); return n >= FRAC * Math.ceil(w / 2); };
  const colWhite = (x, t, b) => { let n = 0, c = 0; for (let y = t; y < b; y += 2) { n += white(x, y); c++; } return n >= FRAC * c; };
  let t = 0, b = h, l = 0, r = w;
  while (t < b - 1 && rowWhite(t)) t++;
  while (b - 1 > t && rowWhite(b - 1)) b--;
  while (l < r - 1 && colWhite(l, t, b)) l++;
  while (r - 1 > l && colWhite(r - 1, t, b)) r--;
  // trim a 2px seam left by JPEG ringing, only on edges that were cropped
  if (t > 0) t = Math.min(t + 2, b); if (b < h) b = Math.max(b - 2, t);
  if (l > 0) l = Math.min(l + 2, r); if (r < w) r = Math.max(r - 2, l);
  return { l, t, w: r - l, h: b - t };
}
(async () => {
  const log = [];
  for (let n = 0; n < files.length; n++) {
    const img = new Image(); img.src = '/staged/' + key + '/' + files[n];
    await img.decode();
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
    const ctx = c.getContext('2d', { willReadFrequently: true }); ctx.drawImage(img, 0, 0);
    const bx = bounds(ctx, c.width, c.height);
    const o = document.createElement('canvas'); o.width = bx.w; o.height = bx.h;
    o.getContext('2d').drawImage(c, bx.l, bx.t, bx.w, bx.h, 0, 0, bx.w, bx.h);
    const blob = await new Promise(r => o.toBlob(r, 'image/jpeg', 0.9));
    const name = String(n).padStart(2, '0') + '.jpg';
    const res = await fetch('/final?dir=' + encodeURIComponent(dir) + '&name=' + name, { method: 'POST', body: blob });
    log.push(files[n] + ' -> ' + name + '  ' + c.width + 'x' + c.height + ' crop ' + bx.l + ',' + bx.t + ' ' + bx.w + 'x' + bx.h + '  ' + res.status + ' ' + await res.text());
    document.getElementById('o').textContent = log.join('\\n');
  }
  document.getElementById('o').textContent = 'DONE ' + dir + '\\n' + log.join('\\n');
})().catch(e => { document.getElementById('o').textContent = 'ERROR ' + e; });
</script>`;

http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  try {
    if (req.method === 'GET' && u.pathname === '/') return html(res, stagePage);

    if (req.method === 'POST' && u.pathname === '/stage') {
      const { key, urls, meta } = JSON.parse(await readBody(req));
      if (!KEY_RE.test(key)) return text(res, 400, 'bad key');
      const out = path.join(STAGE, key);
      fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
      // meta = { url, times[], text } scraped from the post page; read it back from <stage>/<key>/meta.json
      if (meta) fs.writeFileSync(path.join(out, 'meta.json'), JSON.stringify(meta, null, 1));
      const log = [];
      for (let i = 0; i < urls.length; i++) {
        const name = String(i).padStart(2, '0') + '.jpg';
        // the CDN times out intermittently; retry each image instead of aborting the whole post
        let ok = false, last = '';
        for (let attempt = 1; attempt <= 4 && !ok; attempt++) {
          try {
            const r = await fetch(urls[i], { signal: AbortSignal.timeout(30000) });
            if (!r.ok) { last = 'HTTP ' + r.status; continue; }
            const buf = Buffer.from(await r.arrayBuffer());
            fs.writeFileSync(path.join(out, name), buf);
            log.push(`${name} 200 ${buf.length}${attempt > 1 ? ' (attempt ' + attempt + ')' : ''}`);
            ok = true;
          } catch (e) { last = e.cause?.code || e.message; }
        }
        if (!ok) log.push(`${name} FAILED ${last}`);
      }
      console.log('staged', key, log.length);
      return text(res, 200, `staged ${key}\n` + log.join('\n'));
    }

    if (req.method === 'POST' && u.pathname === '/stage-local') {
      const { key, from } = JSON.parse(await readBody(req));
      if (!KEY_RE.test(key)) return text(res, 400, 'bad key');
      const out = path.join(STAGE, key);
      fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
      const files = fs.readdirSync(from).filter(f => /\.jpe?g$/i.test(f)).sort();
      files.forEach((f, i) => fs.copyFileSync(path.join(from, f), path.join(out, String(i).padStart(2, '0') + '.jpg')));
      return text(res, 200, `staged ${key} from ${from}: ${files.length}`);
    }

    if (req.method === 'GET' && u.pathname.startsWith('/staged/')) {
      const [, , key, file] = u.pathname.split('/');
      if (!KEY_RE.test(key) || !/^\d+\.jpg$/.test(file)) return text(res, 400, 'bad');
      res.writeHead(200, { 'content-type': 'image/jpeg' });
      return res.end(fs.readFileSync(path.join(STAGE, key, file)));
    }

    if (req.method === 'GET' && u.pathname === '/sheet') {
      const key = u.searchParams.get('key');
      const files = staged(key);
      return html(res, `<h3 style="margin:0 0 10px">${key} — ${files.length} images</h3>
        <div style="display:grid;grid-template-columns:repeat(${Math.min(files.length, 6)},1fr);gap:8px">
        ${files.map(f => `<figure style="margin:0;position:relative"><img src="/staged/${key}/${f}" style="width:100%;display:block;background:#f0f">
        <figcaption style="position:absolute;top:4px;left:4px;background:#e1252f;color:#fff;font:700 22px system-ui;padding:0 8px;border-radius:4px">${parseInt(f)}</figcaption></figure>`).join('')}</div>`);
    }

    if (req.method === 'GET' && u.pathname === '/process') {
      const key = u.searchParams.get('key'), dir = u.searchParams.get('dir');
      if (!KEY_RE.test(key) || !DIR_RE.test(dir)) return text(res, 400, 'bad key/dir (dir = make/model/YYYYMMDD-HHmm)');
      const target = path.join(ROOT, dir);
      if (fs.existsSync(target) && fs.readdirSync(target).length) return text(res, 409, 'target not empty: ' + dir);
      const drop = new Set((u.searchParams.get('drop') || '').split(',').filter(Boolean).map(Number));
      const files = staged(key).filter(f => !drop.has(parseInt(f)));
      return html(res, processPage(key, dir, files));
    }

    // serve already-saved vehicle photos same-origin so the cover page can read pixels
    if (req.method === 'GET' && u.pathname.startsWith('/asset/')) {
      const rel = decodeURIComponent(u.pathname.slice('/asset/'.length));
      if (!/^[a-z0-9-]+\/[a-z0-9-]+\/\d{8}-\d{4}\/\d{2}\.jpg$/.test(rel)) return text(res, 400, 'bad');
      res.writeHead(200, { 'content-type': 'image/jpeg' });
      return res.end(fs.readFileSync(path.join(ROOT, rel)));
    }

    // COVER  /covers#<encoded [{dir, file, y}]>  preview; add ?go=1 to write <dir>/cover.jpg
    //        y = vertical centre of the 4:3 crop as a fraction of image height (0..1)
    if (req.method === 'GET' && u.pathname === '/covers') {
      const go = u.searchParams.get('go') === '1';
      return html(res, `<div id=g style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px"></div><pre id=o></pre><script>
const list = JSON.parse(decodeURIComponent(location.hash.slice(1)));
const g = document.getElementById('g'), o = document.getElementById('o'), log = [];
(async () => {
  for (const it of list) {
    const img = new Image(); img.src = '/asset/' + it.dir + '/' + it.file; await img.decode();
    // r = height/width of the crop (default 3/4); name = output file (default cover.jpg)
    const W = img.naturalWidth, H = img.naturalHeight, ch = Math.min(H, Math.round(W * (it.r || 0.75)));
    const top = Math.max(0, Math.min(H - ch, Math.round(it.y * H - ch / 2)));
    const c = document.createElement('canvas'); c.width = W; c.height = ch;
    c.getContext('2d').drawImage(img, 0, top, W, ch, 0, 0, W, ch);
    const f = document.createElement('figure'); f.style.margin = 0;
    c.style.width = '100%'; f.append(c);
    const cap = document.createElement('figcaption'); cap.textContent = it.dir + ' y=' + it.y; f.append(cap); g.append(f);
    if (${go}) {
      const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.9));
      const name = it.name || 'cover.jpg';
      const res = await fetch('/final?dir=' + encodeURIComponent(it.dir) + '&name=' + name, { method: 'POST', body: blob });
      log.push(it.dir + ' ' + name + ' ' + W + 'x' + ch + ' top ' + top + ' ' + res.status);
    }
  }
  o.textContent = 'DONE\\n' + log.join('\\n');
})().catch(e => o.textContent = 'ERROR ' + e);
</script>`);
    }

    if (req.method === 'POST' && u.pathname === '/final') {
      const dir = u.searchParams.get('dir'), name = u.searchParams.get('name');
      if (!DIR_RE.test(dir) || !/^(\d{2}|cover|hero|feature)\.jpg$/.test(name)) return text(res, 400, 'bad');
      const out = path.join(ROOT, dir); fs.mkdirSync(out, { recursive: true });
      const buf = await readBody(req);
      fs.writeFileSync(path.join(out, name), buf);
      return text(res, 200, String(buf.length));
    }

    text(res, 404, 'not found');
  } catch (e) { console.error(e); text(res, 500, String(e)); }
}).listen(PORT, '127.0.0.1', () => console.log(`receiver ${PORT}\n  stage: ${STAGE}\n  out:   ${ROOT}`));
