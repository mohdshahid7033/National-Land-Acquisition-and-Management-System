/* ============================================================================
 * NLAMS · PostgreSQL database service
 * ---------------------------------------------------------------------------
 * Connects to PostgreSQL, runs schema setup, auto-seeds mock data,
 * and falls back gracefully to in-memory mode if DB is unavailable.
 * ==========================================================================*/
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const config = {
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'postgres',
  database: process.env.PGDATABASE || 'postgres', // default to postgres to ensure initial connection
};

if (process.env.DATABASE_URL) {
  config.connectionString = process.env.DATABASE_URL;
}

let pool = null;
let isConnected = false;

// Attempt connection
async function init() {
  console.log(`[DB] Attempting connection to PostgreSQL at ${config.host}:${config.port}...`);
  pool = new Pool(config);

  try {
    const client = await pool.connect();
    console.log('[DB] PostgreSQL connection established successfully.');
    isConnected = true;
    client.release();

    // Check if target database exists or schema needs initialization
    await setupSchemaAndSeed();
  } catch (err) {
    console.warn('[DB] WARNING: PostgreSQL connection failed. Falling back to in-memory mode.');
    console.warn(`     Error details: ${err.message}`);
    isConnected = false;
    pool = null;
  }
}

async function query(text, params) {
  if (!isConnected || !pool) {
    throw new Error('Database is in offline fallback mode.');
  }
  return pool.query(text, params);
}

function getStatus() {
  return isConnected;
}

async function setupSchemaAndSeed() {
  try {
    // Check if PostGIS extension is available
    await query('CREATE EXTENSION IF NOT EXISTS postgis;');
    
    // Check if projects table exists
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'projects'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('[DB] Core tables missing. Building schema from schema.sql...');
      const schemaPath = path.join(__dirname, '../models/schema.sql');
      let schemaSql = fs.readFileSync(schemaPath, 'utf8');
      
      // Clean comments that reportlab/pg might trip on if executing block
      schemaSql = schemaSql.replace(/--.*/g, '');
      
      await query(schemaSql);
      console.log('[DB] Schema successfully initialized.');
      
      // Seed districts geometry and datasets
      await seedDatabase();
    } else {
      console.log('[DB] Schema already initialized. Ready.');
    }
  } catch (err) {
    console.error('[DB] Schema setup failed. Falling back to simple in-memory mode.');
    console.error(err);
    isConnected = false;
    pool = null;
  }
}

async function seedDatabase() {
  console.log('[DB] Seeding database with initial Telangana datasets...');
  const domain = require('./domain');
  const { PROJECTS, ALERTS, USERS, famRows, parcelsFor } = domain;

  try {
    // 1. Seed Districts
    const geojsonPath = path.resolve(__dirname, '../../../data/telangana.geojson');
    if (fs.existsSync(geojsonPath)) {
      const geojson = JSON.parse(fs.readFileSync(geojsonPath, 'utf8'));
      console.log(`[DB] Parsing and seeding ${geojson.features.length} districts from telangana.geojson...`);
      for (const feat of geojson.features) {
        const name = feat.properties.district;
        const geomJson = JSON.stringify(feat.geometry);
        await query(`
          INSERT INTO districts (name, geom, centroid)
          VALUES ($1, ST_Multi(ST_GeomFromGeoJSON($2))::geography, ST_Centroid(ST_GeomFromGeoJSON($2)::geography))
          ON CONFLICT (name) DO NOTHING;
        `, [name, geomJson]);
      }
    } else {
      // Minimal districts fallback if geojson missing
      console.warn('[DB] Warning: telangana.geojson not found. Seeding minimal districts.');
      const distNames = [...new Set(PROJECTS.flatMap(p => p.dists))];
      for (const name of distNames) {
        await query(`
          INSERT INTO districts (name, geom, centroid)
          VALUES ($1, ST_GeographyFromText('MULTIPOLYGON(((78 17, 78 18, 79 18, 79 17, 78 17)))'), ST_GeographyFromText('POINT(78.5 17.5)'))
          ON CONFLICT (name) DO NOTHING;
        `, [name]);
      }
    }

    // 2. Seed Users
    console.log('[DB] Seeding users...');
    for (const u of USERS) {
      await query(`
        INSERT INTO users (name, role, department, level, status)
        VALUES ($1, $2, $3, $4, 'Active');
      `, [u.name, u.role, u.dept, u.level]);
    }

    // 3. Seed Projects
    console.log('[DB] Seeding projects and alignments...');
    for (const p of PROJECTS) {
      await query(`
        INSERT INTO projects (id, name, sector, department, status, stage, land_ha, acq_pct, progress_pct, risk_score, budget_cr, families, started_on)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (id) DO NOTHING;
      `, [p.id, p.name, p.sector, p.dept, p.status, p.stage, p.land, p.acq, p.prog, p.risk, p.budget, p.fam, p.started]);

      // Seed project districts
      for (const dist of p.dists) {
        await query(`
          INSERT INTO project_districts (project_id, district)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING;
        `, [p.id, dist]);
      }

      // Seed dynamic parcels
      const parcels = parcelsFor(p);
      for (const parcel of parcels) {
        await query(`
          INSERT INTO parcels (id, project_id, survey_no, owner_name, category, area_ha, village, stage, geom)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL)
          ON CONFLICT (project_id, survey_no) DO NOTHING;
        `, [parcel.id, p.id, parcel.survey, parcel.owner, parcel.cat, parcel.area, parcel.village, parcel.stage]);
      }

      // Seed families and mock payments
      const families = famRows(p, 25);
      for (const fam of families) {
        await query(`
          INSERT INTO families (id, head, category, village, district, land_ha, award_lakh, project_id, rr_status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO NOTHING;
        `, [fam.id, fam.head, fam.cat, fam.village, p.dists[0], fam.area, fam.award, p.id, fam.rr ? 'Completed' : 'In Progress']);

        if (fam.paid) {
          await query(`
            INSERT INTO payments (family_id, amount, utr, released_at)
            VALUES ($1, $2, $3, now() - INTERVAL '5 days')
            ON CONFLICT DO NOTHING;
          `, [fam.id, fam.award * 100000, 'UTR' + Date.now() + Math.floor(Math.random() * 1000)]);
        }
      }
    }

    // 4. Seed Alerts
    console.log('[DB] Seeding alerts...');
    for (const a of ALERTS) {
      await query(`
        INSERT INTO alerts (id, severity, project_id, title, description, score, recommended)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO NOTHING;
      `, [a.id, a.sev, a.prj, a.title, a.desc, a.score, a.action]);
    }

    console.log('[DB] Database seeding completed successfully.');
  } catch (err) {
    console.error('[DB] Seeding failed:', err);
  }
}

// Initialise DB connection on import
init();

module.exports = {
  query,
  isConnected: getStatus,
  pool,
};
