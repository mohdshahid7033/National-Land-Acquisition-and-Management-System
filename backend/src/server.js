/* ============================================================================
 * NLAMS · HTTP server — Node std-lib ONLY (zero npm dependencies)
 * ---------------------------------------------------------------------------
 *  · serves the frontend SPA          →  /
 *  · serves the single-file bundle    →  /dist/index.html
 *  · serves docs / SIH decks          →  /docs/…
 *  · REST API (shared domain core)    →  /api/…
 * ==========================================================================*/
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const ROOT = path.resolve(__dirname, '../..');   /* project root */
const routes = require('./routes');

const PORT = process.env.PORT || 8080;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.geojson': 'application/geo+json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml',
  '.md': 'text/markdown', '.pdf': 'application/pdf',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.sql': 'text/plain',
};

function sendJSON(res, code, obj) {
  const body = JSON.stringify(obj, null, 2);
  res.writeHead(code, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) });
  res.end(body);
}

function serveStatic(res, rel) {
  const file = path.normalize(path.join(ROOT, rel));
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end('forbidden'); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('404 not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  });
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);

  if (parsed.pathname.startsWith('/api/')) {
    /* collect body for POST */
    let raw = '';
    req.on('data', c => raw += c);
    req.on('end', () => {
      req.query = parsed.query;
      req.body = raw ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : {};
      res.json  = obj => sendJSON(res, 200, obj);          /* express-style */
      res.status = c => ({ json: obj => sendJSON(res, c, obj) });
      try { routes.handle(req, res, parsed); }
      catch (e) { sendJSON(res, 500, { error: String(e.message || e) }); }
    });
    return;
  }

  /* static */
  let file = decodeURIComponent(parsed.pathname);
  if (file === '/') file = '/frontend/index.html';
  else if (file.startsWith('/assets/')) {
    /* images/assets are in frontend/src/assets/ */
    file = '/frontend/src' + file;
  } else if (!file.startsWith('/frontend') && !file.startsWith('/dist') &&
           !file.startsWith('/docs') && !file.startsWith('/data')) {
    file = '/frontend' + file;                    /* SPA assets live under /frontend */
  }
  serveStatic(res, file.slice(1));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`NLAMS backend online → http://localhost:${PORT}`);
  console.log(`  SPA      /                 (frontend/index.html)`);
  console.log(`  API      /api/health       (try it)`);
  console.log(`  bundle   /dist/index.html  (offline single file)`);
});
