# NLAMS · Telangana 🗺️

### National Land Acquisition & Management System

**Full-Stack GIS-Based Land Acquisition Management Platform**

SIH 2026 · Problem Statement 26016  
Ministry of Rural Development · Department of Land Resources

**Theme:** Smart Automation · **Category:** Software

NLAMS is a full-stack land-acquisition monitoring platform featuring a vanilla JavaScript GIS frontend, a Node.js REST API backend, Telangana district boundaries, route-alignment corridors, and workflow-coloured land parcels.

## 📂 Project Structure

```text
nlams/
├── package.json
├── README.md
├── .gitignore
├── frontend/
│   ├── index.html
│   └── src/
│       ├── css/
│       ├── assets/
│       └── js/
├── backend/
│   ├── package.json
│   └── src/
│       ├── server.js
│       ├── routes/
│       ├── controllers/
│       ├── services/
│       └── models/
├── data/
│   └── telangana.geojson
├── scripts/
├── dist/
│   └── index.html
└── docs/
    ├── SIH26016_Idea_Submission.pdf
    ├── SIH26016_Idea_Submission.pptx
    └── NLAMS_SIH_Pitch.pptx
```

## 🚀 Getting Started

**Requirements:** Node.js 18 or later and Python 3.

Start the application:

```bash
npm start
```

Open http://localhost:8080 in your browser.

Other commands:

```bash
npm run test
npm run build
npm run map
npm run deck
```

The backend uses Node.js built-in modules. The scripts use the Python standard library.

**Offline demo:** Open `dist/index.html` directly in a browser.

## 🔌 REST API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Service status |
| GET | `/api/kpi` | State-level KPIs |
| GET | `/api/districts` | District progress |
| GET | `/api/districts/:name` | District details |
| GET | `/api/projects?q=warangal` | Search projects |
| GET | `/api/projects/:id` | Project details |
| GET | `/api/projects/:id/alignment` | Route alignment information |
| GET | `/api/alerts` | Alerts and risk scores |
| GET | `/api/users` | User directory |
| POST | `/api/projects/:id/parcels/:pid/verify` | Verify a land parcel |
| POST | `/api/families/:fid/pay` | Release compensation |

## 🧭 Demo Walkthrough

1. Login and open the Dashboard.
2. Explore the GIS Land Map.
3. Select a district.
4. Open a project and view its route alignment.
5. Explore acquisition and compensation workflows.
6. Review Alerts & Risk.

## 🛠️ Technology Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js
- **Geospatial data:** GeoJSON
- **Database design:** PostgreSQL and PostGIS schema
- **Build and testing:** Node.js and Python

## 👥 Team & Credits

**Team:** HEXA FORGE · LIET

**Repository Owner & Maintainer:** Mohd Shahid Moinuddin

**Original Co-developer:** Abaid Khan

This repository is maintained by Mohd Shahid Moinuddin. The project was originally developed collaboratively. Original project history and contributions are retained.

---

*Developed as a Smart India Hackathon 2026 project for land acquisition management and rural development.*