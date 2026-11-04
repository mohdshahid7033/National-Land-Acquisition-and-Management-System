#!/usr/bin/env python3
"""SIH 2026 Idea Submission deck — PS 26016, official template structure (6 slides)."""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

GREEN, GREEN_D = RGBColor(14, 138, 95), RGBColor(11, 90, 62)
DARK, INK, MUT = RGBColor(15, 46, 34), RGBColor(30, 41, 59), RGBColor(100, 116, 139)
LIGHT, LINE, WHITE = RGBColor(243, 246, 244), RGBColor(222, 232, 226), RGBColor(255, 255, 255)
SAFF, GOLD = RGBColor(249, 115, 22), RGBColor(250, 204, 21)
RED, AMBER = RGBColor(185, 28, 28), RGBColor(180, 83, 9)
NAVY = RGBColor(23, 42, 76)
FONT = "Calibri"
SW, SH = Inches(13.333), Inches(7.5)

prs = Presentation(); prs.slide_width = SW; prs.slide_height = SH
BLANK = prs.slide_layouts[6]

def slide(): return prs.slides.add_slide(BLANK)

def rect(s, x, y, w, h, fill=None, line=None, line_w=0.75, round_=False):
    shp = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE if round_ else MSO_SHAPE.RECTANGLE, x, y, w, h)
    if round_:
        try: shp.adjustments[0] = 0.1
        except Exception: pass
    if fill is None: shp.fill.background()
    else: shp.fill.solid(); shp.fill.fore_color.rgb = fill
    if line is None: shp.line.fill.background()
    else: shp.line.color.rgb = line; shp.line.width = Pt(line_w)
    shp.shadow.inherit = False
    return shp

def text(s, x, y, w, h, runs, size=13, color=INK, bold=False, align=PP_ALIGN.LEFT,
         anchor=MSO_ANCHOR.TOP, leading=1.0, space_after=0):
    tb = s.shapes.add_textbox(x, y, w, h); tf = tb.text_frame
    tf.word_wrap = True; tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    if isinstance(runs, str): runs = [[(runs, {})]]
    for i, para in enumerate(runs):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align; p.line_spacing = leading; p.space_after = Pt(space_after)
        if isinstance(para, str): para = [(para, {})]
        for rt, ov in para:
            r = p.add_run(); r.text = rt; f = r.font
            f.name = ov.get('font', FONT); f.size = Pt(ov.get('size', size))
            f.bold = ov.get('bold', bold); f.italic = ov.get('italic', False)
            f.color.rgb = ov.get('color', color)
    return tb

def footer(s, n):
    rect(s, Inches(0.5), Inches(7.12), Inches(12.33), Pt(0.9), fill=LINE)
    text(s, Inches(0.5), Inches(7.18), Inches(6), Inches(0.25),
         [[("<Your Team Name>", {'size': 9, 'color': MUT, 'bold': True})]])
    text(s, Inches(7), Inches(7.18), Inches(5.83), Inches(0.25),
         [[(f"{n} @ SIH Idea submission- Template", {'size': 9, 'color': MUT})]], align=PP_ALIGN.RIGHT)

def head(s, title, accent=GREEN):
    rect(s, 0, 0, SW, Inches(0.14), fill=accent)
    text(s, Inches(0.5), Inches(0.3), Inches(12.3), Inches(0.6),
         [[(title, {'size': 25, 'bold': True, 'color': NAVY})]])

def bullets(items, size=12.5, gap=6, lead=1.1):
    out = []
    for it in items:
        if isinstance(it, tuple):
            out.append([("▪  ", {'size': size, 'bold': True, 'color': GREEN}),
                        (it[0] + " — ", {'size': size, 'bold': True, 'color': DARK}),
                        (it[1], {'size': size, 'color': INK})])
        else:
            out.append([("▪  ", {'size': size, 'bold': True, 'color': GREEN}),
                        (it, {'size': size, 'color': INK})])
    return out

# ================= SLIDE 1 — TITLE PAGE =================
s = slide()
rect(s, 0, 0, SW, Inches(2.35), fill=NAVY)
s.shapes.add_picture('frontend/src/assets/emblem.png', Inches(0.55), Inches(0.42), height=Inches(1.3))
text(s, Inches(1.75), Inches(0.52), Inches(9.5), Inches(1.2),
     [[("SMART INDIA HACKATHON 2026", {'size': 30, 'bold': True, 'color': WHITE})],
      [("Idea Submission — Problem Statement Details", {'size': 14, 'color': RGBColor(170, 195, 225)})]], space_after=6)
text(s, Inches(10.3), Inches(0.62), Inches(2.6), Inches(1.1),
     [[("PS ID", {'size': 11, 'bold': True, 'color': GOLD})],
      [("26016", {'size': 40, 'bold': True, 'color': WHITE})]], align=PP_ALIGN.RIGHT)
trisection = [SAFF, RGBColor(255, 255, 255), GREEN]
for i, c in enumerate(trisection):
    rect(s, 0, Inches(2.35) + Emu(int(Inches(0.06) / 3) * i), SW, Emu(int(Inches(0.06) / 3) + 1), fill=c)
rows = [
    ("Problem Statement ID", "26016"),
    ("Problem Statement Title", "Real-Time National Land Acquisition & Management System for End-to-End Digital Monitoring and Decision Support"),
    ("Theme", "Smart Automation"),
    ("PS Category", "Software"),
    ("Team ID", "<Team ID — as registered on SIH portal>"),
    ("Team Name", "<Team Name — as registered on SIH portal>"),
    ("Organization / Department", "Ministry of Rural Development · Dept. of Land Resources (DoLR)"),
]
ry = Inches(2.72)
for label, val in rows:
    big = label == "Problem Statement Title"
    rect(s, Inches(0.55), ry, Inches(3.3), Inches(0.56 if not big else Inches(0.86)), fill=LIGHT, line=LINE, line_w=0.75)
    text(s, Inches(0.75), ry + (Inches(0.15) if not big else Inches(0.28)), Inches(3.0), Inches(0.5),
         [[(label, {'size': 11.5, 'bold': True, 'color': NAVY})]])
    rect(s, Inches(3.85), ry, Inches(8.93), Inches(0.56 if not big else Inches(0.86)), fill=WHITE, line=LINE, line_w=0.75)
    text(s, Inches(4.05), ry + (Inches(0.15) if not big else Inches(0.13)), Inches(8.6), Inches(0.75),
         [[(val, {'size': 12.5 if not big else 13.5, 'bold': big, 'color': DARK if not big else NAVY})]],
         anchor=MSO_ANCHOR.TOP if big else MSO_ANCHOR.MIDDLE, leading=1.05)
    ry += Inches(0.56) if not big else Inches(0.86)
text(s, Inches(0.55), ry + Inches(0.12), Inches(12.2), Inches(0.3),
     [[("Proposed by: ", {'size': 11, 'color': MUT}),
       ("<Team Name> · <College / Institute Name>", {'size': 11, 'bold': True, 'color': GREEN_D})]])
footer(s, 1)
s.notes_slide.notes_text_frame.text = "Fill Team ID, Team Name, College. Keep PS title wording exactly as on the portal."

# ================= SLIDE 2 — IDEA / PROPOSED SOLUTION =================
s = slide()
head(s, "IDEA TITLE — NLAMS: A GIS-Powered Digital Twin of the Land Acquisition Lifecycle")
text(s, Inches(0.5), Inches(0.92), Inches(12.3), Inches(0.35),
     [[("Proposed Solution (Describe your Idea/Solution/Prototype)", {'size': 14.5, 'bold': True, 'color': GREEN_D})]])
cw = Inches(4.0); gap = Inches(0.16); top = Inches(1.42); chh = Inches(5.3)
cols = [
    ("Detailed explanation of the proposed solution", [
        ("Web platform", "digitises the complete acquisition lifecycle — Proposal → Scrutiny → Notification → Verification → Award → Possession → Compensation, exactly as per the RFCTLARR Act, 2013."),
        ("GIS core", "real boundaries of all 33 Telangana districts rendered as vector maps; every project's land corridor drawn as a route alignment with individual land parcels on it."),
        ("Stage-native parcels", "each parcel carries its live legal stage (Notified / Verified / Awarded / Possession / Compensated / Disputed) — colour-coded on the map."),
        ("Role-based access", "separate views & powers for Central / State / District / Field officers; every action audited."),
        ("Compensation ledger", "DBT-style payment tracking per affected family with SLA clocks and one-click release."),
        ("Alerts & risk engine", "projects scored 0–100; breaches raise alerts with recommended actions."),
    ]),
    ("How it addresses the problem", [
        ("Single source of truth", "projects, parcels, families & payments in one database — no more silos across Revenue, R&B, I&CAD, TSIIC."),
        ("Real-time monitoring", "officials see stage-wise progress live on dashboards & map — delays surface in hours, not months."),
        ("Spatial intelligence", "maps show exactly where acquisition is stuck (village / survey no.) — impossible in registers & PDFs."),
        ("Faster compensation", "verification → award → payment chain tracked per family; SLA alerts stop cases crossing 90+ days."),
        ("Transparency for families", "any family can be shown its parcel status & payment date — builds trust, reduces protests."),
    ]),
    ("Innovation and uniqueness", [
        ("Alignment-corridor GIS", "first-of-its-kind view: parcels strung along the actual route (e.g., Regional Ring Road arc, Warangal ORR ring) in workflow colours — not dots on a map."),
        ("Legal-workflow-native", "data model mirrors the 2013 Act itself — Sec 4/11/26/30/38 map 1:1 to screens, forms & actions; an officer's file becomes a workflow."),
        ("Zero-infrastructure deploy", "prototype runs offline as a single file in any browser — works in low-connectivity district offices; no licence cost."),
        ("Stage-click filtering", "click any pipeline stage on the map to highlight only parcels at that stage — instant ground truth."),
        ("State-agnostic engine", "swap boundary & records data → same system for any state, scaling to a true national grid for DoLR."),
    ]),
]
for i, (h, items) in enumerate(cols):
    x = Inches(0.5) + (cw + gap) * i
    rect(s, x, top, cw, chh, fill=LIGHT if i != 2 else WHITE, line=LINE, line_w=1, round_=True)
    rect(s, x, top, cw, Inches(0.5), fill=GREEN_D if i != 2 else DARK)
    text(s, x + Inches(0.18), top + Inches(0.1), cw - Inches(0.36), Inches(0.4),
         [[(h, {'size': 12, 'bold': True, 'color': WHITE})]])
    text(s, x + Inches(0.18), top + Inches(0.62), cw - Inches(0.34), chh - Inches(0.75),
         bullets(items, size=10.3, gap=5), leading=1.06, space_after=5)
footer(s, 2)
s.notes_slide.notes_text_frame.text = "2-3 min. Lead with the corridor-GIS innovation — that is the differentiator every other team will lack."

# ================= SLIDE 3 — TECHNICAL APPROACH =================
s = slide()
head(s, "TECHNICAL APPROACH")
text(s, Inches(0.5), Inches(0.92), Inches(6.2), Inches(0.35),
     [[("Technologies used", {'size': 14, 'bold': True, 'color': GREEN_D})]])
rect(s, Inches(0.5), Inches(1.35), Inches(6.1), Inches(2.6), fill=LIGHT, line=LINE, line_w=1, round_=True)
text(s, Inches(0.7), Inches(1.5), Inches(5.75), Inches(2.4),
     bullets([
         ("Prototype (working today)", "HTML5 · CSS3 · Vanilla JS · in-house SVG GIS engine · GeoJSON → SVG boundary pipeline (Python). Zero dependencies, runs offline."),
         ("Production stack (planned)", "React + TypeScript front-end · Node.js/NestJS APIs · PostgreSQL + PostGIS spatial DB · Redis queue · S3-style object store for documents."),
         ("Government integrations", "Dharani (land records) · Bhuvan / NIC GIS cadastral layers · CFMS (DBT payments) · e-Gazette (notifications) via secure API gateway."),
         ("Smart automation", "rule-engine SLA alerts · anomaly checks on payments · AI risk-scoring roadmap (delay-pattern ML)."),
     ], size=10.6, gap=5), leading=1.08, space_after=6)
text(s, Inches(0.5), Inches(4.12), Inches(6.2), Inches(0.35),
     [[("Methodology — implementation flow", {'size': 14, 'bold': True, 'color': GREEN_D})]])
steps = ["Ingest boundaries\n& records", "Digitise lifecycle\n(RFCTLARR stages)", "Map parcels to\nroute corridors", "Monitor · Alert\n· Action", "DBT compensation\n& audit trail"]
fx = Inches(0.5); fy = Inches(4.55); fw = Inches(1.14); fh = Inches(0.92)
for i, st in enumerate(steps):
    rect(s, fx, fy, fw, fh, fill=DARK if i in (0, 4) else GREEN_D, round_=True)
    text(s, fx + Inches(0.04), fy + Inches(0.1), fw - Inches(0.08), fh - Inches(0.15),
         [[(st, {'size': 8.6, 'bold': True, 'color': WHITE})]], align=PP_ALIGN.CENTER, leading=1.02)
    if i < 4:
        text(s, fx + fw, fy + Inches(0.3), Inches(0.24), Inches(0.3),
             [[("→", {'size': 12, 'bold': True, 'color': GREEN})]], align=PP_ALIGN.CENTER)
    fx += fw + Inches(0.24)
text(s, Inches(0.5), Inches(5.7), Inches(6.2), Inches(1.2),
     bullets([
         ("Process", "requirements from Act → data model → GIS engine → workflow module → integration APIs → field pilot with 1 district → state rollout."),
         ("Prototype status", "fully interactive end-to-end system already built — every action (approve, verify, publish, pay) works live in this presentation."),
     ], size=10.6), leading=1.08, space_after=5)
# right: screenshots
text(s, Inches(6.95), Inches(0.92), Inches(6.0), Inches(0.35),
     [[("Working prototype — screenshots", {'size': 14, 'bold': True, 'color': GREEN_D})]])
s.shapes.add_picture('docs/assets/rrr_align.png', Inches(6.95), Inches(1.35), height=Inches(2.62))
text(s, Inches(6.95), Inches(4.0), Inches(6.0), Inches(0.28),
     [[("Route-alignment GIS: RRR Northern Arc — corridor parcels in workflow colours, green = land acquired", {'size': 9, 'italic': True, 'color': MUT})]])
s.shapes.add_picture('docs/assets/state_map.png', Inches(6.95), Inches(4.35), height=Inches(2.55))
text(s, Inches(6.95), Inches(6.62), Inches(6.0), Inches(0.28),
     [[("State dashboard map: live district status across all 33 districts of Telangana", {'size': 9, 'italic': True, 'color': MUT})]])
footer(s, 3)
s.notes_slide.notes_text_frame.text = "Emphasise: prototype already works (right side is OUR app, not a mockup). Production stack is standard govt-grade tech."

# ================= SLIDE 4 — FEASIBILITY AND VIABILITY =================
s = slide()
head(s, "FEASIBILITY AND VIABILITY")
text(s, Inches(0.5), Inches(0.92), Inches(12.3), Inches(0.35),
     [[("Analysis of the feasibility of the idea", {'size': 14, 'bold': True, 'color': GREEN_D})]])
feas = [
    ("Already built", "working end-to-end prototype demonstrated today — not a concept"),
    ("Legal alignment", "digitises the existing RFCTLARR 2013 process — no policy change needed"),
    ("Open data ready", "district boundaries & geoportals are public; records APIs are govt-owned"),
    ("Zero-cost pilot", "single-file tech deploys in any district office browser; scales via standard cloud"),
    ("DILRMP synergy", "complements the Digital India Land Records Modernization Programme"),
]
fx = Inches(0.5)
for i, (h, b) in enumerate(feas):
    w = Inches(2.42)
    rect(s, fx, Inches(1.32), w, Inches(1.06), fill=RGBColor(231, 246, 238), line=GREEN, line_w=1, round_=True)
    text(s, fx + Inches(0.12), Inches(1.4), w - Inches(0.24), Inches(0.92),
         [[("✓ " + h, {'size': 10.3, 'bold': True, 'color': GREEN_D})],
          [(b, {'size': 8.8, 'color': INK})]], leading=1.02, space_after=2)
    fx += w + Inches(0.075)
text(s, Inches(0.5), Inches(2.62), Inches(12.3), Inches(0.35),
     [[("Potential challenges & risks  —  and strategies to overcome them", {'size': 14, 'bold': True, 'color': GREEN_D})]])
risks = [
    ("Integration with Dharani / CFMS legacy systems", "Standard REST/CSV fallback formats; phased integration starting read-only; DoLR-led API gateway under Digital India framework"),
    ("Field data quality (GPS surveys, owner records)", "Mobile app with offline capture, mandatory validation rules, cross-check against Dharani before stage promotion"),
    ("Adoption & change management for officers", "Role-simple UI (3 clicks per action); training modules; state-level SOP notification; pilot district first"),
    ("Security & privacy of land & family data", "RBAC (4 levels) · encryption in transit & at rest · complete audit trail · DPDP Act 2023 compliance by design"),
    ("National scale (36 States/UTs)", "State-agnostic engine — boundaries, categories & rates are configuration, not code"),
]
tx, ty = Inches(0.5), Inches(3.05)
c1, c2 = Inches(4.4), Inches(7.93)
rect(s, tx, ty, c1, Inches(0.42), fill=AMBER)
rect(s, tx + c1, ty, c2, Inches(0.42), fill=GREEN_D)
text(s, tx + Inches(0.15), ty + Inches(0.08), c1, Inches(0.3), [[("CHALLENGE / RISK", {'size': 11, 'bold': True, 'color': WHITE})]])
text(s, tx + c1 + Inches(0.15), ty + Inches(0.08), c2, Inches(0.3), [[("MITIGATION STRATEGY", {'size': 11, 'bold': True, 'color': WHITE})]])
ry = ty + Inches(0.42); rh = Inches(0.68)
for i, (a, b) in enumerate(risks):
    rect(s, tx, ry, Inches(12.33), rh, fill=WHITE if i % 2 else LIGHT, line=LINE, line_w=0.75)
    text(s, tx + Inches(0.15), ry + Inches(0.08), c1 - Inches(0.3), rh - Inches(0.14),
         [[("⚠ ", {'size': 10.5, 'bold': True, 'color': AMBER}), (a, {'size': 10.3, 'bold': True, 'color': INK})]], anchor=MSO_ANCHOR.MIDDLE, leading=1.02)
    text(s, tx + c1 + Inches(0.15), ry + Inches(0.08), c2 - Inches(0.3), rh - Inches(0.14),
         [[("→ ", {'size': 10.5, 'bold': True, 'color': GREEN}), (b, {'size': 10.3, 'color': INK})]], anchor=MSO_ANCHOR.MIDDLE, leading=1.02)
    ry += rh
footer(s, 4)
s.notes_slide.notes_text_frame.text = "Key message: feasibility is proven (working prototype + open data + legal alignment). The risk table preempts the jury's toughest questions."

# ================= SLIDE 5 — IMPACT AND BENEFITS =================
s = slide()
head(s, "IMPACT AND BENEFITS")
text(s, Inches(0.5), Inches(0.92), Inches(12.3), Inches(0.35),
     [[("Potential impact on the target audience", {'size': 14, 'bold': True, 'color': GREEN_D})]])
aud = [
    ("Affected families", "See their parcel's exact stage & payment date — dignity, predictability, faster money in hand", "👨‍👩‍👧"),
    ("Field & district officers", "3-click actions, GPS-verified parcels, SLA clocks — files move without files", "🧑‍💼"),
    ("State & Central Govt", "Live corridor-level visibility across the state; early alerts prevent escalations & litigation", "🏛"),
    ("Citizens at large", "Highways, irrigation & industry projects start on time — growth is not stuck in land disputes", "🛣"),
]
ax = Inches(0.5)
for h, b, icn in aud:
    w = Inches(3.02)
    rect(s, ax, Inches(1.32), w, Inches(1.5), fill=LIGHT, line=LINE, line_w=1, round_=True)
    rect(s, ax, Inches(1.32), w, Inches(0.08), fill=GREEN)
    text(s, ax + Inches(0.14), Inches(1.46), w - Inches(0.28), Inches(0.32),
         [[(h, {'size': 11.5, 'bold': True, 'color': DARK})]])
    text(s, ax + Inches(0.14), Inches(1.82), w - Inches(0.28), Inches(0.95),
         [[(b, {'size': 9.6, 'color': INK})]], leading=1.08)
    ax += w + Inches(0.085)
text(s, Inches(0.5), Inches(3.05), Inches(12.3), Inches(0.35),
     [[("Benefits of the solution", {'size': 14, 'bold': True, 'color': GREEN_D})]])
bens = [
    ("SOCIAL", GREEN_D, [
        "Transparency ends information asymmetry between State and families",
        "Fewer disputes & protests → less displacement distress",
        "Telugu UI + SMS/WhatsApp status (roadmap) for every affected family",
        "Full audit trail = fair, defensible awards",
    ]),
    ("ECONOMIC", GREEN, [
        "Faster commissioning of highways, irrigation & industrial corridors",
        "Every month saved on a mega-project avoids crores in cost escalation & interest",
        "DBT-linked ledger plugs leakage; accurate budgeting from live data",
        "Lower litigation spend for the exchequer",
    ]),
    ("ENVIRONMENTAL / GOVERNANCE", DARK, [
        "Early forest & land-overlap screening (FCA) before alignment freeze",
        "Digitised records cut paper, travel & re-surveys",
        "Data-driven planning avoids re-alignments that waste acquired land",
        "Reusable national asset for DoLR — one engine, every state",
    ]),
]
bx = Inches(0.5)
for h, c, items in bens:
    w = Inches(4.05)
    rect(s, bx, Inches(3.48), w, Inches(3.35), fill=WHITE, line=LINE, line_w=1.1, round_=True)
    rect(s, bx, Inches(3.48), w, Inches(0.44), fill=c)
    text(s, bx + Inches(0.16), Inches(3.56), w - Inches(0.32), Inches(0.3),
         [[(h, {'size': 11.5, 'bold': True, 'color': WHITE})]])
    text(s, bx + Inches(0.16), Inches(4.05), w - Inches(0.32), Inches(2.7),
         bullets(items, size=10.2), leading=1.08, space_after=6)
    bx += w + Inches(0.09)
footer(s, 5)
s.notes_slide.notes_text_frame.text = "Tie benefits back to the PS: 'end-to-end digital monitoring' = social transparency + economic speed + governance quality."

# ================= SLIDE 6 — RESEARCH AND REFERENCES =================
s = slide()
head(s, "RESEARCH  AND  REFERENCES")
text(s, Inches(0.5), Inches(0.92), Inches(12.3), Inches(0.35),
     [[("Details / Links of the reference and research work", {'size': 14, 'bold': True, 'color': GREEN_D})]])
refs = [
    ("The Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 (RFCTLARR)", "Dept. of Land Resources, MoRD — https://dolr.gov.in  ·  Act & Rules text: https://indiacode.nic.in"),
    ("Digital India Land Records Modernization Programme (DILRMP)", "DoLR framework guiding digitisation of land records — https://dolr.gov.in/programmes/dilrmp"),
    ("Dharani — Telangana Integrated Land Records Management System", "Govt. of Telangana Revenue Dept. — https://dharani.telangana.gov.in"),
    ("CFMS — Comprehensive Financial Management System, Telangana", "DBT/payment backbone integration reference — https://cfms.telangana.gov.in"),
    ("Bhuvan — ISRO Geoportal & NIC GIS services", "cadastral & thematic layers for production integration — https://bhuvan.nrsc.gov.in"),
    ("Survey of India / open district boundary datasets (GeoJSON)", "boundary geometry used in our prototype (33 districts of Telangana) — https://india-maps-data.open (Survey of India derived) "),
    ("PM Gati Shakti National Master Plan", "multi-ministry infrastructure planning context — https://gatishakti.gov.in"),
    ("e-Gazette — Gazette of India / Telangana State Gazette", "legal publication channel for Sec-11 notifications — https://egazette.gov.in"),
    ("World Bank & NITI Aayog studies on land acquisition & infrastructure delays", "problem-validation research on acquisition-driven project delays (background study)"),
    ("SIH Problem Statement 26016 (official)", "MoRD · DoLR · Theme: Smart Automation · Category: Software — source of requirements"),
]
ry = Inches(1.4)
for i, (t, d) in enumerate(refs):
    rect(s, Inches(0.5), ry, Inches(12.33), Inches(0.5), fill=LIGHT if i % 2 else WHITE, line=LINE, line_w=0.75)
    text(s, Inches(0.65), ry + Inches(0.05), Inches(0.4), Inches(0.4),
         [[(str(i + 1), {'size': 11, 'bold': True, 'color': WHITE})]], anchor=MSO_ANCHOR.MIDDLE)
    rect(s, Inches(0.66), ry + Inches(0.06), Inches(0.38), Inches(0.38), fill=GREEN, round_=True)
    text(s, Inches(0.66), ry + Inches(0.115), Inches(0.38), Inches(0.3),
         [[(str(i + 1), {'size': 10.5, 'bold': True, 'color': WHITE})]], align=PP_ALIGN.CENTER)
    text(s, Inches(1.2), ry + Inches(0.04), Inches(6.3), Inches(0.44),
         [[(t, {'size': 10, 'bold': True, 'color': INK})]], anchor=MSO_ANCHOR.MIDDLE, leading=0.95)
    text(s, Inches(7.6), ry + Inches(0.04), Inches(5.1), Inches(0.44),
         [[(d, {'size': 8.6, 'color': MUT})]], anchor=MSO_ANCHOR.MIDDLE, leading=0.95)
    ry += Inches(0.52)
rect(s, Inches(0.5), Inches(6.65), Inches(12.33), Inches(0.4), fill=RGBColor(231, 246, 238), round_=True)
text(s, Inches(0.7), Inches(6.71), Inches(12), Inches(0.3),
     [[("Prototype dataset note: ", {'size': 9.5, 'bold': True, 'color': GREEN_D}),
       ("boundaries from open Survey-of-India-derived GeoJSON; parcel/family records are realistic synthetic data seeded per project — production links to Dharani/Bhuvan/CFMS as listed above.", {'size': 9.5, 'color': INK})]])
footer(s, 6)
s.notes_slide.notes_text_frame.text = "If jury asks for 'research': point to Act + DILRMP + Gati Shakti + delay studies, and our dataset honesty note."

import os; prs.save(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..','docs','SIH26016_Idea_Submission.pptx'))
print('saved', round(__import__('os').path.getsize('SIH26016_Idea_Submission.pptx')/1024), 'KB')
