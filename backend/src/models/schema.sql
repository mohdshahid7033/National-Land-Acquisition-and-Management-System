-- ============================================================================
-- NLAMS · production data model (PostgreSQL + PostGIS)
-- ---------------------------------------------------------------------------
-- The prototype runs on an in-memory store (frontend/shared domain). This is
-- the target schema for production deployment; every API module in
-- ../controllers maps 1:1 onto these tables.
-- ==========================================================================*/

CREATE EXTENSION IF NOT EXISTS postgis;

-- ── master data ─────────────────────────────────────────────────────────────
CREATE TABLE districts (
  name          TEXT PRIMARY KEY,               -- e.g. 'Sangareddy'
  geom          GEOGRAPHY(MULTIPOLYGON, 4326) NOT NULL,
  centroid      GEOGRAPHY(POINT, 4326)
);

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN
                 ('Central Authority','State Authority','District Authority','Field Officer','Viewer')),
  department    TEXT,
  level         TEXT CHECK (level IN ('Central','State','District','Field')),
  status        TEXT DEFAULT 'Active'
);

-- ── acquisition core ────────────────────────────────────────────────────────
CREATE TABLE projects (
  id            TEXT PRIMARY KEY,               -- 'NLAMS-TG-001'
  name          TEXT NOT NULL,
  sector        TEXT,
  department    TEXT,
  status        TEXT CHECK (status IN ('On Track','At Risk','Delayed')),
  stage         TEXT CHECK (stage IN ('Proposal','Scrutiny','Notification',
                                      'Verification','Award','Possession','Compensation')),
  land_ha       NUMERIC, acq_pct NUMERIC, progress_pct NUMERIC,
  risk_score    INT CHECK (risk_score BETWEEN 0 AND 100),
  budget_cr     NUMERIC, families INT,
  started_on    DATE
);

CREATE TABLE project_districts (
  project_id    TEXT REFERENCES projects,
  district      TEXT REFERENCES districts,
  PRIMARY KEY (project_id, district)
);

CREATE TABLE parcels (
  id            TEXT PRIMARY KEY,               -- 'SP-01'
  project_id    TEXT REFERENCES projects,
  survey_no     TEXT NOT NULL,
  owner_name    TEXT, category TEXT,            -- SC/ST/BC/OBC/Gen
  area_ha       NUMERIC,
  village       TEXT,
  stage         TEXT CHECK (stage IN ('Notified','Verified','Awarded',
                                      'Possession','Compensated','Disputed')),
  geom          GEOGRAPHY(POLYGON, 4326),       -- cadastral boundary
  verified_on   TIMESTAMPTZ,
  UNIQUE (project_id, survey_no)
);

CREATE TABLE families (
  id            TEXT PRIMARY KEY,               -- 'F-1234'
  head          TEXT NOT NULL, category TEXT,
  village       TEXT, district TEXT REFERENCES districts,
  land_ha       NUMERIC,
  award_lakh    NUMERIC,
  project_id    TEXT REFERENCES projects,
  rr_status     TEXT DEFAULT 'In Progress'
);

CREATE TABLE payments (
  id            SERIAL PRIMARY KEY,
  family_id     TEXT REFERENCES families,
  amount        NUMERIC NOT NULL,
  mode          TEXT DEFAULT 'CFMS-DBT',
  utr           TEXT UNIQUE,
  released_at   TIMESTAMPTZ DEFAULT now(),
  sla_days      INT GENERATED ALWAYS AS
                 (EXTRACT(day FROM now() - released_at)) STORED
);

-- ── alerts / risk ───────────────────────────────────────────────────────────
CREATE TABLE alerts (
  id            TEXT PRIMARY KEY,               -- 'A-101'
  severity      TEXT CHECK (severity IN ('Critical','High','Medium','Info')),
  project_id    TEXT REFERENCES projects,
  title         TEXT NOT NULL, description TEXT,
  score         INT CHECK (score BETWEEN 0 AND 100),
  recommended   TEXT,
  raised_at     TIMESTAMPTZ DEFAULT now()
);

-- ── documents & audit ───────────────────────────────────────────────────────
CREATE TABLE documents (
  id            TEXT PRIMARY KEY,
  project_id    TEXT REFERENCES projects,
  type          TEXT, name TEXT NOT NULL,
  version       TEXT, status TEXT, uploaded_by TEXT,
  uploaded_at   TIMESTAMPTZ DEFAULT now(),
  file_ref      TEXT                             -- object-store key
);

CREATE TABLE audit_log (
  id            BIGSERIAL PRIMARY KEY,
  actor         TEXT NOT NULL,
  action        TEXT NOT NULL,                  -- 'parcel.verify', 'payment.release'…
  entity        TEXT NOT NULL,
  payload       JSONB,
  at            TIMESTAMPTZ DEFAULT now()
);

-- typical queries served by the API ------------------------------------------
--  SELECT * FROM v_district_progress;                     /api/districts
--  SELECT * FROM parcels WHERE project_id = $1;           /api/projects/:id
--  SELECT * FROM alerts ORDER BY score DESC;              /api/alerts
