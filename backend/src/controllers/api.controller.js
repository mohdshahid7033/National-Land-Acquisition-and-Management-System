/* ============================================================================
 * NLAMS · API controllers
 * ---------------------------------------------------------------------------
 * REST layer over the shared domain and database persistence.
 * Exposes SQL operations when PostgreSQL is connected, falling back
 * gracefully to VM domain core operations.
 * ==========================================================================*/
const domain = require('../services/domain');
const db = require('../services/db');

const { routeFor, fitRouteVB, syncDB } = domain;

// Helper to refresh in-memory VM cache with DB rows
const ensureSync = async () => {
  if (db.isConnected()) {
    await syncDB();
  }
};

/* ---- health ------------------------------------------------------------ */
exports.health = async (req, res) => {
  res.json({
    ok: true,
    service: 'nlams-backend',
    version: '1.0.0',
    mode: db.isConnected() ? 'persistent (PostgreSQL)' : 'prototype (in-memory store)',
    time: new Date().toISOString(),
  });
};

/* ---- KPIs & aggregates ------------------------------------------------- */
exports.kpi = async (req, res) => {
  await ensureSync();
  res.json(domain.KPI);
};

exports.districts = async (req, res) => {
  await ensureSync();
  res.json(
    domain.MAP.districts.map(d => ({
      name: d.n, centroid: [d.cx, d.cy], bbox: d.b,
      aggregate: domain.DAGG[d.n],
    }))
  );
};

exports.district = async (req, res) => {
  await ensureSync();
  const meta = domain.MAP.districts.find(d => d.n === req.params.name);
  if (!meta) return res.status(404).json({ error: 'district not found' });
  res.json({
    name: meta.n,
    centroid: [meta.cx, meta.cy],
    bbox: meta.b,
    aggregate: domain.DAGG[req.params.name] || null,
  });
};

/* ---- projects ---------------------------------------------------------- */
exports.projects = async (req, res) => {
  await ensureSync();
  const q = (req.query.q || '').toLowerCase();
  const rows = domain.PROJECTS.filter(p =>
    !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) ||
    p.dists.join(' ').toLowerCase().includes(q));
  res.json(rows);
};

exports.project = async (req, res) => {
  await ensureSync();
  const p = domain.PROJECTS.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'project not found' });

  let preview = [];
  if (db.isConnected()) {
    try {
      const famsRes = await db.query(
        `SELECT f.id, f.head, f.category AS cat, f.village, f.land_ha AS area, f.award_lakh AS award, 
                (CASE WHEN py.id IS NOT NULL THEN true ELSE false END) AS paid,
                (CASE WHEN f.rr_status = 'Completed' THEN true ELSE false END) AS rr
         FROM families f
         LEFT JOIN payments py ON py.family_id = f.id
         WHERE f.project_id = $1 LIMIT 8;`,
        [p.id]
      );
      preview = famsRes.rows.map(r => ({
        id: r.id,
        head: r.head,
        cat: r.cat,
        village: r.village,
        area: parseFloat(r.area || 0),
        award: parseFloat(r.award || 0),
        paid: r.paid,
        rr: r.rr
      }));
    } catch (err) {
      console.error('[DB] Fetch families preview failed:', err);
      preview = domain.famRows(p, 8);
    }
  } else {
    preview = domain.famRows(p, 8);
    // Sync paid status from domain.S.paid in mock mode fallback
    preview.forEach(f => {
      if (domain.S.paid[p.id + ':' + f.id]) {
        f.paid = true;
      }
    });
  }

  res.json({ ...p, familiesPreview: preview });
};

/* ---- GIS: alignment corridor ------------------------------------------- */
exports.alignment = async (req, res) => {
  await ensureSync();
  const p = domain.PROJECTS.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'project not found' });
  const cor = domain.corridorFor(p);

  // Overlay verDone in mock fallback mode
  const parcels = cor.parcels.map(x => {
    let stage = x.stage;
    if (!db.isConnected()) {
      if (domain.S.verDone[p.id] && domain.S.verDone[p.id].has(x.id)) {
        stage = 'Verified';
      }
    }
    return {
      id: x.id, survey: x.survey, owner: x.owner, category: x.cat,
      areaHa: x.area, village: x.village, stage: stage,
      workflowPosition: +(x.t.toFixed(3)), polygon: x.poly,
    };
  });

  res.json({
    projectId: p.id,
    name: p.name,
    districts: p.dists,
    acquisitionPct: p.acq,
    stage: p.stage,
    route: { points: routeFor(p).pts, closed: routeFor(p).closed, lengthPx: routeFor(p).len },
    viewBox: fitRouteVB(p),
    parcels: parcels,
    stagePalette: { ...domain.PCL_COL, Disputed: '#ef4444' },
  });
};

/* ---- alerts ------------------------------------------------------------- */
exports.alerts = async (req, res) => {
  await ensureSync();
  res.json(domain.ALERTS);
};

/* ---- users -------------------------------------------------------------- */
exports.users = async (req, res) => {
  await ensureSync();
  res.json(domain.USERS);
};

/* ---- payments ----------------------------------------------------------- */
exports.payments = async (req, res) => {
  if (db.isConnected()) {
    try {
      const resPay = await db.query('SELECT family_id FROM payments;');
      res.json(resPay.rows.map(r => r.family_id));
    } catch (e) {
      console.error('[DB] Fetch payments failed:', e);
      res.json([]);
    }
  } else {
    const paidList = [];
    for (const key in domain.S.paid) {
      if (domain.S.paid[key]) {
        const parts = key.split(':');
        paidList.push(parts[1] || parts[0]);
      }
    }
    res.json(paidList);
  }
};

/* ---- writes (prototype in-memory actions / DB writes) ------------------ */
exports.verifyParcel = async (req, res) => {
  const p = domain.PROJECTS.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: 'project not found' });
  const parcel = domain.parcelsFor(p).find(x => x.id === req.params.parcelId);
  if (!parcel) return res.status(404).json({ error: 'parcel not found' });

  if (db.isConnected()) {
    try {
      await db.query(
        `UPDATE parcels 
         SET stage = 'Verified', verified_on = now() 
         WHERE project_id = $1 AND id = $2;`,
        [p.id, parcel.id]
      );
      await ensureSync();
    } catch (err) {
      console.error('[DB] Verify parcel DB write failed:', err);
      domain.S.verDone[p.id].add(parcel.id);
    }
  } else {
    domain.S.verDone[p.id].add(parcel.id);
  }

  res.json({
    ok: true, projectId: p.id, parcelId: parcel.id,
    verified: domain.S.verDone[p.id].size,
    message: `Parcel ${parcel.survey} GPS-verified (Dharani match pending sync)`
  });
};

exports.payFamily = async (req, res) => {
  const amount = req.body && req.body.amount;
  if (!amount) return res.status(400).json({ error: 'body { amount } required' });

  const utr = 'UTR' + Date.now();
  if (db.isConnected()) {
    try {
      // Insert payment release
      await db.query(
        `INSERT INTO payments (family_id, amount, utr, released_at) 
         VALUES ($1, $2, $3, now());`,
        [req.params.familyId, amount * 100000, utr]
      );
      // Update family rr_status to Completed
      await db.query(
        `UPDATE families SET rr_status = 'Completed' WHERE id = $1;`,
        [req.params.familyId]
      );

      // Update matching parcel status to Compensated as well
      const fDetail = await db.query('SELECT head, project_id FROM families WHERE id = $1;', [req.params.familyId]);
      if (fDetail.rows.length > 0) {
        const prjId = fDetail.rows[0].project_id;
        const ownerName = fDetail.rows[0].head;
        await db.query(
          `UPDATE parcels SET stage = 'Compensated' WHERE project_id = $1 AND owner_name = $2;`,
          [prjId, ownerName]
        );
      }

      await ensureSync();
    } catch (err) {
      console.error('[DB] Pay family DB write failed:', err);
      domain.S.paid[req.params.familyId] = 1;
    }
  } else {
    let prjId = 'NLAMS-TG-003';
    const matchedPrj = domain.PROJECTS.find(p => domain.famRows(p, 25).some(f => f.id === req.params.familyId));
    if (matchedPrj) prjId = matchedPrj.id;
    domain.S.paid[prjId + ':' + req.params.familyId] = 1;
  }

  res.json({
    ok: true, familyId: req.params.familyId,
    utr, amount,
    message: 'Compensation released via CFMS-DBT'
  });
};
