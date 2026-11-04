#!/usr/bin/env python3
"""
NLAMS · Project Development Report generator
Builds docs/NLAMS_Project_Report.pdf  (presentation copy)
    +  docs/NLAMS_Project_Report.docx (editable copy)

Format: classic student project report — tools used → how each tool's output
merged → complete project (architecture, structure, screenshots, testing).
"""
import os
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.join(HERE, '..', 'docs')
ASSETS = os.path.join(HERE, '..', 'docs', 'assets')

W, H = 960, 540
GREEN, GREEN_D = HexColor('#0e8a5f'), HexColor('#0b5a3e')
DARK, INK, MUT = HexColor('#0f2e22'), HexColor('#1e293b'), HexColor('#64748b')
LIGHT, LINE, WHITE = HexColor('#f3f6f4'), HexColor('#dee8e2'), HexColor('#ffffff')
SAFF, GOLD, NAVY = HexColor('#f97316'), HexColor('#facc15'), HexColor('#172a4c')
AMBER, SOFT = HexColor('#b45309'), HexColor('#e7f6ee')

# =============================== PDF ===============================
c = canvas.Canvas(os.path.join(DOCS, 'NLAMS_Project_Report.pdf'), pagesize=(W, H))

def tx(x, y, s, size=11, col=INK, bold=False, align='l', lead=None, font='Helvetica'):
    c.saveState()
    f = ('Courier' if font == 'Courier' else 'Helvetica') + ('-Bold' if bold else '')
    c.setFont(f, size); c.setFillColor(col)
    lead = lead or size * 1.22
    for i, line in enumerate(s.split('\n')):
        wd = c.stringWidth(line, f, size)
        xx = x - wd / 2 if align == 'c' else (x - wd if align == 'r' else x)
        c.drawString(xx, y - i * lead, line)
    c.restoreState()

def wrap(s, size, width, bold=False, font='Helvetica'):
    f = ('Courier' if font == 'Courier' else 'Helvetica') + ('-Bold' if bold else '')
    lines, cur = [], ''
    for w_ in s.split():
        t = (cur + ' ' + w_).strip()
        if c.stringWidth(t, f, size) <= width: cur = t
        else: lines.append(cur); cur = w_
    if cur: lines.append(cur)
    return lines

def wtx(x, y, s, size=10, col=INK, bold=False, width=200, lead=None):
    c.saveState(); f = 'Helvetica-Bold' if bold else 'Helvetica'
    c.setFont(f, size); c.setFillColor(col)
    lead = lead or size * 1.24
    for i, ln in enumerate(wrap(s, size, width, bold)): c.drawString(x, y - i * lead, ln)
    c.restoreState()

def rt(x, y, w, h, col=None, stroke=None, r=6):
    c.saveState()
    if col is not None: c.setFillColor(col)
    if stroke is not None: c.setStrokeColor(stroke); c.setLineWidth(0.9)
    c.roundRect(x, y, w, h, r, fill=1 if col is not None else 0, stroke=1 if stroke is not None else 0)
    c.restoreState()

def head_bar(title, sub=None):
    c.setFillColor(GREEN); c.rect(0, H - 10, W, 10, fill=1, stroke=0)
    tx(36, H - 50, title, 21, NAVY, True)
    if sub: tx(36, H - 68, sub, 10.5, MUT)
    return H - (88 if sub else 76)

def bullets(x, y, items, size=10, width=880, gap=5):
    for h, b in items:
        c.setFillColor(GREEN); c.setFont('Helvetica-Bold', size)
        c.drawString(x, y, '▪')
        wtx(x + 13, y, (h + ' — ' + b) if b else h, size, INK, False, width)
        y -= (len(wrap((h + ' — ' + b) if b else h, size, width)) * size * 1.26 + gap)
    return y

def fit_img(path, x, y, w, h):
    img = ImageReader(path); iw, ih = img.getSize(); ar = iw / ih
    fw, fh = (w, w / ar) if w / h < ar else (h * ar, h)
    c.drawImage(img, x + (w - fw) / 2, y + (h - fh) / 2, fw, fh)

def footer(n):
    c.setStrokeColor(LINE); c.setLineWidth(0.9); c.line(36, 36, W - 36, 36)
    tx(36, 24, '<Team Name> · NLAMS — Project Development Report', 8, MUT, True)
    tx(W - 36, 24, f'Page {n}', 8, MUT, align='r')

# ---------------- PAGE 1 · COVER ----------------
c.setFillColor(NAVY); c.rect(0, H - 210, W, 210, fill=1, stroke=0)
for i, col in enumerate([SAFF, WHITE, GREEN]):
    c.setFillColor(col); c.rect(0, H - 214 - i * 4.4, W, 4.4, fill=1, stroke=0)
fit_img('frontend/src/assets/emblem_flat.png', 40, H - 170, 92, 92)
tx(150, H - 82, 'NATIONAL LAND ACQUISITION &', 24, WHITE, True)
tx(150, H - 112, 'MANAGEMENT SYSTEM (NLAMS) · TELANGANA', 24, WHITE, True)
tx(150, H - 140, 'Project Development Report', 15, GOLD, True)
tx(150, H - 162, 'How multiple tools were merged into one complete, working product', 10.5, HexColor('#aac3e1'))
tx(W - 44, H - 78, 'SIH 2026', 13, GOLD, True, align='r')
tx(W - 44, H - 108, 'PS 26016', 26, WHITE, True, align='r')
tx(W - 44, H - 130, 'Smart Automation', 9.5, HexColor('#aac3e1'), align='r')

rows = [('Project', 'NLAMS — Real-Time Land Acquisition & Management System (Telangana prototype)'),
        ('Organization / PS', 'Ministry of Rural Development · Dept. of Land Resources (DoLR)'),
        ('Team', '<Team Name>  ·  Team ID <xxxx>  ·  <College / Institute Name>'),
        ('Stack summary', 'Figma · QGIS/GeoJSON · Python · HTML5/CSS3/JS · SVG GIS engine · Node.js API · Git · Postman'),
        ('Deliverables', 'frontend/ (SPA) · backend/ (REST API) · dist/ (single-file build) · docs/ (SIH decks)')]
y = H - 262
for k, v in rows:
    rt(40, y - 44, 150, 44, LIGHT, LINE, 3)
    tx(52, y - 27, k, 9.5, NAVY, True)
    rt(190, y - 44, 730, 44, WHITE, LINE, 3)
    wtx(202, y - 17, v, 10, DARK if k != 'Team' else AMBER, k == 'Project', 706, 14)
    y -= 52
rt(40, y - 96, 880, 84, SOFT, GREEN, 5)
c.setFillColor(GREEN_D); c.setFont('Helvetica-Bold', 11)
c.drawString(56, y - 26, 'In one line')
wtx(56, y - 46, 'NLAMS watches every land-acquisition project in Telangana on one live map — every parcel coloured by its legal stage (Notified → Verified → Awarded → Possession → Compensated), every rupee of compensation tracked, every risk flagged before it becomes a protest.', 10, INK, False, 848, 14)
footer(1); c.showPage()

# ---------------- PAGE 2 · TOOLS USED ----------------
y = head_bar('1 · TOOLS & TECHNOLOGIES USED', 'Every tool, its role, and what it contributed to the final build') - 14
groups = [
    ('DESIGN & PLANNING', DARK, [
        ('Figma', 'UI/UX wireframes of login, dashboard & GIS screens', 'color tokens & layout → css/styles.css'),
        ('Notion / Docs', 'requirement study of RFCTLARR Act 2013', '7-stage workflow model → js/01-config.js'),
    ]),
    ('GIS DATA & PROCESSING', GREEN_D, [
        ('QGIS + Python 3', 'boundaries of all 33 districts; projection to SVG, simplification, centroids', 'data/telangana.geojson → js/03-map-data.js'),
    ]),
    ('FRONTEND', GREEN, [
        ('HTML5 + CSS3', 'semantic layout, light government theme, responsive grid', 'frontend/index.html + css/styles.css'),
        ('JavaScript (ES6)', '13 ordered modules — state machine, GIS engine, views', 'frontend/src/js/01…13'),
        ('SVG (in-house engine)', 'live vector map: route splines, parcel corridors, zoom/pan', '10-views-gis.js + 05-engine.js'),
    ]),
    ('BACKEND', DARK, [
        ('Node.js (std-lib http/vm/fs)', 'REST API over the shared domain core — zero npm installs', 'backend/src/server.js + routes/ + controllers/'),
        ('PostgreSQL + PostGIS', 'production data model (parcels with geometry, SLA payments, audit)', 'backend/src/models/schema.sql'),
    ]),
    ('QUALITY & DELIVERY', GREEN_D, [
        ('Git + GitHub · DevTools', 'version control & team collaboration; layout/console debugging', 'commit history · .gitignore'),
        ('Postman/cURL + smoke.js', 'API contract tests (11 endpoints) + auto regression of every page/tab', 'scripts/smoke.js → SMOKE PASS'),
    ]),
]
for gname, colr, tools in groups:
    rt(36, y - 22, 888, 20, colr, None, 3)
    tx(48, y - 17, gname, 9.5, WHITE, True)
    y -= 27
    for t, role, out in tools:
        tx(48, y - 13, t, 9.6, NAVY, True)
        wtx(255, y - 13, role, 9.3, INK, False, 430)
        c.setFillColor(GREEN); c.setFont('Helvetica-Bold', 9.3)
        c.drawString(700, y - 13, '→')
        wtx(714, y - 13, out, 8.4, GREEN_D, False, 205)
        c.setStrokeColor(LINE); c.setLineWidth(0.5); c.line(48, y - 24, 924, y - 24)
        y -= 27
    y -= 6
footer(2); c.showPage()

# ---------------- PAGE 3 · HOW TOOLS MERGED ----------------
y = head_bar('2 · HOW THE TOOLS MERGED INTO ONE PROJECT', 'Each tool produced an artefact; the build pipeline fused them into the complete product')
layers = [
    ('INPUT TOOLS', 'designs · geo-data · code', DARK,
     [('Figma', 'login & dashboard mockups'), ('QGIS / GeoJSON', '33 district boundaries'), ('VS Code', '13 JS modules + API server')]),
    ('TRANSFORM TOOLS', 'python · git', GREEN_D,
     [('build_map.py', 'GeoJSON → SVG paths + centroids'), ('domain core', 'one business logic shared by UI & API'), ('git commits', 'merge every contribution safely')]),
    ('BUILD & MERGE', 'one command', GREEN,
     [('scripts/build.py', 'bundles CSS + 13 modules + assets'), ('node backend', 'serves SPA + /api on one port'), ('smoke.js', 'renders every page automatically')]),
    ('COMPLETE PROJECT', 'deliverables', NAVY,
     [('frontend/ + backend/', 'full-stack source tree'), ('dist/index.html', 'single-file offline build (484 KB)'), ('docs/', 'SIH PDF/PPT + this report')]),
]
yy = y - 4
for i, (name, tag, colr, boxes) in enumerate(layers):
    c.setFillColor(colr); c.roundRect(36, yy - 20, 168, 62, 6, fill=1, stroke=0)
    tx(48, yy + 22, name, 10, WHITE, True)
    tx(48, yy + 6, tag, 8, HexColor('#cfe3d8'))
    bx = 224
    for t, d in boxes:
        rt(bx, yy - 20, 226, 62, WHITE, LINE, 5)
        tx(bx + 12, yy + 22, t, 9.6, GREEN_D if i < 3 else NAVY, True)
        wtx(bx + 12, yy + 4, d, 8.3, INK, False, 202)
        bx += 238
    if i < 3:
        c.setFillColor(GREEN); c.setFont('Helvetica-Bold', 13)
        c.drawString(W / 2 - 5, yy - 36, '▼')
    yy -= 94
rt(36, 44, 888, 30, SOFT, GREEN, 4)
c.setFillColor(GREEN_D); c.setFont('Helvetica-Bold', 9)
c.drawString(48, 54, 'Key idea:')
c.setFillColor(INK); c.setFont('Helvetica', 9)
c.drawString(100, 54, 'no tool output lives alone — every artefact is merged by the pipeline into one tested, single-command product (npm start · npm run build).')
footer(3); c.showPage()

# ---------------- PAGE 4 · ARCHITECTURE ----------------
y = head_bar('3 · SYSTEM ARCHITECTURE', 'One shared business core — the UI renders it, the API serves it, nothing drifts')
# browser layer
rt(36, y - 118, 888, 116, LIGHT, LINE, 6)
tx(48, y - 12, 'BROWSER — frontend/ (vanilla JS SPA, zero frameworks)', 9.5, NAVY, True)
bxs = [('Views 07–12', 'login · dashboard · GIS map · projects · acquisition · compensation'),
       ('GIS engine (05)', 'route splines · parcel corridors · aggregates'),
       ('State (06)', 'single S object · render loop · sessionStorage')]
bx = 48
for t, d in bxs:
    rt(bx, y - 106, 282, 62, WHITE, LINE, 5)
    tx(bx + 12, y - 30, t, 9.4, GREEN_D, True)
    wtx(bx + 12, y - 46, d, 8.4, INK, False, 258)
    bx += 294
c.setFillColor(GREEN); c.setFont('Helvetica-Bold', 12)
c.drawString(W / 2 - 5, y - 132, '▼')
tx(W / 2 + 14, y - 134, 'fetch /api/* · JSON', 8.5, MUT)
# api layer
rt(36, y - 238, 888, 88, HexColor('#eaf3ee'), GREEN, 6)
tx(48, y - 136, 'SERVER — backend/ (Node std-lib, zero npm deps)', 9.5, NAVY, True)
bxs = [('routes/', '11 endpoints: kpi · districts · projects · alignment · alerts · verify · pay')]
bx = 48
for t, d in [('controllers/', 'request handling & validation'), ('services/domain.js', 'loads the SAME js modules in a VM — shared logic')]:
    rt(bx, y - 226, 438, 62, WHITE, LINE, 5)
    tx(bx + 12, y - 152, t, 9.4, GREEN_D, True)
    wtx(bx + 12, y - 168, d, 8.4, INK, False, 410)
    bx += 450
c.setFillColor(GREEN); c.setFont('Helvetica-Bold', 12)
c.drawString(W / 2 - 5, y - 252, '▼')
# data layer
rt(36, y - 344, 888, 80, DARK, None, 6)
tx(48, y - 260, 'DATA — today & production', 9.5, GOLD, True)
wtx(48, y - 280, 'Prototype: 04-data.js in-memory store (14 projects · 5 alerts · deterministic parcels) + data/telangana.geojson.', 9.3, WHITE, False, 860)
wtx(48, y - 298, 'Production: PostgreSQL + PostGIS (models/schema.sql) integrating Dharani · Bhuvan · CFMS · e-Gazette.', 9.3, HexColor('#bcd9c9'), False, 860)
y = y - 344 - 16
y = bullets(36, y, [
    ('Why this wins', 'the domain logic is written once (plain JS modules) and loaded by BOTH the browser and the Node API via a VM context — the exact guarantee juries ask about ("how do UI and API stay in sync?").'),
    ('Offline-first', 'npm start serves everything on :8080; dist/index.html alone works from a pendrive with no server at all.'),
], 10, 888)
footer(4); c.showPage()

# ---------------- PAGE 5 · PROJECT STRUCTURE ----------------
y = head_bar('4 · PROJECT STRUCTURE (AS BUILT)', 'tree output of the final repository — every file has one job')
tree = """nlams/
|-- package.json                npm start | test | build | map | deck
|-- README.md                   run guide | API table | architecture notes
|-- frontend/
|   |-- index.html              SPA entry (loads the src tree)
|   +-- src/
|       |-- css/styles.css      theme | components | GIS overlays
|       |-- assets/             emblem.png - bg.jpg
|       +-- js/
|           |-- 01-config.js    stages - colours (RFCTLARR model)
|           |-- 02-utils.js     helpers - icons - toasts - modals
|           |-- 03-map-data.js  Telangana geometry (GENERATED)
|           |-- 04-data.js      demo dataset (14 projects - alerts)
|           |-- 05-engine.js    GIS ENGINE: routes - corridors - KPIs
|           |-- 06-state.js     app state - session persistence
|           |-- 07..08-views    login - shell
|           |-- 09..12-views    dashboard - GIS - projects - modules
|           +-- 13-app.js       render loop - events - boot
|-- backend/
|   +-- src/  server.js - routes/ - controllers/ - services/domain.js
|             models/schema.sql (production PostGIS schema)
|-- data/telangana.geojson      raw Survey-of-India boundaries
|-- scripts/                    build_map.py - build.py - smoke.js - decks
|-- dist/index.html             single-file offline build (484 KB)
+-- docs/                       SIH submission PDF/PPTX - pitch deck - report"""
c.saveState(); c.setFillColor(LIGHT); c.roundRect(36, 46, 888, y - 54, 6, fill=1, stroke=0); c.restoreState()
yy = y - 14
for ln in tree.split('\n'):
    comment = ''
    if '   #' in ln or ('  ' in ln and ('←' in ln or '.py ' in ln or '.sql' in ln or '.js ' in ln or '.html' in ln or '.geojson' in ln)):
        pass
    code_part = ln
    if '←' in ln:
        i = ln.index('←'); code_part, comment = ln[:i].rstrip(), '←' + ln[i+1:]
    c.saveState()
    c.setFont('Courier', 8.6); c.setFillColor(DARK)
    c.drawString(50, yy, code_part)
    if comment:
        c.setFont('Helvetica', 7.8); c.setFillColor(MUT)
        c.drawString(50 + c.stringWidth(code_part, 'Courier', 8.6) + 8, yy, comment)
    c.restoreState()
    yy -= 12.4
footer(5); c.showPage()

# ---------------- PAGE 6 · MODULES & FEATURES ----------------
y = head_bar('5 · WHAT WAS BUILT — MODULES & FEATURES', 'every screen is functional and stateful; actions propagate live across pages')
feats = [
    ('LOGIN & ROLES', 'Emblem-branded light portal on photo background; 4 government roles + demo access; session persists across refresh.'),
    ('STATE DASHBOARD', '6 KPI cards, live Telangana status map (click district → GIS), district progress bars, sector chart, alert feed.'),
    ('GIS LAND MAP ⭐', 'All 33 real district boundaries · 3 colour modes · zoom/pan · district drill-down · project ALIGNMENT view: route spline, green = acquired, parcels coloured by workflow stage, stage-click filtering.'),
    ('ACQUISITION WORKFLOW', 'Proposal form → Scrutiny review (approve/reject) → Sec-11 notification publishing → parcel-by-parcel GPS verification → RFCTLARR award calculator (multiplier + 12% + solatium) → possession notices.'),
    ('COMPENSATION', 'CFMS-DBT ledger per family; one-click release updates state totals; 90-day SLA warnings.'),
    ('PROJECT DETAILS', 'Single source of truth per project: overview, corridor parcel map, stage timeline, payments, alerts — 5 tabs.'),
    ('ALERTS & RISK', 'Risk-scored alerts (0–100) with recommended actions; dashboard cross-links into each case.'),
]
for t, d in feats:
    rt(36, y - 58, 888, 52, WHITE, LINE, 4)
    tx(50, y - 18, t, 10.2, GREEN_D, True)
    wtx(50, y - 36, d, 9.3, INK, False, 860)
    y -= 60
footer(6); c.showPage()

# ---------------- PAGE 7 · SCREENSHOTS ----------------
y = head_bar('6 · THE RESULT — SCREENSHOTS FROM THE BUILD', 'not mockups: rendered by the actual merged application')
rt(36, y - 200, 430, 198, LIGHT, LINE, 4); fit_img('docs/assets/rrr_align.png', 40, y - 196, 422, 190)
tx(36, y - 214, 'Route-alignment GIS — Regional Ring Road corridor with parcels in workflow colours', 8.2, MUT, True)
rt(494, y - 200, 430, 198, LIGHT, LINE, 4); fit_img('docs/assets/state_map.png', 498, y - 196, 422, 190)
tx(494, y - 214, 'Dashboard map — live status of all 33 districts', 8.2, MUT, True)
rt(36, y - 408, 430, 178, LIGHT, LINE, 4); fit_img('docs/assets/orr_ring.png', 40, y - 404, 422, 170)
tx(36, y - 422, 'Warangal ORR — closed-ring alignment, acquisition visible around the ring', 8.2, MUT, True)
rt(494, y - 408, 430, 178, SOFT, GREEN, 5)
tx(506, y - 232, 'Verified by automation', 10, GREEN_D, True)
yy = y - 252
for t in ['smoke.js → renders 14 projects × 5 tabs + 6 workflow pages + GIS views → SMOKE PASS',
          'API → 11 endpoints tested via cURL/Postman (health · kpi · districts · search · alignment · writes)',
          'Map engine → geometry asserted inside viewBox; parcels deterministic (same seed = same map)',
          'Session → refresh keeps user on the same page (storage-safe fallback)']:
    c.setFillColor(GREEN); c.setFont('Helvetica-Bold', 9)
    c.drawString(506, yy, '✓')
    wtx(520, yy, t, 8.8, INK, False, 392)
    yy -= len(wrap(t, 8.8, 392)) * 11 + 7
footer(7); c.showPage()

# ---------------- PAGE 8 · FUTURE & REFERENCES ----------------
y = head_bar('7 · FUTURE SCOPE & REFERENCES', 'prototype → production path is fully mapped')
fut = [
    ('Phase 1 — field pilot', 'Telugu UI · mobile app with offline GPS parcel capture for field officers'),
    ('Phase 2 — integrations', 'Dharani land records · CFMS payment rails · e-Gazette publishing · Bhuvan cadastral layers'),
    ('Phase 3 — intelligence', 'ML risk scoring from delay patterns · SMS/WhatsApp status to affected families'),
    ('Phase 4 — national grid', 'state-agnostic engine (boundaries as config) → DoLR multi-state deployment'),
]
yy = y - 6
for t, d in fut:
    rt(36, yy - 48, 440, 44, LIGHT, LINE, 4)
    tx(48, yy - 16, t, 9.6, NAVY, True)
    wtx(48, yy - 32, d, 8.7, INK, False, 414)
    yy -= 52
rt(488, yy - 206, 436, 200, WHITE, LINE, 5)
tx(500, y - 16, 'References', 10.5, NAVY, True)
refs = ['RFCTLARR Act 2013 — dolr.gov.in · indiacode.nic.in',
        'DILRMP — dolr.gov.in/programmes/dilrmp',
        'Dharani — dharani.telangana.gov.in',
        'CFMS — cfms.telangana.gov.in',
        'Bhuvan (ISRO) — bhuvan.nrsc.gov.in',
        'PM Gati Shakti — gatishakti.gov.in',
        'SIH 2026 PS 26016 (official statement)']
ry = y - 38
for r in refs:
    c.setFillColor(GREEN); c.setFont('Helvetica-Bold', 9)
    c.drawString(500, ry, '•')
    wtx(512, ry, r, 8.8, INK, False, 400)
    ry -= 14
rt(36, 44, 888, 34, SOFT, GREEN, 4)
c.setFillColor(GREEN_D); c.setFont('Helvetica-Bold', 9)
c.drawString(48, 57, 'Closing note:')
wtx(122, 57, 'every tool in section 1 left an artefact; every artefact is merged by the pipeline in section 2; the result is a working product a jury can click through in under 3 minutes — or run offline from a single file.', 8.8, INK, False, 792)
footer(8); c.showPage()
c.save()
print('PDF written:', round(os.path.getsize(os.path.join(DOCS, 'NLAMS_Project_Report.pdf')) / 1024), 'KB')

# =============================== DOCX ===============================
import docx
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH

G = RGBColor(0x0e, 0x8a, 0x5f); N = RGBColor(0x17, 0x2a, 0x4c); I = RGBColor(0x1e, 0x29, 0x3b)
doc = docx.Document()
st = doc.styles['Normal']; st.font.name = 'Calibri'; st.font.size = Pt(10.5)

def h(t, lvl=1, col=None):
    p = doc.add_heading(t, lvl)
    for r in p.runs: r.font.color.rgb = col or (G if lvl <= 2 else N)
    return p

def para(t, bold=False, size=10.5, col=I):
    p = doc.add_paragraph(); r = p.add_run(t); r.bold = bold; r.font.size = Pt(size); r.font.color.rgb = col
    return p

def bullet(t, head=None):
    p = doc.add_paragraph(style='List Bullet')
    if head:
        r = p.add_run(head + ' — '); r.bold = True
    p.add_run(t)
    return p

# cover
t = doc.add_heading('NATIONAL LAND ACQUISITION & MANAGEMENT SYSTEM (NLAMS) · TELANGANA', 0)
for r in t.runs: r.font.color.rgb = N
para('Project Development Report — how multiple tools were merged into one complete product', True, 13, G)
para('SIH 2026 · Problem Statement 26016 · Ministry of Rural Development, Dept. of Land Resources (DoLR) · Theme: Smart Automation', False, 10)
para('Team: <Team Name> · Team ID <xxxx> · <College / Institute Name>', False, 10)
para('')
h('In one line', 2)
para('NLAMS watches every land-acquisition project in Telangana on one live map — every parcel coloured by its legal stage (Notified → Verified → Awarded → Possession → Compensated), every rupee of compensation tracked, every risk flagged early.')

h('1 · Tools & Technologies Used', 1)
tools = [
    ('Design & planning', [('Figma', 'UI wireframes → css/styles.css theme'), ('Notion/Docs', 'RFCTLARR Act study → js/01-config.js workflow model')]),
    ('GIS data & processing', [('QGIS + GeoJSON', '33 district boundaries → data/telangana.geojson'), ('Python 3', 'projection & simplification → js/03-map-data.js (generated)')]),
    ('Frontend', [('HTML5 + CSS3', 'layout & light government theme'), ('JavaScript (ES6)', '13 modules: state machine · GIS engine · views'), ('SVG engine', 'live vector maps: route splines · parcel corridors · zoom/pan')]),
    ('Backend', [('Node.js (std-lib)', 'REST API — zero npm dependencies'), ('PostgreSQL + PostGIS', 'production schema — models/schema.sql')]),
    ('Quality & delivery', [('Git + GitHub', 'version control & collaboration'), ('Postman / cURL', 'all 11 API endpoints tested'), ('Chrome DevTools', 'layout & console debugging'), ('smoke.js', 'automated regression — every page/tab rendered')]),
]
for gname, items in tools:
    h(gname, 2)
    for a, b in items: bullet(b, a)

h('2 · How the tools merged into one project', 1)
para('INPUT (Figma designs · QGIS/GeoJSON data · VS Code source) → TRANSFORM (Python map pipeline · shared domain core · git) → BUILD & MERGE (scripts/build.py bundles SPA · node serves SPA+API on one port · smoke.js verifies) → COMPLETE PROJECT (frontend/ + backend/ + dist/index.html + docs/).', False, 10.5)
para('No tool output lives alone: every artefact is merged by the pipeline into one tested product that starts with a single command (npm start) or runs offline from a single file.')

h('3 · System architecture', 1)
bullet('frontend/ (browser): 13 vanilla-JS modules — views, GIS engine, single state object + render loop.', 'Browser layer')
bullet('backend/ (Node std-lib): routes/ · controllers/ · services/domain.js which loads the SAME domain modules in a VM context — UI and API cannot drift.', 'Server layer')
bullet('today: in-memory dataset + telangana.geojson · production: PostgreSQL+PostGIS integrating Dharani, Bhuvan, CFMS, e-Gazette.', 'Data layer')

h('4 · Project structure', 1)
tree = ('nlams/\n├── package.json\n├── frontend/  (index.html · src/css · src/js/01–13 · src/assets)\n'
        '├── backend/   (src/server.js · routes/ · controllers/ · services/domain.js · models/schema.sql)\n'
        '├── data/telangana.geojson\n├── scripts/   (build_map.py · build.py · smoke.js · deck builders)\n'
        '├── dist/index.html   ← single-file offline build\n└── docs/      ← SIH submission · pitch deck · this report')
p = doc.add_paragraph(); r = p.add_run(tree); r.font.name = 'Consolas'; r.font.size = Pt(9)

h('5 · Modules & features built', 1)
for a, b in [('Login & roles', 'emblem-branded portal, 4 roles, persistent session'),
             ('Dashboard', 'KPIs · live 33-district status map · district bars · alerts'),
             ('GIS Land Map', 'alignment view: route spline, parcels in workflow colours, stage-click filtering, zoom/pan'),
             ('Acquisition', 'proposal → scrutiny → Sec-11 notification → GPS verification → award calculator → possession'),
             ('Compensation', 'CFMS-DBT ledger, one-click release, 90-day SLA warnings'),
             ('Project details', '5-tab single source of truth per project'),
             ('Alerts & risk', 'score 0–100 with recommended actions')]:
    bullet(b, a)

h('6 · Testing & verification', 1)
for t_ in ['scripts/smoke.js renders 14 projects × 5 tabs + 6 workflow pages + GIS views → SMOKE PASS',
           'all 11 REST endpoints verified via cURL/Postman (including verify/pay writes)',
           'map geometry asserted inside viewBox; parcels deterministic (same seed = same map)',
           'session persistence verified across refresh']:
    bullet(t_)

h('7 · Future scope', 1)
for a, b in [('Phase 1', 'Telugu UI · field-officer mobile app with offline GPS capture'),
             ('Phase 2', 'Dharani · CFMS · e-Gazette · Bhuvan integrations'),
             ('Phase 3', 'ML risk scoring · SMS/WhatsApp family updates'),
             ('Phase 4', 'state-agnostic national grid for DoLR')]:
    bullet(b, a)

h('8 · References', 1)
for r_ in ['RFCTLARR Act 2013 — dolr.gov.in · indiacode.nic.in', 'DILRMP — dolr.gov.in/programmes/dilrmp',
           'Dharani — dharani.telangana.gov.in', 'CFMS — cfms.telangana.gov.in',
           'Bhuvan — bhuvan.nrsc.gov.in', 'PM Gati Shakti — gatishakti.gov.in', 'SIH 2026 PS 26016 (official)']:
    bullet(r_)

doc.save(os.path.join(DOCS, 'NLAMS_Project_Report.docx'))
print('DOCX written:', round(os.path.getsize(os.path.join(DOCS, 'NLAMS_Project_Report.docx')) / 1024), 'KB')
