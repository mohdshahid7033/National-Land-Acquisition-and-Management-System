/* ============================================================================
 * NLAMS · shared domain service
 * ---------------------------------------------------------------------------
 * Loads the SAME plain-JS domain modules the frontend uses (config, utils,
 * map geometry, dataset, GIS engine, state) into an isolated VM context and
 * exposes them to the API. One source of truth for business logic —
 * the frontend renders it, the backend serves it, nothing drifts.
 * ==========================================================================*/
/* ============================================================================
 * NLAMS · shared domain service
 * ---------------------------------------------------------------------------
 * Loads the SAME plain-JS domain modules the frontend uses into an isolated
 * VM context, exposes them to the API, and supports database state sync.
 * ==========================================================================*/
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const db = require('./db');

const SRC = path.resolve(__dirname, '../../../frontend/src/js');

const FILES = [
  '01-config.js', '02-utils.js', '03-map-data.js',
  '04-data.js', '05-engine.js', '06-state.js',
];

let vmContext = null;

function load() {
  const code = FILES
    .map(f => fs.readFileSync(path.join(SRC, f), 'utf8'))
    .join('\n;\n');
  const expr = `
    ;({ PROJECTS, ALERTS, USERS, MAP, OWNER_NAMES, CATS, STAGES,
        ST_COL, ST_BG, PCL_COL, PCL_DISPUTED,
        KPI, DAGG, distColor, routeFor, corridorFor, parcelsFor,
        fitRouteVB, famRows, S, inr, rng, parcelsFor });`;
  
  vmContext = vm.createContext({
    console: { log: () => {}, warn: () => {}, error: () => {} },
    sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  });
  
  return vm.runInContext(code + expr, vmContext, { filename: 'nlams-domain.js' });
}

const exported = load();

async function syncDB() {
  if (!db.isConnected()) return;

  try {
    // 1. Fetch project districts junction map
    const pdRes = await db.query('SELECT * FROM project_districts;');
    const projDists = {};
    pdRes.rows.forEach(r => {
      if (!projDists[r.project_id]) projDists[r.project_id] = [];
      projDists[r.project_id].push(r.district);
    });

    // 2. Fetch distinct villages from parcels
    const pvRes = await db.query('SELECT DISTINCT project_id, village FROM parcels WHERE village IS NOT NULL;');
    const projVils = {};
    pvRes.rows.forEach(r => {
      if (!projVils[r.project_id]) projVils[r.project_id] = [];
      projVils[r.project_id].push(r.village);
    });

    // 3. Fetch projects
    const pRes = await db.query('SELECT * FROM projects ORDER BY id;');
    const dbProjects = pRes.rows.map(r => ({
      id: r.id,
      name: r.name,
      sector: r.sector,
      dept: r.department,
      dists: projDists[r.id] || [],
      land: parseFloat(r.land_ha || 0),
      acq: parseFloat(r.acq_pct || 0),
      prog: parseFloat(r.progress_pct || 0),
      status: r.status,
      risk: r.risk_score || 0,
      fam: r.families || 0,
      budget: parseFloat(r.budget_cr || 0),
      stage: r.stage,
      started: r.started_on ? new Date(r.started_on).toISOString().split('T')[0] : '',
      vil: projVils[r.id] || [],
      avgL: 25 // standard prototype fallback average land value benchmark
    }));

    // 4. Fetch alerts
    const aRes = await db.query('SELECT * FROM alerts ORDER BY id;');
    const dbAlerts = aRes.rows.map(r => ({
      id: r.id,
      sev: r.severity,
      prj: r.project_id,
      title: r.title,
      desc: r.description,
      score: r.score,
      when: '1 day ago',
      action: r.recommended
    }));

    // 5. Fetch users
    const uRes = await db.query('SELECT * FROM users;');
    const dbUsers = uRes.rows.map(r => ({
      name: r.name,
      role: r.role,
      dept: r.department,
      level: r.level,
      status: r.status,
      last: 'Online now'
    }));

    // 6. Fetch parcels
    const parcelRes = await db.query('SELECT id, project_id, stage, owner_name, category, area_ha, village, survey_no FROM parcels;');
    const dbParcels = parcelRes.rows;

    // 7. Fetch payments
    const paymentRes = await db.query('SELECT family_id FROM payments;');
    const dbPayments = paymentRes.rows.map(r => r.family_id);

    // Sync arrays and mappings inside the VM context
    vmContext.dbProjects = dbProjects;
    vmContext.dbAlerts = dbAlerts;
    vmContext.dbUsers = dbUsers;
    vmContext.dbParcels = dbParcels.map(p => ({
      id: p.id,
      project_id: p.project_id,
      stage: p.stage,
      owner_name: p.owner_name,
      category: p.category,
      area_ha: parseFloat(p.area_ha || 0),
      village: p.village,
      survey_no: p.survey_no,
    }));
    vmContext.dbPayments = dbPayments;

    const syncCode = `
      (function(projects, alerts, users, parcels, payments) {
        PROJECTS.length = 0;
        PROJECTS.push(...projects);
        
        ALERTS.length = 0;
        ALERTS.push(...alerts);
        
        USERS.length = 0;
        USERS.push(...users);
        
        // Reset verDone
        PROJECTS.forEach(p => S.verDone[p.id] = new Set());
        parcels.forEach(p => {
          if (p.stage === 'Verified' || p.stage === 'Awarded' || p.stage === 'Possession' || p.stage === 'Compensated') {
            if (S.verDone[p.project_id]) S.verDone[p.project_id].add(p.id);
          }
        });

        // Sync paid state
        PROJECTS.forEach(p => {
          payments.forEach(fid => {
            S.paid[p.id + ':' + fid] = 1;
          });
        });

        // Clear corridor cache
        for (const k in CORR) {
          delete CORR[k];
        }
        
        // Recalculate spatial aggregates
        MAP.districts.forEach(d => DAGG[d.n] = null);
        PROJECTS.forEach(p => p.dists.forEach(dn => {
          if (!DAGG[dn]) DAGG[dn] = { prjs: [], land: 0, fam: 0, risk: 0, status: 'On Track' };
          const a = DAGG[dn];
          a.prjs.push(p.id);
          a.land += p.land;
          a.fam += p.fam;
          a.risk = Math.max(a.risk, p.risk);
          if (RANK[p.status] > RANK[a.status]) a.status = p.status;
        }));
        
        Object.values(DAGG).forEach(a => {
          if (a && a.land > 0) {
            a.prog = Math.round(a.prjs.reduce((s, id) => s + prj(id).prog * prj(id).land, 0) / a.land);
          }
        });

        // Recompute KPI
        KPI.projects = PROJECTS.length;
        KPI.land = 0;
        KPI.acq = 0;
        KPI.fam = 0;
        KPI.riskN = 0;
        KPI.comp = 0;
        KPI.compPaid = 0;
        KPI.prog = 0;
        
        PROJECTS.forEach(p => {
          KPI.land += p.land;
          KPI.acq += Math.round(p.land * p.acq / 100);
          KPI.fam += p.fam;
          if (p.status !== 'On Track') KPI.riskN++;
          KPI.comp += Math.round(p.land * p.acq / 100 * p.avgL * 1.18 / 100);
        });
        if (KPI.land > 0) {
          KPI.prog = Math.round(PROJECTS.reduce((s, p) => s + p.prog * p.land, 0) / KPI.land);
        }
        KPI.compPaid = Math.round(KPI.comp * 0.806);
      })(dbProjects, dbAlerts, dbUsers, dbParcels, dbPayments);
    `;

    vm.runInContext(syncCode, vmContext);

    // Override corridorFor and famRows inside the VM context to overlay database attributes
    const overrideCode = `
      if (!this._overridden) {
        const origCorridorFor = corridorFor;
        corridorFor = function(p) {
          const cor = origCorridorFor(p);
          cor.parcels.forEach(parcel => {
            const match = dbParcels.find(x => x.project_id === p.id && x.id === parcel.id);
            if (match) {
              parcel.stage = match.stage;
              parcel.owner = match.owner_name;
              parcel.cat = match.category;
              parcel.area = parseFloat(match.area_ha || 0);
              parcel.village = match.village;
              parcel.survey = match.survey_no;
            }
          });
          return cor;
        };
        this._overridden = true;
      }
    `;
    vm.runInContext(overrideCode, vmContext);

  } catch (err) {
    console.error('[DB] VM State Sync failed:', err);
  }
}

// Trigger initial database sync
syncDB();

module.exports = {
  ...exported,
  syncDB,
};
