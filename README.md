# NLAMS · Telangana 🗺️
### National Land Acquisition & Management System — full-stack prototype
**SIH 2026 · Problem Statement 26016** · Ministry of Rural Development, Dept. of Land Resources
*Theme: Smart Automation · Category: Software*

A working full-stack land-acquisition monitoring platform: **vanilla-JS GIS frontend**
(real boundaries of all 33 Telangana districts, route-alignment corridors,
workflow-coloured parcels) + **Node REST API backend** (zero npm dependencies) +
build pipeline & docs. Runs entirely offline — nothing to install.

---

## 📂 Project tree

```
nlams/
├── package.json                    ← root scripts (npm start / test / build)
├── README.md
├── .gitignore
│
├── frontend/                       ← SPA (no framework, plain browser JS)
│   ├── index.html                  ← dev entry — loads the src tree below
│   └── src/
│       ├── css/styles.css          ← theme · login · shell · components · GIS overlays
│       ├── assets/                 ← emblem · login background
│       └── js/                     ← ordered modules (load = execution order)
│           ├── 01-config.js        ← theme colours · RFCTLARR stages · parcel palette
│           ├── 02-utils.js         ← DOM/format helpers · seeded RNG · icons · modals
│           ├── 03-map-data.js      ← Telangana geometry (GENERATED — do not edit)
│           ├── 04-data.js          ← demo dataset: 14 projects · alerts · users
│           ├── 05-engine.js        ← ⭐ GIS engine: aggregates · route splines · corridors
│           ├── 06-state.js         ← app state (S) · sessionStorage persistence
│           ├── 07-views-login.js   ← login (photo bg · emblem · roles)
│           ├── 08-views-shell.js   ← sidebar · topbar · statusbar (live API badge)
│           ├── 09-views-dashboard.js ← KPIs · status map · donut · district bars
│           ├── 10-views-gis.js     ← ⭐ map rendering · alignment view · zoom/pan
│           ├── 11-views-projects.js← projects table · details (5 tabs)
│           ├── 12-views-modules.js ← acquisition workflow · compensation · alerts
│           └── 13-app.js           ← render loop · events · boot + API probe
│
├── backend/                        ← REST API — Node std-lib ONLY (zero npm deps)
│   ├── package.json
│   └── src/
│       ├── server.js               ← http server · static files · /api mount
│       ├── routes/index.js         ← route table (method · pattern · params)
│       ├── controllers/api.controller.js ← read/write endpoints
│       ├── services/domain.js      ← loads the SAME js modules as the SPA (VM) —
│       │                              one business-logic core, zero drift
│       └── models/schema.sql       ← production PostgreSQL+PostGIS schema
│
├── data/
│   └── telangana.geojson           ← Survey-of-India-derived boundaries (input)
│
├── scripts/                        ← pipeline (Python 3 std-lib + Node)
│   ├── build_map.py                ← geojson → SVG paths → 03-map-data.js
│   ├── build.py                    ← bundles frontend → dist/index.html (single file)
│   ├── smoke.js                    ← regression: renders every page, verifies engine
│   ├── build_deck.py               ← internal-round pitch deck
│   ├── build_sih_deck.py           ← SIH idea PPTX
│   └── build_sih_pdf.py            ← SIH idea PDF (portal upload)
│
├── dist/
│   └── index.html                  ← ⭐ single-file build (offline demo fallback)
│
└── docs/
    ├── SIH26016_Idea_Submission.pdf ← portal upload (official 6-slide format)
    ├── SIH26016_Idea_Submission.pptx
    ├── NLAMS_SIH_Pitch.pptx         ← 8-slide pitch with speaker notes
    └── assets/                      ← map renders used by the decks
```

---

## 🚀 Run it

```bash
npm start          # backend + SPA on http://localhost:8080  (Node ≥ 18, zero installs)
npm run test       # regression suite (renders every page/tab, GIS engine checks)
npm run build      # regenerate dist/index.html (offline single file)
npm run map        # regenerate map geometry from data/telangana.geojson
npm run deck       # regenerate docs/ decks
```

No `npm install` needed anywhere — **backend uses only Node built-ins**,
scripts use only the Python standard library.

Offline fallback: open `dist/index.html` directly — full demo without any server.

---

## 🔌 REST API

| Method | Endpoint | Returns |
|---|---|---|
| GET | `/api/health` | service status |
| GET | `/api/kpi` | state-level KPIs (projects, land, compensation…) |
| GET | `/api/districts` | 33 districts + progress aggregates |
| GET | `/api/districts/:name` | district detail (centroid, bbox, aggregate) |
| GET | `/api/projects?q=warangal` | search projects |
| GET | `/api/projects/:id` | project detail + families preview |
| GET | `/api/projects/:id/alignment` | ⭐ route spline + corridor parcels + viewBox |
| GET | `/api/alerts` · `/api/users` | alerts with risk scores · user directory |
| POST | `/api/projects/:id/parcels/:pid/verify` | mark parcel GPS-verified |
| POST | `/api/families/:fid/pay` | release DBT compensation |

The SPA boots with a **live API probe** — the statusbar shows
`◉ API connected · nlams-backend` when served by `npm start`, and silently
degrades to offline mode when you open `dist/index.html` directly.

**Architecture note:** the backend loads the *same* domain modules the frontend
uses (`services/domain.js` → VM context) — routes, corridors, aggregates and
writes are computed by one shared business core. In production, swap
`frontend/src/js/04-data.js` + the in-memory store for PostgreSQL
(`backend/src/models/schema.sql` is ready: PostGIS parcels, SLA-tracked
payments, audit log).

---

## 🧭 3-minute demo path

**Login** → **Dashboard** (spot red Warangal) → **GIS Land Map** → click a district →
open **Regional Ring Road** → alignment view (green = acquired, parcels coloured by
workflow stage; click stage chips to filter) → **Project details** →
**Acquisition** (approve · verify · award calculator) → **Compensation**
(release a pending DBT payment) → **Alerts & Risk**. Refresh anywhere —
session persists.

## 👥 Team

`<Team Name>` · `<College>` · SIH Team ID `<xxxx>` — replace before submission.
