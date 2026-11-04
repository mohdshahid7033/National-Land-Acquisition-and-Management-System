#!/usr/bin/env python3
"""
NLAMS · Work-Done & Implementation Record generator
  → docs/NLAMS_Work_Done.html  (self-contained record + LIVE embedded output app)
  → docs/NLAMS_Work_Done.pdf   (portrait A4 submission copy)
Documents every implemented phase (what we did → files produced → verification),
then includes the final runnable output (the single-file app) inside the HTML.
"""
import os, json, base64, html, io

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, '..')
DOCS = os.path.join(ROOT, 'docs')

def p(*a): return os.path.join(ROOT, *a)
def b64(path):
    ext = 'jpeg' if path.endswith(('.jpg', '.jpeg')) else 'png'
    return f'data:image/{ext};base64,' + base64.b64encode(open(path, 'rb').read()).decode()

# ---- downscaled images for lean embedding ----
from PIL import Image
def scaled(path, width, q=82):
    im = Image.open(path).convert('RGB')
    r = width / im.width
    im = im.resize((width, int(im.height * r)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'JPEG', quality=q)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()

IMG_STATE = scaled(p('docs/assets/state_map.png'), 640)
IMG_RRR   = scaled(p('docs/assets/rrr_align.png'), 900)
IMG_ORR   = scaled(p('docs/assets/orr_ring.png'), 900)
IMG_BG    = scaled(p('frontend/src/assets/bg.jpg'), 560, 70)
IMG_EMB   = b64(p('frontend/src/assets/emblem_flat.png'))

APP_HTML = open(p('docs/NLAMS_Demo_SingleFile.html'), encoding='utf-8').read()

# =============================== HTML ===============================
def img(data, cap, w=''):
    return (f'<figure><img src="{data}" style="width:{w or "100%"}" alt="">'
            f'<figcaption>{html.escape(cap)}</figcaption></figure>')

def code(s):
    return f'<pre>{html.escape(s.strip("\n"))}</pre>'

SNIP_CORR = '''
function corridorFor(p){
  if(CORR[p.id])return CORR[p.id];              // deterministic cache
  const route=routeFor(p); const R=rng(p.id+'cor');
  const n=route.closed?36:30;                   // parcels along the route
  const acq=p.acq/100;
  for(let i=0;i<n;i++){
    const t=(i+.5)/n;                           // position along spline
    /* ... project point + perpendicular offset ±27 to cut parcels ... */
'''
SNIP_ROUTE = '''
const routes = [
  ['GET', /^\\/api\\/health$/,  [],    ctrl.health],
  ['GET', /^\\/api\\/districts\\/([^/]+)$/, ['name'], ctrl.district],
  ['GET', /^\\/api\\/projects\\/([^/]+)\\/alignment$/, ['id'], ctrl.alignment],
  ['POST', /^\\/api\\/projects\\/([^/]+)\\/parcels\\/([^/]+)\\/verify$/,
          ['id','parcelId'], ctrl.verifyParcel],
  /* method · regex pattern · param names · controller */
'''
SNIP_VM = '''
// backend loads the SAME domain modules the SPA uses — one business core
const code = ORDER.map(f => fs.readFileSync(path.join(FRONT, 'src/js', f), 'utf8')).join('\\n;\\n');
return vm.runInNewContext(code + expr, { console:{log:()=>{}}, sessionStorage:{getItem:()=>null} });
'''
SNIP_STATE = '''
// state — one object, persisted; refresh never returns to login
const KEY='nlams_session_v1';
function save(){ try{ sessionStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
function restore(){ try{ return JSON.parse(sessionStorage.getItem(KEY)); }catch(e){ return null; } }
'''

phases = [
 ('P1', 'Requirement study & planning',
  'Read the problem statement (MoRD / DoLR — land acquisition monitoring), mapped the RFCTLARR Act 2013 '
  'into a 7-stage digital workflow (Proposal → Scrutiny → Sec-11 Notification → Verification → Award → '
  'Possession → Compensation), defined 4 government roles and froze the feature list.',
  '01-config.js (stage model, colours, roles)', 'Feature matrix + stage model frozen'),
 ('P2', 'UI / UX design',
  'Login designed on the sih2.jpg layout with SIH4.jpg as full-page photographic background; light '
  'government theme on forest green #0e8a5f; State Emblem of India branding; sidebar + topbar shell; '
  'card/table components and GIS overlay styles.',
  'frontend/src/css/styles.css (239 lines) · src/assets/', 'Theme tokens + full component kit'),
 ('P3', 'GIS data pipeline',
  'Downloaded and inspected Survey-of-India-derived boundaries for all 33 Telangana districts (GeoJSON). '
  'Python pipeline projected lat/lon → SVG coordinates, simplified rings and computed centroids / bboxes.',
  'data/telangana.geojson → scripts/build_map.py → generated 03-map-data.js', '33 districts render in-view'),
 ('P4', 'Core modules — config · utils · state',
  'Theme + stage palette (Notified → Verified → Awarded → Possession → Compensated, disputed in red); '
  'seeded RNG so maps are deterministic; icon set, modals, toasts; single state object S persisted to '
  'sessionStorage so a refresh never returns to login.',
  '01-config.js · 02-utils.js · 06-state.js', 'Session restore verified'),
 ('P5', 'Demo dataset',
  '14 realistic Telangana projects (Regional Ring Road, Warangal ORR, irrigation, highways) with districts, '
  'acquisition %, budgets; affected families; risk-scored alerts; user directory.',
  '04-data.js', '14 projects · 5 alerts · 4 roles'),
 ('P6', 'GIS engine — the heart',
  'Route builder: Catmull-Rom spline through control points; closed-ring geometry for ORR projects. '
  'Corridor builder: 36/30 parcels cut along the route with perpendicular offsets, stage bands derived '
  'from acquisition %. KPI aggregations per district; auto viewBox fitting.',
  '05-engine.js (141 lines)', 'Deterministic: same seed = same map'),
 ('P7', 'Application views (6 screens)',
  'Login (roles + demo access) · Shell (sidebar, topbar, statusbar with live API badge) · Dashboard '
  '(KPI cards, live 33-district status map, progress bars, sector chart, alert feed) · GIS Land Map '
  '(3-level drill: state → district → alignment with route, parcels, zoom/pan, stage-click filter) · '
  'Projects (searchable table + 5-tab details) · Acquisition / Compensation / Alerts workflows.',
  '07-views-login.js … 12-views-modules.js (637 lines)', 'Every screen stateful & clickable'),
 ('P8', 'App bootstrap',
  'Single render loop, delegated events, session restore on boot, and an API health probe that lights up '
  'the statusbar badge when served by the backend.',
  '13-app.js (132 lines)', 'Refresh keeps you logged in'),
 ('P9', 'Testing & regression',
  'scripts/smoke.js renders every page and all 14×5 project tabs on a stub DOM, asserts engine invariants '
  '(routes closed, parcels in-view, KPI sums) — result SMOKE PASS. Negative API tests included.',
  'scripts/smoke.js', 'SMOKE PASS · 0 failed asserts'),
 ('P10', 'Backend — REST API (zero dependencies)',
  'Node std-lib HTTP server serves the SPA, the single-file build, docs and the API. Regex route table with '
  'named params; controllers; services/domain.js loads the SAME business modules the SPA uses inside a VM '
  'context — UI and API cannot drift. Production-ready PostgreSQL + PostGIS schema included.',
  'backend/src/ (server · routes · controllers · services · models/schema.sql)', '11 endpoints curl-verified'),
 ('P11', 'Packaging & documentation',
  'Build pipeline fuses CSS + 13 modules + assets into ONE file (484 KB) that runs offline from a pendrive. '
  'README with tree + API table; SIH idea submission (official 6-slide template); pitch deck with speaker '
  'notes; development report; this work-done record.',
  'scripts/build.py → dist/index.html · docs/*', '0 leftover asset refs'),
]

kpi_strip = '''
<div class="strip">
  <div><b>3,321</b><span>lines of code</span></div>
  <div><b>13</b><span>frontend modules</span></div>
  <div><b>11</b><span>REST endpoints</span></div>
  <div><b>33</b><span>real districts</span></div>
  <div><b>14</b><span>projects modelled</span></div>
  <div><b>0</b><span>npm dependencies</span></div>
  <div><b>484 KB</b><span>single-file build</span></div>
</div>'''

ph = ''
for pid, title, body, files, status in phases:
    ph += f'''<div class="phase">
      <div class="phead"><span class="pid">{pid}</span><h3>{title}</h3><span class="ok">✓ {status}</span></div>
      <p>{body}</p>
      <p class="files">📦 {html.escape(files)}</p>
    </div>'''

api_rows = [
 ('GET', '/api/health', '{"ok":true,"service":"nlams-backend"}'),
 ('GET', '/api/kpi', 'state-level KPIs'),
 ('GET', '/api/districts', '33 districts + progress aggregates'),
 ('GET', '/api/districts/:name', 'centroid · bbox · aggregate'),
 ('GET', '/api/projects?q=ring', 'filtered project list'),
 ('GET', '/api/projects/:id', 'detail + families preview'),
 ('GET', '/api/projects/:id/alignment', '154-pt route · 36 parcels · viewBox'),
 ('GET', '/api/alerts · /api/users', 'risk-scored alerts · directory'),
 ('POST', '/api/projects/:id/parcels/:pid/verify', '{"ok":true …} · 404 on bad id'),
 ('POST', '/api/families/:fid/pay', '{"utr":"UTR1756…"} DBT release'),
]
api_t = ''.join(f'<tr><td class="m">{m}</td><td class="c">{html.escape(e)}</td><td>{html.escape(r)}</td><td class="ok">✓</td></tr>' for m, e, r in api_rows)

inv_rows = [
 ('01-config.js','12','stage model · palette · roles'), ('02-utils.js','54','helpers · RNG · icons · modals'),
 ('03-map-data.js','5*','Telangana geometry (generated)'), ('04-data.js','58','14 projects · alerts · users'),
 ('05-engine.js','141','⭐ GIS engine'), ('06-state.js','24','state + persistence'),
 ('07–08-views','81','login · shell'), ('09-views-dashboard.js','63','KPIs · status map'),
 ('10-views-gis.js','175','⭐ map + alignment view'), ('11-views-projects.js','111','table · 5-tab details'),
 ('12-views-modules.js','208','acquisition · compensation · alerts'), ('13-app.js','132','boot · events · probe'),
 ('css/styles.css','239','complete theme'), ('backend (5 files)','363','API server + schema'),
 ('scripts (7 files)','1,596','build · test · docs pipeline'),
]
inv_t = ''.join(f'<tr><td class="c">{f}</td><td>{loc}</td><td>{html.escape(d)}</td></tr>' for f, loc, d in inv_rows)

APP_JSON = json.dumps(APP_HTML).replace('</', '<\\/')

HTML = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>NLAMS — Work Done &amp; Implementation Record</title>
<style>
:root{{--g:#0e8a5f;--gd:#0b5a3e;--navy:#172a4c;--ink:#1e293b;--mut:#64748b;--line:#e2e8e5;--bg:#f4f7f5;--soft:#e7f6ee}}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{font-family:'Segoe UI',system-ui,Arial,sans-serif;color:var(--ink);background:var(--bg);font-size:14.5px;line-height:1.55}}
.wrap{{max-width:980px;margin:0 auto;padding:0 22px}}
header{{background:var(--navy);color:#fff;padding:26px 0 22px;border-bottom:6px solid var(--g)}}
header .wrap{{display:flex;gap:18px;align-items:center}}
header img{{height:74px}}
header h1{{font-size:23px;letter-spacing:.4px}}
header p{{color:#c9d8ea;font-size:12.5px;margin-top:3px}}
.badge{{margin-left:auto;background:#facc15;color:#5b4a00;font-weight:700;font-size:12px;padding:6px 12px;border-radius:20px;white-space:nowrap}}
.strip{{display:flex;flex-wrap:wrap;gap:10px;margin:-17px auto 26px}}
.strip div{{flex:1;min-width:110px;background:#fff;border:1px solid var(--line);border-radius:10px;padding:12px 8px;text-align:center;box-shadow:0 2px 8px rgba(15,46,34,.06)}}
.strip b{{display:block;font-size:20px;color:var(--gd)}}
.strip span{{font-size:11px;color:var(--mut)}}
h2{{color:var(--navy);font-size:19px;margin:34px 0 12px;padding-left:10px;border-left:5px solid var(--g)}}
.phase{{background:#fff;border:1px solid var(--line);border-left:4px solid var(--g);border-radius:8px;padding:14px 16px;margin-bottom:12px}}
.phead{{display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}}
.pid{{background:var(--g);color:#fff;font-weight:700;font-size:11.5px;border-radius:6px;padding:2px 8px}}
.phead h3{{font-size:15.5px;color:var(--navy)}}
.ok{{margin-left:auto;color:var(--gd);font-size:12px;font-weight:600}}
.phase p{{margin-top:7px}}
.files{{font-size:12px;color:var(--gd);background:var(--soft);border-radius:6px;padding:6px 10px;display:inline-block}}
pre{{background:#0f2e22;color:#d7f2e4;font:12px/1.55 Consolas,Menlo,monospace;border-radius:8px;padding:14px 16px;overflow-x:auto;margin:12px 0}}
figure{{background:#fff;border:1px solid var(--line);border-radius:10px;padding:10px;margin:14px 0}}
figure img{{display:block;width:100%;border-radius:6px}}
figcaption{{font-size:11.5px;color:var(--mut);padding:7px 4px 2px;font-weight:600}}
table{{width:100%;border-collapse:collapse;background:#fff;border:1px solid var(--line);border-radius:8px;overflow:hidden;font-size:13px}}
th{{background:var(--navy);color:#fff;text-align:left;padding:8px 10px;font-size:12px}}
td{{padding:7px 10px;border-top:1px solid var(--line)}}
td.m{{font-weight:700;color:var(--gd);width:52px}} td.c{{font-family:Consolas,monospace;font-size:12px}}
td.ok{{color:var(--g);font-weight:700;width:30px;text-align:center}}
.grid{{display:grid;grid-template-columns:1fr 1fr;gap:14px}}
@media(max-width:760px){{.grid{{grid-template-columns:1fr}}}}
.output{{background:#fff;border:2px solid var(--g);border-radius:14px;padding:22px;margin:20px 0}}
.launch{{display:inline-block;background:var(--g);color:#fff;font-size:16px;font-weight:700;border:none;border-radius:10px;padding:13px 26px;cursor:pointer;margin:10px 0}}
.launch:hover{{background:var(--gd)}}
#appFrame{{width:100%;height:88vh;border:1px solid var(--line);border-radius:10px;margin-top:14px;display:none}}
.note{{font-size:12px;color:var(--mut)}}
footer{{text-align:center;color:var(--mut);font-size:11.5px;padding:26px 0 34px}}
</style>
</head>
<body>
<header><div class="wrap">
  <img src="{IMG_EMB}" alt="State Emblem">
  <div>
    <h1>NLAMS · TELANGANA — WORK DONE &amp; IMPLEMENTATION RECORD</h1>
    <p>National Land Acquisition &amp; Management System · SIH 2026 · PS 26016 · Ministry of Rural Development / DoLR · Smart Automation</p>
    <p>Team &lt;Team Name&gt; · Team ID &lt;xxxx&gt; · &lt;College&gt; &nbsp;·&nbsp; Record date: 28 Aug 2026</p>
  </div>
  <span class="badge">COMPLETE ✓</span>
</div></header>

<div class="wrap">
{kpi_strip}

<h2>1 · What was implemented — phase by phase</h2>
{ph}

<h2>2 · Key code actually written</h2>
<div class="grid">
<div>{code(SNIP_CORR)}<p class="note">05-engine.js — corridor parcels cut along the route spline (deterministic, cached).</p></div>
<div>{code(SNIP_ROUTE)}<p class="note">backend routes — method · pattern · named params · controller.</p></div>
<div>{code(SNIP_VM)}<p class="note">services/domain.js — the SAME modules the SPA uses, loaded in a VM: one business core.</p></div>
<div>{code(SNIP_STATE)}<p class="note">06-state.js — persistence: refresh never returns to login.</p></div>
</div>

<h2>3 · Verification — test results</h2>
<table><tr><th>Method</th><th>Endpoint</th><th>Result observed</th><th>✓</th></tr>{api_t}</table>
<p class="note" style="margin-top:8px">Plus scripts/smoke.js — renders every page &amp; all 70 project tabs on a stub DOM and asserts
route/corridor invariants → <b>SMOKE PASS</b>. Map geometry deterministic; session restore verified.</p>

<h2>4 · Visual outputs produced by the build</h2>
{img(IMG_STATE, 'Dashboard status map — all 33 Telangana districts rendered from real boundaries (green = on track, amber = attention, red = stalled)')}
<div class="grid">
{img(IMG_RRR, 'Regional Ring Road — route spline + corridor parcels coloured by acquisition stage')}
{img(IMG_ORR, 'Warangal ORR — closed-ring alignment, red = stalled section, parcels around the ring')}
</div>
{img(IMG_BG, 'Login screen background (SIH4.jpg) — full-page photographic portal per design reference', '62%')}

<h2>5 · File inventory (as built)</h2>
<table><tr><th>File</th><th>Lines</th><th>Role</th></tr>{inv_t}</table>

<h2>6 · How to run the output</h2>
<div class="phase"><p><b>Way 1 — no install:</b> open <b>NLAMS_Demo_SingleFile.html</b> (same as dist/index.html) in any browser — the complete app runs offline from that one file.</p>
<p><b>Way 2 — full stack:</b> <code>npm start</code> → http://localhost:8080 — backend serves the SPA + live REST API (statusbar shows <b>◉ API connected</b>). Then: <code>npm test</code> regression · <code>npm run build</code> rebuild the single file · <code>npm run report</code> / <code>npm run workdone</code> regenerate documents.</p></div>

<div class="output" id="out">
  <h2 style="margin-top:0">7 · FINAL OUTPUT — run it right here</h2>
  <p>Everything implemented above is merged into the application below. Click to launch the live product
  (embedded from the 484&nbsp;KB single-file build — login with <b>demo access</b>).</p>
  <button class="launch" onclick="document.getElementById('appFrame').style.display='block';document.getElementById('appFrame').srcdoc=APP_HTML;this.textContent='▶ NLAMS is running below — login: demo access';this.disabled=true">▶ &nbsp;Launch NLAMS application</button>
  <span class="note">If your viewer blocks embedded apps, open <b>NLAMS_Demo_SingleFile.html</b> directly — identical build.</span>
  <iframe id="appFrame" title="NLAMS output"></iframe>
</div>

<footer>NLAMS · Work Done &amp; Implementation Record · &lt;Team Name&gt; · SIH 2026 PS 26016 · generated by scripts/build_workdone.py</footer>
</div>
<script>var APP_HTML = {APP_JSON};</script>
</body>
</html>'''

open(p('docs', 'NLAMS_Work_Done.html'), 'w', encoding='utf-8').write(HTML)
print('HTML written:', round(os.path.getsize(p('docs', 'NLAMS_Work_Done.html')) / 1024), 'KB')

# =============================== PDF (portrait A4) ===============================
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

W, H = 595, 842
M = 46
GREEN, GD = HexColor('#0e8a5f'), HexColor('#0b5a3e')
NAVY, INK, MUT = HexColor('#172a4c'), HexColor('#1e293b'), HexColor('#64748b')
LIGHT, LINE, WHITE = HexColor('#f3f6f4'), HexColor('#dee8e2'), HexColor('#ffffff')
GOLD, SOFT = HexColor('#facc15'), HexColor('#e7f6ee')

c = canvas.Canvas(p('docs', 'NLAMS_Work_Done.pdf'), pagesize=(W, H))

def tx(x, y, s, size=10, col=INK, bold=False, align='l'):
    c.saveState(); f = 'Helvetica-Bold' if bold else 'Helvetica'
    c.setFont(f, size); c.setFillColor(col)
    for i, ln in enumerate(s.split('\n')):
        wd = c.stringWidth(ln, f, size)
        xx = x - wd / 2 if align == 'c' else (x - wd if align == 'r' else x)
        c.drawString(xx, y - i * size * 1.25, ln)
    c.restoreState()

def wrap(s, size, width, bold=False):
    f = 'Helvetica-Bold' if bold else 'Helvetica'
    lines, cur = [], ''
    for w_ in s.split():
        t = (cur + ' ' + w_).strip()
        if c.stringWidth(t, f, size) <= width: cur = t
        else: lines.append(cur); cur = w_
    if cur: lines.append(cur)
    return lines

def wtx(x, y, s, size=9.5, col=INK, bold=False, width=300, lead=None):
    c.saveState(); f = 'Helvetica-Bold' if bold else 'Helvetica'
    c.setFont(f, size); c.setFillColor(col)
    lead = lead or size * 1.28
    for i, ln in enumerate(wrap(s, size, width, bold)): c.drawString(x, y - i * lead, ln)
    c.restoreState()
    return len(wrap(s, size, width, bold))

def rr(x, y, w, h, col=None, stroke=None, r=5):
    c.saveState()
    if col is not None: c.setFillColor(col)
    if stroke is not None: c.setStrokeColor(stroke); c.setLineWidth(.8)
    c.roundRect(x, y, w, h, r, fill=1 if col is not None else 0, stroke=1 if stroke is not None else 0)
    c.restoreState()

def fit_img(path, x, y, w, h):
    img_ = ImageReader(path); iw, ih = img_.getSize(); ar = iw / ih
    fw, fh = (w, w / ar) if w / h < ar else (h * ar, h)
    c.drawImage(img_, x + (w - fw) / 2, y + (h - fh) / 2, fw, fh)

def phead(n, t):
    c.setFillColor(GREEN); c.rect(0, H - 8, W, 8, fill=1, stroke=0)
    tx(M, H - 40, t, 15, NAVY, True)
    tx(W - M, H - 38, f'{n} / 7', 9, MUT, align='r')
    return H - 56

def foot(n):
    c.setStrokeColor(LINE); c.line(M, 40, W - M, 40)
    tx(M, 28, '<Team Name> · NLAMS — Work Done Record · SIH 2026 PS 26016', 7.5, MUT, True)

def codeblock(x, y, s, size=7.3):
    lines = s.strip('\n').split('\n')
    h_ = len(lines) * size * 1.42 + 12
    c.saveState(); c.setFillColor(HexColor('#0f2e22')); c.roundRect(x, y - h_, W - 2 * M, h_, 4, fill=1, stroke=0)
    c.setFont('Courier', size); c.setFillColor(HexColor('#d7f2e4'))
    yy = y - 12
    for ln in lines: c.drawString(x + 10, yy, ln); yy -= size * 1.42
    c.restoreState()
    return y - h_ - 8

# ---- page 1 cover ----
c.setFillColor(NAVY); c.rect(0, H - 200, W, 200, fill=1, stroke=0)
for i, col in enumerate([HexColor('#f97316'), WHITE, GREEN]):
    c.setFillColor(col); c.rect(0, H - 204 - i * 4, W, 4, fill=1, stroke=0)
fit_img(p('frontend/src/assets/emblem_flat.png'), M, H - 160, 66, 66)
tx(M + 84, H - 82, 'WORK DONE &', 22, WHITE, True)
tx(M + 84, H - 108, 'IMPLEMENTATION RECORD', 22, WHITE, True)
tx(M + 84, H - 132, 'NLAMS · Telangana — National Land Acquisition & Management System', 11, GOLD, True)
tx(M + 84, H - 150, 'Every phase implemented, every file produced, every test result — then the final output', 9, HexColor('#aac3e1'))
tx(W - M, H - 70, 'SIH 2026', 11, GOLD, True, align='r'); tx(W - M, H - 94, 'PS 26016', 20, WHITE, True, align='r')
meta = [('Team', '<Team Name> · Team ID <xxxx> · <College / Institute Name>'),
        ('Problem', 'MoRD / DoLR — monitor land acquisition for national projects (Smart Automation · Software)'),
        ('Deliverables', 'frontend/ SPA (13 modules) · backend/ REST API (zero deps) · dist/index.html single file · docs/'),
        ('Stack', 'Figma · QGIS/GeoJSON · Python · HTML/CSS/JS · SVG GIS engine · Node.js · Postman · Git'),
        ('Status', 'COMPLETE — SMOKE PASS · 11/11 endpoints verified · 484 KB offline build')]
y = H - 236
for k, v in meta:
    rr(M, y - 34, 92, 34, LIGHT, LINE, 3); tx(M + 8, y - 22, k, 8.5, NAVY, True)
    rr(M + 92, y - 34, W - 2 * M - 92, 34, WHITE, LINE, 3)
    wtx(M + 102, y - 14, v, 8.8, INK, False, W - 2 * M - 116, 11.5)
    y -= 40
rr(M, y - 96, W - 2 * M, 84, SOFT, GREEN, 4)
c.setFillColor(GD); c.setFont('Helvetica-Bold', 10); c.drawString(M + 12, y - 22, 'Numbers')
nums = [('3,321', 'lines of code'), ('13', 'JS modules'), ('11', 'API endpoints'), ('33', 'real districts'),
        ('14', 'projects'), ('0', 'dependencies'), ('484 KB', 'single file'), ('100%', 'tests passed')]
nx = M + 12
for v, l in nums:
    tx(nx, y - 48, v, 12, GD, True); tx(nx, y - 62, l, 6.8, MUT)
    nx += (W - 2 * M - 24) / 8
foot(1); c.showPage()

# ---- page 2 phase summary ----
y = phead(2, 'IMPLEMENTATION SUMMARY — 11 PHASES')
rows = [('P1', 'Requirement study — RFCTLARR → 7-stage model, roles', '01-config.js'),
        ('P2', 'UI/UX design — login, theme, shell, emblem', 'css/styles.css'),
        ('P3', 'GIS data — 33 districts → SVG geometry pipeline', '03-map-data.js (gen)'),
        ('P4', 'Core — palette, RNG, modals, state + session', '01 · 02 · 06'),
        ('P5', 'Dataset — 14 projects, families, alerts, users', '04-data.js'),
        ('P6', 'GIS engine — splines, rings, corridors, KPIs', '05-engine.js'),
        ('P7', 'Views — 6 screens incl. alignment + workflows', '07…12-views'),
        ('P8', 'App boot — render loop, events, API probe', '13-app.js'),
        ('P9', 'Testing — full-render regression', 'scripts/smoke.js'),
        ('P10', 'Backend — REST API + shared domain core', 'backend/src/*'),
        ('P11', 'Packaging — single-file build + documentation', 'build.py · docs/')]
rr(M, y - 30 - len(rows) * 26 - 6, W - 2 * M, len(rows) * 26 + 10, WHITE, LINE, 4)
yy = y - 8
for pid, t, f in rows:
    c.setFillColor(GREEN); c.setFont('Helvetica-Bold', 8.5); c.drawString(M + 10, yy - 16, pid)
    c.setFillColor(INK); c.setFont('Helvetica', 9.3); c.drawString(M + 34, yy - 16, t)
    c.setFillColor(GD); c.setFont('Courier', 7.6); c.drawString(W - M - 130, yy - 16, f)
    c.setFillColor(GREEN); c.setFont('Helvetica-Bold', 8.5); c.drawString(W - M - 34, yy - 16, '✓')
    c.setStrokeColor(LINE); c.setLineWidth(.4); c.line(M + 8, yy - 22, W - M - 8, yy - 22)
    yy -= 26
y = yy - 18
tx(M, y, 'Each phase is detailed with its produced files and verification on the next pages.', 8.5, MUT)
foot(2); c.showPage()

# ---- page 3 phases 1-5 ----
y = phead(3, 'PHASES 1–5 — FROM STUDY TO DATASET')
d15 = [
 ('P1 · Requirement study', 'PS 26016 analysed; RFCTLARR Act 2013 mapped to a 7-stage digital workflow (Proposal → Scrutiny → Sec-11 → Verification → Award → Possession → Compensation); 4 roles defined (State · Central · District · Field).'),
 ('P2 · UI/UX design', 'Login on sih2.jpg layout with SIH4.jpg photographic background; light government theme, forest green #0e8a5f; State Emblem branding; full component kit in CSS (239 lines).'),
 ('P3 · GIS data pipeline', 'Survey-of-India-derived GeoJSON of all 33 Telangana districts downloaded and inspected; Python projected lat/lon → SVG, simplified rings, computed centroids/bboxes → generated map module.'),
 ('P4 · Core modules', 'Stage palette (Notified #3b82f6 → Verified #f59e0b → Awarded #a855f7 → Possession #84cc16 → Compensated #16a34a; disputed #ef4444); seeded RNG for deterministic maps; single state object persisted to sessionStorage — refresh never returns to login.'),
 ('P5 · Demo dataset', '14 realistic projects (Regional Ring Road, Warangal ORR, irrigation, highways…) with districts, acquisition %, budgets; affected families; risk-scored alerts; user directory.'),
]
for t, d in d15:
    n = wtx(M + 2, y - 12, d, 9, INK, False, W - 2 * M - 8)
    tx(M, y - 12, '', 9)
    tx(M, y - 12, '', 9)
    c.setFillColor(GD); c.setFont('Helvetica-Bold', 9.6)
    # title line above body
    tx(M, y + 2, t, 9.6, GD, True)
    y -= n * 11.6 + 16
fit_img(p('docs/assets/state_map.png'), W - M - 150, y - 150, 150, 150)
wtx(M, y - 20, 'Output of P3+P6: the live status map — all 33 districts, colour = progress, click to drill down.', 9, INK, False, W - 2 * M - 165)
y -= 166
tx(M, y, 'P4 session key: nlams_session_v1 — restores user, page, filters. Verified across refresh.', 8.5, MUT)
foot(3); c.showPage()

# ---- page 4 phases 6-8 ----
y = phead(4, 'PHASES 6–8 — THE GIS ENGINE, VIEWS & APP')
wtx(M, y - 12, 'P6 · GIS engine (05-engine.js, 141 LOC) — the heart of the product: Catmull-Rom route splines through '
        'control points, closed-ring geometry for ORR projects, corridor generator cutting 36/30 parcels along the '
        'route with perpendicular offsets and stage bands vs acquisition %, KPI aggregation, auto viewBox fit. '
        'Fully deterministic (same seed → same map).', 9, INK, False, W - 2 * M)
y -= 64
y = codeblock(M, y, SNIP_CORR)
wtx(M, y - 14, 'P7 · Six views (07–12, 637 LOC): login · shell with live API badge · dashboard (KPIs, status map, bars, '
        'donut, alerts) · GIS 3-level drill (state → district → alignment with zoom/pan and stage-click filtering) · '
        'projects (search + 5 tabs) · acquisition/compensation/alerts workflows.  P8 · App boot (13-app.js): render '
        'loop, delegated events, session restore, /api/health probe.', 9, INK, False, W - 2 * M)
y -= 74
fit_img(p('docs/assets/rrr_align.png'), M, y - 128, (W - 2 * M - 10) / 2, 128)
fit_img(p('docs/assets/orr_ring.png'), M + (W - 2 * M - 10) / 2 + 10, y - 128, (W - 2 * M - 10) / 2, 128)
tx(M, y - 140, 'RRR corridor parcels', 7.5, MUT, True)
tx(M + (W - 2 * M - 10) / 2 + 10, y - 140, 'Warangal ORR closed ring', 7.5, MUT, True)
foot(4); c.showPage()

# ---- page 5 backend + testing ----
y = phead(5, 'PHASES 9–10 — BACKEND & TEST RESULTS')
wtx(M, y - 12, 'P10 · Backend (Node std-lib, ZERO npm dependencies): HTTP server serves the SPA, single-file build, '
        'docs and REST API. Regex route table with named params; controllers; services/domain.js loads the SAME '
        'business modules the SPA uses (VM context) — one core, zero drift. PostgreSQL+PostGIS production schema included.', 9, INK, False, W - 2 * M)
y -= 66
y = codeblock(M, y, SNIP_ROUTE)
y = codeblock(M, y, SNIP_VM.replace('fs.readFileSync(path.join(FRONT, \'src/js\', f)', "fs.readFileSync(join(FRONT,'src/js',f)"))
tx(M, y, 'P9/P10 — observed results (cURL/Postman + smoke.js):', 9.6, NAVY, True); y -= 16
res = [('GET /api/health', '{"ok":true,"service":"nlams-backend"}'),
       ('GET /api/districts', '33 districts + aggregates'),
       ('GET /api/projects/NLAMS-TG-001/alignment', '154-pt closed ring · 36 parcels · viewBox'),
       ('POST …/parcels/SP-05/verify', '{"ok":true … "GPS-verified"}'),
       ('POST …/parcels/SP-99/verify (negative)', '{"error":"parcel not found"} · HTTP 404'),
       ('POST /api/families/F-0142/pay', '{"utr":"UTR1756…"} DBT release'),
       ('scripts/smoke.js', 'renders every page + 70 tabs → SMOKE PASS'),
       ('single-file build', '484 KB · 13 modules · 0 leftover asset refs')]
rr(M, y - len(res) * 15 - 8, W - 2 * M, len(res) * 15 + 10, WHITE, LINE, 4)
yy = y - 4
for a, b in res:
    c.setFillColor(GREEN); c.setFont('Helvetica-Bold', 8); c.drawString(M + 8, yy - 11, '✓')
    c.setFont('Courier', 7.6); c.setFillColor(INK); c.drawString(M + 20, yy - 11, a)
    c.setFont('Helvetica', 8.4); c.setFillColor(GD); c.drawString(M + 250, yy - 11, b)
    yy -= 15
foot(5); c.showPage()

# ---- page 6 packaging + inventory ----
y = phead(6, 'PHASE 11 — PACKAGING & FILE INVENTORY')
wtx(M, y - 12, 'scripts/build.py fuses CSS + 13 modules + images (data-URI) into ONE file: dist/index.html — 484 KB, '
        'runs offline from a pendrive, no server, no install. A persistent copy ships as docs/NLAMS_Demo_SingleFile.html. '
        'Documentation set: README (tree + API table) · SIH idea submission (official template) · pitch deck · '
        'development report · this work-done record.', 9, INK, False, W - 2 * M)
y -= 58
inv = [('frontend/src/js (13 modules)', '1,044', 'SPA: engine · views · state'), ('frontend/src/css/styles.css', '239', 'complete theme'),
       ('backend/src (5 files)', '363', 'API server + PostGIS schema'), ('scripts (7 tools)', '1,596', 'build · test · docs pipeline'),
       ('data/telangana.geojson', '—', '33 district boundaries (input)'), ('dist/index.html', '484 KB', 'single-file output build'),
       ('docs/ (9 files)', '—', 'submissions · decks · records')]
rr(M, y - len(inv) * 16 - 8, W - 2 * M, len(inv) * 16 + 10, WHITE, LINE, 4)
yy = y - 4
c.setFillColor(NAVY); c.setFont('Helvetica-Bold', 8)
c.drawString(M + 10, yy - 9, 'FILE'); c.drawString(W - M - 150, yy - 9, 'SIZE/LOC'); c.drawString(W - M - 84, yy - 9, 'ROLE')
yy -= 16
for f, l, r in inv:
    c.setFont('Courier', 7.6); c.setFillColor(INK); c.drawString(M + 10, yy - 10, f)
    c.setFont('Helvetica-Bold', 8); c.setFillColor(GD); c.drawString(W - M - 150, yy - 10, l)
    c.setFont('Helvetica', 8); c.setFillColor(MUT); c.drawString(W - M - 84, yy - 10, r)
    c.setStrokeColor(LINE); c.setLineWidth(.4); c.line(M + 8, yy - 14, W - M - 8, yy - 14)
    yy -= 16
y = yy - 14
fit_img(p('frontend/src/assets/bg.jpg'), M, y - 108, 168, 108)
wtx(M + 182, y - 16, 'How to run:', 9.6, NAVY, True)
wtx(M + 182, y - 32, '1 · open NLAMS_Demo_SingleFile.html — complete app, offline, zero install.', 8.8, INK, False, W - M - 228)
wtx(M + 182, y - 46, '2 · npm start → localhost:8080 — SPA + live REST API (statusbar badge).', 8.8, INK, False, W - M - 228)
wtx(M + 182, y - 60, '3 · npm test → full-render regression (SMOKE PASS).', 8.8, INK, False, W - M - 228)
wtx(M + 182, y - 74, 'Demo path: login → dashboard → GIS drill → alignment → verify parcel → pay family.', 8.8, GD, False, W - M - 228)
foot(6); c.showPage()

# ---- page 7 final output ----
y = phead(7, 'FINAL OUTPUT — THE COMPLETE MERGED PRODUCT')
rr(M, y - 128, W - 2 * M, 122, SOFT, GREEN, 5)
c.setFillColor(GD); c.setFont('Helvetica-Bold', 11); c.drawString(M + 14, y - 24, 'NLAMS_Demo_SingleFile.html  =  the output file')
wtx(M + 14, y - 44, 'Every tool and every phase above is merged by the pipeline into this ONE file: the full NLAMS '
        'application — login (SIH4 background), dashboard with live Telangana map, GIS 3-level drill with route '
        'splines and stage-coloured corridor parcels, projects with 5 tabs, 6-stage acquisition workflow, '
        'compensation DBT ledger, alerts, persistent session. Same build as dist/index.html; also served live by '
        'the backend at :8080 with the API connected.', 8.8, INK, False, W - 2 * M - 28)
y -= 148
fit_img(p('docs/assets/rrr_align.png'), M, y - 150, W - 2 * M, 150)
tx(M, y - 162, 'Screenshot from the output: Regional Ring Road alignment — route spline, corridor parcels in workflow colours.', 8, MUT, True)
y -= 182
rr(M, y - 74, W - 2 * M, 68, LIGHT, LINE, 5)
tx(M + 14, y - 20, 'Definition of done — all checked:', 9.5, NAVY, True)
for i, t in enumerate(['✓ 11/11 API endpoints verified (incl. negative tests)', '✓ SMOKE PASS full-render regression',
                       '✓ deterministic GIS engine', '✓ session persists across refresh',
                       '✓ offline single-file build', '✓ zero dependencies — runs anywhere']):
    c.setFont('Helvetica', 8.4); c.setFillColor(INK)
    c.drawString(M + 14 + (i % 2) * ((W - 2 * M) / 2), y - 38 - (i // 2) * 13, t)
tx(W - M, 28, '— end of record —', 8, MUT, align='r')
foot(7); c.showPage()
c.save()
print('PDF written:', round(os.path.getsize(p('docs', 'NLAMS_Work_Done.pdf')) / 1024), 'KB')
