#!/usr/bin/env python3
"""SIH 2026 Idea Submission — PDF version (portal upload), mirrors the PPTX layout."""
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
import os

W, H = 960, 540  # 13.333 x 7.5 in @ 72dpi
GREEN, GREEN_D = HexColor('#0e8a5f'), HexColor('#0b5a3e')
DARK, INK, MUT = HexColor('#0f2e22'), HexColor('#1e293b'), HexColor('#64748b')
LIGHT, LINE, WHITE = HexColor('#f3f6f4'), HexColor('#dee8e2'), HexColor('#ffffff')
SAFF, GOLD, NAVY = HexColor('#f97316'), HexColor('#facc15'), HexColor('#172a4c')
AMBER, SOFT = HexColor('#b45309'), HexColor('#e7f6ee')

import os; c = canvas.Canvas(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..','docs','SIH26016_Idea_Submission.pdf'), pagesize=(W, H))

def rt(x, y, w, h, col=None, stroke=None, r=6):
    c.saveState()
    if col is not None: c.setFillColor(col)
    if stroke is not None: c.setStrokeColor(stroke); c.setLineWidth(0.8)
    c.roundRect(x, y, w, h, r, fill=1 if col is not None else 0, stroke=1 if stroke is not None else 0)
    c.restoreState()

def tx(x, y, s, size=11, col=INK, bold=False, align='l', leading=None, font='Helvetica'):
    c.saveState()
    f = font + ('-Bold' if bold else '')
    c.setFont(f, size); c.setFillColor(col)
    lead = leading or size * 1.18
    for i, line in enumerate(s.split('\n')):
        wd = c.stringWidth(line, f, size)
        xx = x - wd / 2 if align == 'c' else (x - wd if align == 'r' else x)
        c.drawString(xx, y - i * lead, line)
    c.restoreState()

def wrap(s, size, width, bold=False, font='Helvetica'):
    f = font + ('-Bold' if bold else '')
    words, lines, cur = s.split(), [], ''
    for w_ in words:
        t = (cur + ' ' + w_).strip()
        if c.stringWidth(t, f, size) <= width: cur = t
        else: lines.append(cur); cur = w_
    if cur: lines.append(cur)
    return lines

def wtx(x, y, s, size=10, col=INK, bold=False, width=200, leading=None):
    c.saveState(); f = 'Helvetica-Bold' if bold else 'Helvetica'
    c.setFont(f, size); c.setFillColor(col)
    lead = leading or size * 1.22
    for i, ln in enumerate(wrap(s, size, width, bold)): c.drawString(x, y - i * lead, ln)
    c.restoreState()

def bullets(x, y, items, size=9.6, width=250, gap=4.5, col=INK, head_col=GREEN_D):
    for h, b in items:
        c.saveState(); c.setFillColor(GREEN); c.setFont('Helvetica-Bold', size)
        c.drawString(x, y, '▪'); c.restoreState()
        wtx(x + 12, y, h + ' — ' + b, size, col, False, width)
        lines = len(wrap(h + ' — ' + b, size, width))
        y -= (lines * size * 1.22 + gap)
    return y

def head_bar(t):
    c.setFillColor(GREEN); c.rect(0, H - 10, W, 10, fill=1, stroke=0)
    tx(36, H - 52, t, 22, NAVY, True)

def footer(n, team='<Your Team Name>'):
    c.setStrokeColor(LINE); c.setLineWidth(0.9); c.line(36, 36, W - 36, 36)
    tx(36, 24, team, 8, MUT, True)
    tx(W - 36, 24, f'{n} @ SIH Idea submission- Template', 8, MUT, align='r')

def fit_img(path, x, y, w, h):
    img = ImageReader(path); iw, ih = img.getSize()
    ar = iw / ih
    fw, fh = (w, w / ar) if w / h < ar else (h * ar, h)
    c.drawImage(img, x + (w - fw) / 2, y + (h - fh) / 2, fw, fh)

# ---------------- SLIDE 1 ----------------
c.setFillColor(NAVY); c.rect(0, H - 168, W, 168, fill=1, stroke=0)
c.setFillColor(GOLD); c.rect(0, H - 172, W, 4.4, fill=1, stroke=0)
c.setFillColor(SAFF); c.rect(0, H - 176.4, W, 4.4, fill=1, stroke=0)
c.setFillColor(HexColor('#16a34a')); c.rect(0, H - 180.8, W, 4.4, fill=1, stroke=0)
fit_img('frontend/src/assets/emblem_flat.png', 40, H - 140, 88, 88)
tx(145, H - 78, 'SMART INDIA HACKATHON 2026', 26, WHITE, True)
tx(145, H - 104, 'Idea Submission — Problem Statement Details', 13, HexColor('#aac3e1'))
tx(W - 48, H - 78, 'PS ID', 11, GOLD, True, align='r')
tx(W - 48, H - 118, '26016', 40, WHITE, True, align='r')

rows = [
    ('Problem Statement ID', '26016', 30),
    ('Problem Statement Title', 'Real-Time National Land Acquisition & Management System for End-to-End Digital Monitoring and Decision Support', 46),
    ('Theme', 'Smart Automation', 30),
    ('PS Category', 'Software', 30),
    ('Team ID', '<Team ID — as registered on SIH portal>', 30),
    ('Team Name', '<Team Name — as registered on SIH portal>', 30),
    ('Organization / Department', 'Ministry of Rural Development · Dept. of Land Resources (DoLR)', 30),
]
y = H - 196
for label, val, hh in rows:
    rt(40, y - hh, 236, hh, LIGHT, LINE, 3)
    tx(52, y - hh / 2 - 4, label, 9.5, NAVY, True)
    rt(276, y - hh, 644, hh, WHITE, LINE, 3)
    if hh > 40:
        wtx(288, y - 16, val, 10, NAVY if hh > 40 else DARK, True, 620)
    else:
        tx(288, y - hh / 2 - 4, val, 10.5, DARK, val.startswith('<') is False)
    y -= hh + 6
tx(40, y - 16, 'Proposed by:  <Team Name> · <College / Institute Name>', 9.5, MUT)
tx(W - 40, y - 16, 'Do not forget to replace <placeholders> before export!', 9, AMBER, True, align='r')
footer(1)
c.showPage()

# ---------------- SLIDE 2 ----------------
head_bar('IDEA TITLE')
tx(36, H - 70, '❖ Proposed Solution (Describe your Idea/Solution/Prototype)', 12.5, GREEN_D, True)
tx(36, H - 90, 'NLAMS — a GIS-powered digital twin of the complete land acquisition lifecycle (Telangana prototype, national-ready)', 11.5, NAVY, True)
cols = [
    ('Detailed explanation of the proposed solution', [
        ('Web platform', 'digitises the complete lifecycle — Proposal → Scrutiny → Notification → Verification → Award → Possession → Compensation, as per RFCTLARR Act, 2013.'),
        ('GIS core', 'real boundaries of all 33 Telangana districts as vector maps; each project drawn as a route alignment with its land parcels on it.'),
        ('Stage-native parcels', 'every parcel carries its live legal stage (Notified / Verified / Awarded / Possession / Compensated / Disputed), colour-coded on map.'),
        ('Role-based access', 'Central / State / District / Field views; every action audited.'),
        ('Compensation ledger', 'DBT-style per-family tracking with SLA clocks & one-click release.'),
        ('Alerts & risk engine', 'projects scored 0–100; breaches raise alerts with recommended actions.')]),
    ('How it addresses the problem', [
        ('Single source of truth', 'projects, parcels, families & payments in one system — no silos across Revenue, R&B, I&CAD, TSIIC.'),
        ('Real-time monitoring', 'stage-wise progress live on dashboards & map — delays surface in hours, not months.'),
        ('Spatial intelligence', 'map shows exactly where acquisition is stuck (village / survey no.) — impossible in registers & PDFs.'),
        ('Faster compensation', 'per-family SLA alerts stop cases crossing 90+ days.'),
        ('Transparency for families', 'their parcel status & payment date on demand — trust, fewer protests.')]),
    ('Innovation and uniqueness', [
        ('Alignment-corridor GIS', 'parcels strung along the actual route (RRR arc, Warangal ORR ring) in workflow colours — not dots on a map.'),
        ('Legal-workflow-native', 'Sec 4/11/26/30/38 of the 2013 Act map 1:1 to screens & actions — an officer file becomes a workflow.'),
        ('Zero-infrastructure deploy', 'runs offline as a single file in any browser — works in low-connectivity offices; no licence cost.'),
        ('Stage-click filtering', 'click a pipeline stage on the map → only parcels at that stage highlight.'),
        ('State-agnostic engine', 'swap boundaries & records → same system for any state; scales to a national grid for DoLR.')]),
]
cw, gap = 292, 10
for i, (h, items) in enumerate(cols):
    x = 36 + (cw + gap) * i
    rt(x, 56, cw, H - 178, LIGHT if i != 2 else WHITE, LINE, 6)
    c.setFillColor(GREEN_D if i != 2 else DARK)
    c.roundRect(x, H - 172, cw, 26, 6, fill=1, stroke=0)
    c.rect(x, H - 172, cw, 13, fill=1, stroke=0)
    tx(x + 12, H - 154, h, 9.8, WHITE, True)
    bullets(x + 12, H - 188, items, 8.7, cw - 24)
footer(2)
c.showPage()

# ---------------- SLIDE 3 ----------------
head_bar('TECHNICAL APPROACH')
tx(36, H - 72, 'Technologies used', 13, GREEN_D, True)
rt(36, H - 262, 440, 178, LIGHT, LINE, 6)
tech = [
    ('Prototype (working today)', 'HTML5 · CSS3 · Vanilla JS · in-house SVG GIS engine · Python GeoJSON→SVG pipeline. Zero dependencies, offline-capable.'),
    ('Production stack (planned)', 'React + TypeScript · Node.js/NestJS APIs · PostgreSQL + PostGIS · Redis · object storage for documents.'),
    ('Government integrations', 'Dharani (land records) · Bhuvan/NIC GIS layers · CFMS (DBT payments) · e-Gazette via secure API gateway.'),
    ('Smart automation', 'rule-engine SLA alerts · payment anomaly checks · AI risk-scoring roadmap (delay-pattern ML).'),
]
bullets(48, H - 100, tech, 9.2, 415)
tx(36, H - 288, 'Methodology — implementation flow', 13, GREEN_D, True)
steps = ['Ingest boundaries\n& records', 'Digitise lifecycle\n(RFCTLARR stages)', 'Map parcels to\nroute corridors', 'Monitor · Alert\n· Action', 'DBT compensation\n& audit trail']
sx, sy, sw, sh = 36, H - 358, 78, 62
for i, st in enumerate(steps):
    rt(sx, sy, sw, sh, DARK if i in (0, 4) else GREEN_D, None, 5)
    tx(sx + sw / 2, sy + sh / 2 + 8, st, 7.6, WHITE, True, align='c')
    if i < 4:
        tx(sx + sw + 2, sy + sh / 2 - 3, '→', 11, GREEN, True, align='c')
    sx += sw + 18
bl = bullets(36, H - 384, [
    ('Process', 'requirements from the Act → data model → GIS engine → workflow module → integration APIs → one-district pilot → state rollout.'),
    ('Prototype status', 'fully interactive end-to-end system already built — approve, verify, publish & pay all work live in the demo.')], 9.2, 430)
# right images
tx(496, H - 72, 'Working prototype — screenshots', 13, GREEN_D, True)
rt(496, H - 262, 428, 176, LIGHT, LINE, 4)
fit_img('docs/assets/rrr_align.png', 500, H - 258, 420, 168)
tx(496, H - 276, 'Route-alignment GIS: RRR Northern Arc — corridor parcels in workflow colours, green = land acquired', 7.4, MUT, False)
rt(496, H - 466, 428, 176, LIGHT, LINE, 4)
fit_img('docs/assets/state_map_wide.png', 500, H - 462, 420, 168)
tx(496, H - 480, 'State dashboard map: live district status across all 33 districts of Telangana', 7.4, MUT, False)
footer(3)
c.showPage()

# ---------------- SLIDE 4 ----------------
head_bar('FEASIBILITY AND VIABILITY')
tx(36, H - 72, 'Analysis of the feasibility of the idea', 13, GREEN_D, True)
feas = [
    ('Already built', 'working end-to-end prototype — not a concept'),
    ('Legal alignment', 'digitises the existing RFCTLARR 2013 process — no policy change needed'),
    ('Open data ready', 'boundaries & geoportals are public; records APIs are govt-owned'),
    ('Zero-cost pilot', 'single-file tech runs in any district office browser'),
    ('DILRMP synergy', 'complements the national land-records modernization programme'),
]
fx = 36
for h, b in feas:
    rt(fx, H - 190, 172, 106, SOFT, GREEN, 5)
    c.setFillColor(GREEN); c.setFont('Helvetica-Bold', 9)
    c.drawString(fx + 9, H - 106, '✓ ' + h)
    wtx(fx + 9, H - 122, b, 7.6, INK, False, 156)
    fx += 181
tx(36, H - 216, 'Potential challenges & risks — and strategies to overcome them', 13, GREEN_D, True)
risks = [
    ('Integration with Dharani / CFMS legacy systems', 'Standard REST/CSV fallback formats; phased read-only integration first; DoLR-led API gateway under Digital India framework'),
    ('Field data quality (GPS surveys, owner records)', 'Mobile app with offline capture, mandatory validation rules, cross-check with Dharani before stage promotion'),
    ('Adoption & change management for officers', 'Role-simple UI (3 clicks per action); training modules; state SOP notification; pilot district first'),
    ('Security & privacy of land & family data', 'RBAC (4 levels) · encryption in transit & at rest · complete audit trail · DPDP Act 2023 compliance by design'),
    ('National scale (36 States/UTs)', 'State-agnostic engine — boundaries, categories & rates are configuration, not code'),
]
rt(36, H - 252, 316, 24, AMBER, None, 3)
tx(48, H - 245, 'CHALLENGE / RISK', 9.5, WHITE, True)
rt(352, H - 252, 572, 24, GREEN_D, None, 3)
tx(364, H - 245, 'MITIGATION STRATEGY', 9.5, WHITE, True)
y = H - 252
for a, b in risks:
    y -= 52
    rt(36, y, 888, 52, WHITE if risks.index((a, b)) % 2 else LIGHT, LINE, 2)
    c.setFillColor(AMBER); c.setFont('Helvetica-Bold', 8.6)
    c.drawString(46, y + 30, '⚠')
    wtx(58, y + 30, a, 8.6, INK, True, 292)
    c.setFillColor(GREEN); c.setFont('Helvetica-Bold', 8.6)
    c.drawString(362, y + 30, '→')
    wtx(376, y + 30, b, 8.6, INK, False, 540)
footer(4)
c.showPage()

# ---------------- SLIDE 5 ----------------
head_bar('IMPACT AND BENEFITS')
tx(36, H - 72, 'Potential impact on the target audience', 13, GREEN_D, True)
aud = [
    ('Affected families', "See their parcel's exact stage & payment date — dignity, predictability, faster money in hand"),
    ('Field & district officers', '3-click actions, GPS-verified parcels, SLA clocks — files move without files'),
    ('State & Central Govt', 'Live corridor-level visibility; early alerts prevent escalations & litigation'),
    ('Citizens at large', 'Highways, irrigation & industry start on time — growth not stuck in land disputes'),
]
fx = 36
for h, b in aud:
    rt(fx, H - 196, 213, 112, LIGHT, LINE, 5)
    c.setFillColor(GREEN); c.rect(fx, H - 88, 213, 4, fill=1, stroke=0)
    tx(fx + 10, H - 106, h, 9.4, DARK, True)
    wtx(fx + 10, H - 124, b, 7.9, INK, False, 193)
    fx += 223
tx(36, H - 222, 'Benefits of the solution', 13, GREEN_D, True)
bens = [
    ('SOCIAL', GREEN_D, [
        'Transparency ends information asymmetry between State and families',
        'Fewer disputes & protests — less displacement distress',
        'Telugu UI + SMS/WhatsApp status (roadmap) for affected families',
        'Full audit trail = fair, defensible awards']),
    ('ECONOMIC', GREEN, [
        'Faster commissioning of highways, irrigation & industrial corridors',
        'Months saved on mega-projects avoid crores in cost escalation',
        'DBT-linked ledger plugs leakage; accurate budgeting from live data',
        'Lower litigation spend for the exchequer']),
    ('ENVIRONMENTAL / GOVERNANCE', DARK, [
        'Early forest & land-overlap screening (FCA) before alignment freeze',
        'Digitised records cut paper, travel & re-surveys',
        'Planning data avoids re-alignments that waste acquired land',
        'Reusable national asset for DoLR — one engine, every state']),
]
bx = 36
for h, colr, items in bens:
    rt(bx, 52, 288, 254, WHITE, LINE, 6)                 # box: bottom-origin 52..306
    c.setFillColor(colr); c.roundRect(bx, 280, 288, 26, 6, fill=1, stroke=0); c.rect(bx, 280, 288, 13, fill=1, stroke=0)
    tx(bx + 12, 288, h, 9.6, WHITE, True)
    yy = 262
    for it in items:
        c.setFillColor(GREEN); c.setFont('Helvetica-Bold', 8.8)
        c.drawString(bx + 12, yy, '▪')
        wtx(bx + 24, yy, it, 8.8, INK, False, 252)
        yy -= len(wrap(it, 8.8, 252)) * 10.7 + 6
    bx += 300
footer(5)
c.showPage()

# ---------------- SLIDE 6 ----------------
head_bar('RESEARCH  AND  REFERENCES')
tx(36, H - 72, 'Details / Links of the reference and research work', 13, GREEN_D, True)
refs = [
    ('RFCTLARR Act, 2013 — Right to Fair Compensation & Transparency in Land Acquisition, R&R', 'Dept. of Land Resources, MoRD — dolr.gov.in · indiacode.nic.in'),
    ('Digital India Land Records Modernization Programme (DILRMP)', 'dolr.gov.in/programmes/dilrmp'),
    ('Dharani — Telangana Integrated Land Records Management System', 'dharani.telangana.gov.in'),
    ('CFMS — Comprehensive Financial Management System, Telangana', 'cfms.telangana.gov.in'),
    ('Bhuvan — ISRO Geoportal & NIC GIS services', 'bhuvan.nrsc.gov.in'),
    ('Survey of India / open district boundary datasets (GeoJSON)', 'boundary geometry used in prototype — 33 districts of Telangana'),
    ('PM Gati Shakti National Master Plan', 'gatishakti.gov.in'),
    ('e-Gazette — Gazette of India / Telangana State Gazette', 'egazette.gov.in'),
    ('World Bank & NITI Aayog studies on acquisition-driven project delays', 'problem-validation research (background study)'),
    ('SIH Problem Statement 26016 (official)', 'MoRD · DoLR · Theme: Smart Automation · Category: Software'),
]
y = H - 96
for i, (t, d) in enumerate(refs):
    rt(36, y - 32, 888, 32, LIGHT if i % 2 else WHITE, LINE, 2)
    c.setFillColor(GREEN); c.roundRect(44, y - 26, 20, 20, 4, fill=1, stroke=0)
    c.setFillColor(WHITE); c.setFont('Helvetica-Bold', 9)
    c.drawCentredString(54, y - 20, str(i + 1))
    tt = t
    while c.stringWidth(tt, 'Helvetica-Bold', 8.2) > 320 and len(tt) > 10:
        tt = tt[:-2]
    if tt != t: tt = tt.rstrip() + '…'
    tx(74, y - 21, tt, 8.2, INK, True)
    tx(404, y - 21, d, 7.4, MUT)
    y -= 36
rt(36, 44, 888, 26, SOFT, None, 4)
c.setFillColor(GREEN_D); c.setFont('Helvetica-Bold', 8)
c.drawString(48, 53, 'Prototype dataset note:')
lw = c.stringWidth('Prototype dataset note:', 'Helvetica-Bold', 8)
c.setFillColor(INK); c.setFont('Helvetica', 8)
c.drawString(52 + lw, 53, 'boundaries from open Survey-of-India-derived GeoJSON; parcel/family records are realistic synthetic data — production links to Dharani / Bhuvan / CFMS.')
footer(6)
c.showPage()
c.save()
print('PDF saved:', round(os.path.getsize('SIH26016_Idea_Submission.pdf') / 1024), 'KB')
