/* NLAMS · REST route table — method + pattern + param names → controller */
const ctrl = require('../controllers/api.controller');

const routes = [
  ['GET',    /^\/api\/health$/,  [],                          ctrl.health],
  ['GET',    /^\/api\/kpi$/,     [],                          ctrl.kpi],
  ['GET',    /^\/api\/districts$/, [],                        ctrl.districts],
  ['GET',    /^\/api\/districts\/([^/]+)$/, ['name'],        ctrl.district],
  ['GET',    /^\/api\/projects$/, [],                         ctrl.projects],
  ['GET',    /^\/api\/projects\/([^/]+)$/, ['id'],           ctrl.project],
  ['GET',    /^\/api\/projects\/([^/]+)\/alignment$/, ['id'], ctrl.alignment],
  ['GET',    /^\/api\/alerts$/,  [],                          ctrl.alerts],
  ['GET',    /^\/api\/users$/,   [],                          ctrl.users],
  ['GET',    /^\/api\/payments$/, [],                         ctrl.payments],
  ['POST',   /^\/api\/projects\/([^/]+)\/parcels\/([^/]+)\/verify$/, ['id', 'parcelId'], ctrl.verifyParcel],
  ['POST',   /^\/api\/families\/([^/]+)\/pay$/, ['familyId'], ctrl.payFamily],
];

function handle(req, res, url) {
  for (const [method, re, names, fn] of routes) {
    if (req.method !== method) continue;
    const m = url.pathname.match(re);
    if (!m) continue;
    req.params = {};
    names.forEach((n, i) => { req.params[n] = decodeURIComponent(m[i + 1]); });
    return fn(req, res);
  }
  res.status(404).json({ error: 'route not found', hint: 'GET /api/health' });
}
module.exports = { handle };
