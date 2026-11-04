#!/usr/bin/env python3
"""NLAMS Telangana — SIH internal-round pitch deck builder."""
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.oxml.ns import qn
import copy

# ---------- theme ----------
GREEN   = RGBColor(14, 138, 95)
GREEN_D = RGBColor(11, 90, 62)
DARK    = RGBColor(15, 46, 34)
INK     = RGBColor(30, 41, 59)
MUT     = RGBColor(100, 116, 139)
LIGHT   = RGBColor(243, 246, 244)
LINE    = RGBColor(222, 232, 226)
WHITE   = RGBColor(255, 255, 255)
SAFF    = RGBColor(249, 115, 22)
AMBER   = RGBColor(245, 158, 11)
RED     = RGBColor(239, 68, 68)
GOLD    = RGBColor(250, 204, 21)

FONT = "Calibri"
SW, SH = Inches(13.333), Inches(7.5)

prs = Presentation()
prs.slide_width = SW
prs.slide_height = SH
BLANK = prs.slide_layouts[6]

# ---------- helpers ----------
def slide():
    return prs.slides.add_slide(BLANK)

def rect(s, x, y, w, h, fill=None, line=None, line_w=0.75, shadow=False, round_=False):
    shp = s.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE if round_ else MSO_SHAPE.RECTANGLE, x, y, w, h)
    if round_:
        try: shp.adjustments[0] = 0.08
        except Exception: pass
    if fill is None:
        shp.fill.background()
    else:
        shp.fill.solid(); shp.fill.fore_color.rgb = fill
    if line is None:
        shp.line.fill.background()
    else:
        shp.line.color.rgb = line; shp.line.width = Pt(line_w)
    shp.shadow.inherit = False
    return shp

def text(s, x, y, w, h, runs, size=14, color=INK, bold=False, align=PP_ALIGN.LEFT,
         anchor=MSO_ANCHOR.TOP, leading=1.0, space_after=0, wrap=True):
    """runs: str or list of (text, dict-overrides) paragraphs, or list of lists of run tuples"""
    tb = s.shapes.add_textbox(x, y, w, h)
    tf = tb.text_frame
    tf.word_wrap = wrap
    tf.vertical_anchor = anchor
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    if isinstance(runs, str):
        runs = [[(runs, {})]]
    for i, para in enumerate(runs):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.line_spacing = leading
        p.space_after = Pt(space_after)
        if isinstance(para, str): para = [(para, {})]
        for rt, ov in para:
            r = p.add_run(); r.text = rt
            f = r.font
            f.name = ov.get('font', FONT)
            f.size = Pt(ov.get('size', size))
            f.bold = ov.get('bold', bold)
            f.italic = ov.get('italic', False)
            f.color.rgb = ov.get('color', color)
    return tb

def header(s, num, title, sub=None):
    rect(s, 0, 0, SW, Inches(0.16), fill=GREEN)
    rect(s, 0, Inches(0.16), Inches(1.55), Inches(0.035), fill=GOLD)
    text(s, Inches(0.55), Inches(0.38), Inches(11.0), Inches(0.7),
         [[(title, {'size': 27, 'bold': True, 'color': DARK})]])
    if sub:
        text(s, Inches(0.55), Inches(0.98), Inches(12.2), Inches(0.4),
             [[(sub, {'size': 13.5, 'color': MUT})]])
    text(s, Inches(12.55), Inches(0.42), Inches(0.6), Inches(0.4),
         [[(num, {'size': 13, 'bold': True, 'color': GREEN})]], align=PP_ALIGN.RIGHT)
    rect(s, Inches(0.55), Inches(7.08), Inches(12.23), Pt(1), fill=LINE)
    text(s, Inches(0.55), Inches(7.14), Inches(12.23), Inches(0.3),
         [[("NLAMS · Telangana", {'size': 9, 'color': MUT, 'bold': True}),
           ("          Smart India Hackathon 2026", {'size': 9, 'color': MUT})]])

def notes(s, txt):
    s.notes_slide.notes_text_frame.text = txt

def tricolor(s, x, y, w=Inches(1.0)):
    seg = Emu(int(w / 3))
    for i, c in enumerate([SAFF, WHITE, GREEN]):
        r = rect(s, x + seg * i, y, seg, Pt(2.6), fill=c)
        if c == WHITE:
            r.fill.fore_color.rgb = RGBColor(203, 213, 225)

def bullet_runs(head, body, hsize=14, bsize=12.5, hcolor=GREEN_D):
    return [[(head, {'size': hsize, 'bold': True, 'color': hcolor})],
            [(body, {'size': bsize, 'color': INK})]]

# ================= SLIDE 1 — TITLE =================
s = slide()
s.shapes.add_picture('docs/assets/title_bg.jpg', 0, 0, SW, SH)
rect(s, 0, 0, SW, SH, fill=None)
# emblem
s.shapes.add_picture('frontend/src/assets/emblem.png', Inches(0.55), Inches(0.5), height=Inches(1.05))
text(s, Inches(1.75), Inches(0.62), Inches(8), Inches(0.8),
     [[("GOVERNMENT OF TELANGANA", {'size': 12, 'bold': True, 'color': RGBColor(214, 232, 222)})],
      [("Revenue Department · Land Acquisition", {'size': 10.5, 'color': RGBColor(170, 195, 180)})]])
# headline
text(s, Inches(0.55), Inches(2.15), Inches(12.2), Inches(1.9),
     [[("National Land Acquisition &", {'size': 43, 'bold': True, 'color': WHITE})],
      [("Management System ", {'size': 43, 'bold': True, 'color': WHITE}),
       ("— NLAMS", {'size': 43, 'bold': True, 'color': GOLD})]])
text(s, Inches(0.55), Inches(3.85), Inches(11.5), Inches(0.8),
     [[("GIS-powered, real-time monitoring of land acquisition across all 33 districts of Telangana —",
        {'size': 16.5, 'color': RGBColor(225, 238, 230)})],
      [("from notification to compensation, on one map.", {'size': 16.5, 'bold': True, 'color': RGBColor(225, 238, 230)})]])
tricolor(s, Inches(0.58), Inches(4.9), Inches(1.35))
# team box
rect(s, Inches(0.55), Inches(5.85), Inches(7.6), Inches(1.15), fill=RGBColor(9, 30, 22), line=RGBColor(46, 92, 72), line_w=1)
text(s, Inches(0.8), Inches(6.02), Inches(7.2), Inches(0.9),
     [[("TEAM ", {'size': 12, 'bold': True, 'color': GOLD}), ("<TEAM NAME>", {'size': 12, 'bold': True, 'color': WHITE}),
       ("   ·   <COLLEGE NAME>", {'size': 12, 'color': RGBColor(190, 210, 198)})],
      [("Problem Statement ID: <PS-xxxx>  ·  Team ID: <SIH-xxxxx>  ·  Smart India Hackathon 2026",
        {'size': 10.5, 'color': RGBColor(160, 185, 170)})]], space_after=4)
notes(s, "30 seconds.\n\nSay: 'Namaste jury. We are building NLAMS — a single GIS map where the Government of Telangana can watch every land-acquisition project in the state in real time — which land is notified, verified, awarded, and which family is still waiting for compensation.'\n\nFill in team name, college and PS ID before presenting.")

# ================= SLIDE 2 — PROBLEM =================
s = slide()
header(s, "02", "The Problem", "Land acquisition is slow, opaque and fragmented — for officials and for families")
cards = [
    ("Fragmented records", "Notifications, survey numbers, awards and payment records sit in separate department silos — Revenue, R&B, I&CAD, TSIIC. No single view of a project exists.", "📁"),
    ("Zero real-time visibility", "State and district officials discover stalled projects only through escalations, media or protests — months after the delay began.", "_visibility"),
    ("Compensation delays", "The verification → award → payment chain drags on. Every delay beyond the legal timeline pushes families toward litigation and disputes.", "⏳"),
    ("No spatial context", "Spreadsheets and PDFs cannot show where parcels lie, which corridor is blocked, or which villages remain — so planning is guesswork.", "🗺"),
]
cw, chh = Inches(2.95), Inches(3.5)
for i, (h, b, ic) in enumerate(cards):
    x = Inches(0.55) + (cw + Inches(0.15)) * i
    rect(s, x, Inches(1.7), cw, chh, fill=LIGHT, line=LINE, line_w=1, round_=True)
    rect(s, x, Inches(1.7), cw, Inches(0.09), fill=GREEN)
    text(s, x + Inches(0.2), Inches(1.95), cw - Inches(0.4), Inches(0.6),
         [[(h, {'size': 15.5, 'bold': True, 'color': DARK})]])
    text(s, x + Inches(0.2), Inches(2.6), cw - Inches(0.4), Inches(2.4),
         [[(b, {'size': 12.5, 'color': INK})]], leading=1.12)
rect(s, Inches(0.55), Inches(5.55), Inches(12.23), Inches(1.25), fill=RGBColor(255, 247, 237), line=RGBColor(253, 186, 116), line_w=1.2, round_=True)
text(s, Inches(0.85), Inches(5.78), Inches(11.7), Inches(0.9),
     [[("The law already prescribes the process — monitoring it is still manual.",
        {'size': 15, 'bold': True, 'color': RGBColor(154, 52, 18)})],
      [("The RFCTLARR Act, 2013 mandates a strict stage-wise acquisition workflow (notification → verification → award → possession → compensation). What is missing is a system that watches every stage, everywhere, live.",
        {'size': 12, 'color': RGBColor(124, 45, 18)})]], space_after=5)
notes(s, "60–75 seconds.\n\nKey line: 'The process is legal, the data exists — but it is scattered and invisible. Nobody in the Secretariat can answer 'which village of which project is stuck today?' without phone calls.'\n\nDo NOT read every card aloud — pick Fragmented records and Compensation delays, gesture at the rest.")

# ================= SLIDE 3 — EXISTING VS NLAMS =================
s = slide()
header(s, "03", "Why existing systems are not enough", "What changes with NLAMS")
rows = [
    ("Land records & project data", "Scattered across portals, PDFs and paper files", "One source of truth — every project, district and parcel in one place"),
    ("Visualisation", "Tabular registers; no maps at parcel level", "Real GIS — 33 district boundaries + route-level parcel mapping of each corridor"),
    ("Process tracking", "Manual follow-ups; status known after delays", "Digital RFCTLARR workflow — 7 stages with live stage-gates and dates"),
    ("Risk & delays", "Reactive — escalations, protests, court cases", "Alerts & risk scores — projects flagged before they breach SLA"),
    ("Compensation", "Disbursal status opaque to families & officers", "DBT ledger with paid / pending status and one-click release"),
]
tx, ty = Inches(0.55), Inches(1.75)
tw = Inches(12.23)
c1 = Inches(2.9); c2 = Inches(4.35); c3 = Inches(4.98)
rect(s, tx, ty, c1, Inches(0.5), fill=DARK)
rect(s, tx + c1, ty, c2, Inches(0.5), fill=RGBColor(120, 53, 45))
rect(s, tx + c1 + c2, ty, c3, Inches(0.5), fill=GREEN_D)
text(s, tx + Inches(0.15), ty + Inches(0.11), c1 - Inches(0.3), Inches(0.3), [[("AREA", {'size': 11.5, 'bold': True, 'color': WHITE})]])
text(s, tx + c1 + Inches(0.15), ty + Inches(0.11), c2 - Inches(0.3), Inches(0.3), [[("TODAY (EXISTING WAY)", {'size': 11.5, 'bold': True, 'color': WHITE})]])
text(s, tx + c1 + c2 + Inches(0.15), ty + Inches(0.11), c3 - Inches(0.3), Inches(0.3), [[("WITH NLAMS", {'size': 11.5, 'bold': True, 'color': WHITE})]])
ry = ty + Inches(0.5)
rh = Inches(0.92)
for i, (a, b, c) in enumerate(rows):
    bg = WHITE if i % 2 == 0 else LIGHT
    rect(s, tx, ry, tw, rh, fill=bg, line=LINE, line_w=0.75)
    text(s, tx + Inches(0.15), ry + Inches(0.12), c1 - Inches(0.3), rh - Inches(0.2),
         [[(a, {'size': 12, 'bold': True, 'color': DARK})]], anchor=MSO_ANCHOR.MIDDLE)
    text(s, tx + c1 + Inches(0.15), ry + Inches(0.12), c2 - Inches(0.3), rh - Inches(0.2),
         [[(b, {'size': 11.5, 'color': RGBColor(127, 29, 29)})]], anchor=MSO_ANCHOR.MIDDLE)
    text(s, tx + c1 + c2 + Inches(0.15), ry + Inches(0.12), c3 - Inches(0.3), rh - Inches(0.2),
         [[("✓  ", {'size': 11.5, 'bold': True, 'color': GREEN}), (c, {'size': 11.5, 'color': INK})]], anchor=MSO_ANCHOR.MIDDLE)
    ry += rh
notes(s, "45 seconds.\n\nDon't read the table. Say: 'Existing portals publish documents. NLAMS watches the process itself — the difference is documents versus decisions.' Then move quickly to the solution.")

# ================= SLIDE 4 — SOLUTION =================
s = slide()
header(s, "04", "Our Solution — NLAMS at a glance", "One platform from proposal to compensation, built around the official RFCTLARR workflow")
mods = [
    ("Dashboard", "State KPIs — projects, land, compensation, families at risk, district league table"),
    ("Projects", "Single source of truth per project — land, budget, families, stage, timeline"),
    ("GIS Land Map", "All 33 districts + route-alignment view with parcels in their acquisition stage"),
    ("Acquisition", "Proposal → Scrutiny → Notification → Verification → Award → Possession, with actions"),
    ("Compensation", "CFMS-style DBT ledger — release payments, track SLA, see pending families"),
    ("Alerts & Risk", "Risk-scored alerts with recommended action — before projects derail"),
]
mx, my = Inches(0.55), Inches(1.72)
mw, mh = Inches(4.0), Inches(1.52)
for i, (h, b) in enumerate(mods):
    x = mx + (mw + Inches(0.15)) * (i % 3)
    y = my + (mh + Inches(0.18)) * (i // 3)
    rect(s, x, y, mw, mh, fill=WHITE, line=LINE, line_w=1.2, round_=True)
    rect(s, x, y, Inches(0.08), mh, fill=GREEN)
    text(s, x + Inches(0.22), y + Inches(0.13), mw - Inches(0.4), Inches(0.35),
         [[(h, {'size': 14, 'bold': True, 'color': GREEN_D})]])
    text(s, x + Inches(0.22), y + Inches(0.5), mw - Inches(0.42), mh - Inches(0.6),
         [[(b, {'size': 11, 'color': INK})]], leading=1.1)
# workflow strip
wf = Inches(8.05)
rect(s, Inches(0.55), wf, Inches(12.23), Inches(1.42), fill=DARK, round_=True)
text(s, Inches(0.85), wf + Inches(0.12), Inches(8), Inches(0.3),
     [[("THE DIGITAL ACQUISITION PIPELINE (RFCTLARR 2013)", {'size': 11, 'bold': True, 'color': GOLD})]])
stages = ["Proposal", "Scrutiny", "Notification", "Verification", "Award", "Possession", "Compensation"]
sx = Inches(0.85)
sw_ = Inches(1.52)
for i, st in enumerate(stages):
    fill = GREEN if i < 5 else RGBColor(34, 84, 63)
    rect(s, sx, wf + Inches(0.52), sw_, Inches(0.52), fill=fill, round_=True)
    text(s, sx, wf + Inches(0.63), sw_, Inches(0.3), [[(st, {'size': 10.5, 'bold': True, 'color': WHITE})]], align=PP_ALIGN.CENTER)
    if i < 6:
        text(s, sx + sw_, wf + Inches(0.63), Inches(0.24), Inches(0.3), [[("→", {'size': 11, 'bold': True, 'color': GOLD})]], align=PP_ALIGN.CENTER)
    sx += sw_ + Inches(0.22)
text(s, Inches(0.85), wf + Inches(1.1), Inches(11.5), Inches(0.28),
     [[("Every stage transition is actioned inside the system — approve, verify, publish, release — and fully audited.", {'size': 10.5, 'color': RGBColor(190, 210, 198)})]])
notes(s, "60 seconds.\n\nWalk the module cards left to right, then point at the pipeline: 'The heart of NLAMS is the official 2013 Act workflow, digitised — an officer can actually approve a scrutiny, verify a parcel, publish a Section-11 notification and release a payment. This is a working system, not a mockup.'")

# ================= SLIDE 5 — GIS INTELLIGENCE (screenshots) =================
s = slide()
header(s, "05", "The GIS core — see the land, not just the numbers", "Real Telangana geometry · route alignment · parcels coloured by workflow stage")
img1 = 'docs/assets/rrr_align.png'
img2 = 'docs/assets/orr_ring.png'
ih = Inches(3.62)
s.shapes.add_picture(img1, Inches(0.55), Inches(1.75), height=ih)
s.shapes.add_picture(img2, Inches(6.95), Inches(1.75), height=ih)
cap = Inches(0.34)
text(s, Inches(0.55), Inches(5.42), Inches(6.0), cap,
     [[("Regional Ring Road — Northern Arc: 4 districts, corridor parcels along the alignment",
        {'size': 10.5, 'italic': True, 'color': MUT})]])
text(s, Inches(6.95), Inches(5.42), Inches(6.0), cap,
     [[("Warangal Outer Ring Road: closed ring, acquisition completing around it",
        {'size': 10.5, 'italic': True, 'color': MUT})]])
feats = [
    ("Route-level alignment view", "Click a project → its exact land corridor is drawn over real district boundaries; green segment = land already acquired."),
    ("Parcels in workflow colours", "Every parcel on the corridor is Notified / Verified / Awarded / Possession / Compensated / Disputed — the acquisition story, visible."),
    ("Interactive drill-down", "Filter parcels by stage, hover for owner & survey no., zoom & pan, district dashboards — all live."),
]
fy = Inches(5.85)
fx = Inches(0.55)
fw = Inches(4.0)
for i, (h, b) in enumerate(feats):
    x = fx + (fw + Inches(0.12)) * i
    text(s, x, fy, fw, Inches(1.1),
         [[(h, {'size': 12.5, 'bold': True, 'color': GREEN_D})],
          [(b, {'size': 10.5, 'color': INK})]], leading=1.08, space_after=2)
notes(s, "75–90 seconds. THIS IS THE WOW SLIDE.\n\nSay: 'This is not a static map. Left — the Regional Ring Road alignment: the dark line is the route, the green segment is how much land is already acquired, and each coloured patch is an actual land parcel in a specific legal stage. Right — Warangal ORR: you can see acquisition completing around the ring. If a farmer asks 'what is the status of my survey number?' — this map answers.'\n\nIf demoing live, switch to the app here.")

# ================= SLIDE 6 — LIVE DEMO PATH =================
s = slide()
header(s, "06", "Live demo — the 3-minute walkthrough", "One login → one at-risk project → follow it across the whole system")
steps = [
    ("Login with role", "Role-based access — Central / State / District / Field"),
    ("Dashboard", "State KPIs; spot the red flag — Warangal ORR at risk 87/100"),
    ("GIS Land Map", "Telangana status map → click the red district → drill in"),
    ("Alignment view", "RRR / ORR corridor: route, acquired %, parcels by stage"),
    ("Project deep-dive", "Single source of truth — land, budget, families, timeline"),
    ("Acquisition actions", "Scrutiny → approve · Verification → verify parcel · Award calculator (Sec 26–30)"),
    ("Compensation", "Release a pending DBT payment — watch state totals update"),
    ("Alerts & Risk", "Risk-scored alerts with recommended actions"),
]
bx, by = Inches(0.55), Inches(1.7)
bw2, bh2 = Inches(6.0), Inches(1.08)
for i, (h, b) in enumerate(steps):
    x = bx + (bw2 + Inches(0.2)) * (i % 2)
    y = by + (bh2 + Inches(0.14)) * (i // 2)
    rect(s, x, y, bw2, bh2, fill=LIGHT if i % 2 == 0 else WHITE, line=LINE, line_w=1, round_=True)
    circ = s.shapes.add_shape(MSO_SHAPE.OVAL, x + Inches(0.14), y + Inches(0.28), Inches(0.5), Inches(0.5))
    circ.fill.solid(); circ.fill.fore_color.rgb = GREEN; circ.line.fill.background(); circ.shadow.inherit = False
    text(s, x + Inches(0.14), y + Inches(0.38), Inches(0.5), Inches(0.3),
         [[(str(i + 1), {'size': 13, 'bold': True, 'color': WHITE})]], align=PP_ALIGN.CENTER)
    text(s, x + Inches(0.8), y + Inches(0.13), bw2 - Inches(1.0), bh2 - Inches(0.2),
         [[(h, {'size': 12.5, 'bold': True, 'color': DARK})],
          [(b, {'size': 10.5, 'color': MUT})]], space_after=1)
rect(s, Inches(0.55), Inches(6.6), Inches(12.23), Inches(0.42), fill=RGBColor(231, 246, 238), round_=True)
text(s, Inches(0.8), Inches(6.68), Inches(11.8), Inches(0.3),
     [[("Everything shown is clickable and stateful — approvals, verifications and payments update across all pages instantly. Fallback: recorded demo + these screenshots.",
        {'size': 11, 'bold': True, 'color': GREEN_D})]])
notes(s, "This slide IS your demo script.\n\nTime budget: 20s per step. Do steps 1-4 live in the app (login → dashboard → GIS → alignment). For 5-8, if time is short, talk over this slide. Closing line of demo: 'We followed one project from a red alert on a map to releasing money into a family's account — in under three minutes.'")

# ================= SLIDE 7 — DATA & TECH =================
s = slide()
header(s, "07", "How it is built — and where the data comes from", "Honest architecture: what runs today, what integrates in production")
rect(s, Inches(0.55), Inches(1.75), Inches(6.0), Inches(4.9), fill=WHITE, line=LINE, line_w=1.2, round_=True)
rect(s, Inches(0.55), Inches(1.75), Inches(6.0), Inches(0.52), fill=DARK)
text(s, Inches(0.8), Inches(1.86), Inches(5.6), Inches(0.3), [[("DATA STRATEGY", {'size': 12, 'bold': True, 'color': GOLD})]])
text(s, Inches(0.8), Inches(2.45), Inches(5.5), Inches(4.1),
     bullet_runs("Prototype (now)", "Open government district boundaries (33 districts of Telangana) rendered as native SVG — no external map service needed; realistic parcel data seeded per project following RFCTLARR stage distribution.", 12.5, 12.5)
     + bullet_runs("Production integration", "Dharani (land records) · Bhuvan / NIC GIS cadastral layers · CFMS (payments & DBT) · e-Gazette (notifications) via standard APIs.", 12.5, 12.5)
     + bullet_runs("Why it is credible", "The data model mirrors the actual legal workflow — every record a DLAO or MRO files today has a home in NLAMS.", 12.5, 12.5),
     leading=1.08, space_after=10)
rect(s, Inches(6.78), Inches(1.75), Inches(6.0), Inches(4.9), fill=WHITE, line=LINE, line_w=1.2, round_=True)
rect(s, Inches(6.78), Inches(1.75), Inches(6.0), Inches(0.52), fill=GREEN_D)
text(s, Inches(7.03), Inches(1.86), Inches(5.6), Inches(0.3), [[("TECHNOLOGY", {'size': 12, 'bold': True, 'color': WHITE})]])
text(s, Inches(7.03), Inches(2.45), Inches(5.5), Inches(4.1),
     bullet_runs("Zero-dependency web app", "Single-file HTML/JS/SVG build — no frameworks, no server, no internet needed. Runs offline in any browser on a ₹10,000 laptop.", 12.5, 12.5)
     + bullet_runs("GIS engine in-house", "Real GeoJSON boundaries projected to SVG with route-spline alignment and corridor mapping — built from scratch, no paid APIs.", 12.5, 12.5)
     + bullet_runs("Enterprise-ready design", "Role-based access (4 levels), session management, audited actions, API-ready module boundaries for goIT-grade integration.", 12.5, 12.5),
     leading=1.08, space_after=10)
notes(s, "45–60 seconds.\n\nJuries always ask 'where does data come from?' — answer before they ask. Emphasise: 'Prototype uses open boundaries + realistic synthetic parcels; production plugs into Dharani, Bhuvan and CFMS — all government-owned systems. And because it is a single file, it works even in a district office with no internet.'")

# ================= SLIDE 8 — IMPACT & ROADMAP =================
s = slide()
header(s, "08", "Impact, scalability & the road ahead", "Built for Telangana — designed for every state in India")
imps = [
    ("For families", "Status transparency — a farmer sees exactly where their parcel stands and when money moves. Fewer disputes, fewer protests."),
    ("For officers", "Real-time district & state visibility; alerts flag SLA breaches early; one source of truth replaces files and phone calls."),
    ("For the state", "Faster, fairer acquisition = infrastructure projects that start on time, with a complete audit trail."),
]
for i, (h, b) in enumerate(imps):
    y = Inches(1.72) + Inches(1.28) * i
    rect(s, Inches(0.55), y, Inches(7.6), Inches(1.12), fill=LIGHT, line=LINE, line_w=1, round_=True)
    rect(s, Inches(0.55), y, Inches(0.08), Inches(1.12), fill=GREEN)
    text(s, Inches(0.8), y + Inches(0.1), Inches(7.1), Inches(0.95),
         [[(h, {'size': 13, 'bold': True, 'color': GREEN_D})],
          [(b, {'size': 11.5, 'color': INK})]], space_after=2, leading=1.05)
rect(s, Inches(8.35), Inches(1.72), Inches(4.43), Inches(3.84), fill=DARK, round_=True)
text(s, Inches(8.6), Inches(1.9), Inches(4.0), Inches(0.3),
     [[("SCALE & ROADMAP", {'size': 12.5, 'bold': True, 'color': GOLD})]])
road = [
    ("Next 3 months", "Telugu UI · field-officer mobile app with GPS parcel capture"),
    ("6–12 months", "AI/ML risk scoring from delay patterns · SMS/WhatsApp status to families"),
    ("National scale", "Same engine, any state — only boundaries & records change. A true National Land Acquisition grid."),
]
ry2 = Inches(2.35)
for h, b in road:
    text(s, Inches(8.6), ry2, Inches(3.95), Inches(1.0),
         [[(h, {'size': 11.5, 'bold': True, 'color': RGBColor(126, 231, 170)})],
          [(b, {'size': 10.5, 'color': RGBColor(214, 228, 220)})]], space_after=2, leading=1.05)
    ry2 += Inches(1.06)
text(s, Inches(0.55), Inches(5.85), Inches(12.23), Inches(0.9),
     [[("One land map. One workflow. Every family's compensation visible — from the Secretariat to the village.",
        {'size': 17, 'bold': True, 'color': DARK})],
      [("Thank you — we welcome the jury's questions.", {'size': 13, 'color': GREEN_D, 'bold': True})]], space_after=6)
notes(s, "45 seconds + Q&A.\n\nClose with: 'Land acquisition delays cost the nation more than any software ever will. NLAMS gives the state eyes on every parcel — starting with Telangana, ready for India. Thank you.'\n\nLikely jury questions: data authenticity (→ slide 7), security (→ roles, session, audit), why not ArcGIS/Google Maps (→ offline single file, govt boundaries, no license cost), team roles (prepare!).")

import os; prs.save(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..','docs','NLAMS_SIH_Pitch.pptx'))
print('deck saved:', round(__import__('os').path.getsize('NLAMS_SIH_Pitch.pptx')/1024), 'KB')
