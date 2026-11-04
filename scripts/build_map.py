import json, math

data = json.load(open('data/telangana.geojson'))
feats = data['features']

# Project lon/lat -> x,y (equirectangular w/ latitude correction), gather bounds
K = math.cos(math.radians(17.8))

def proj_ring(ring):
    return [(lon * K, -lat) for lon, lat in ring]

def rings_of(feat):
    g = feat['geometry']
    if g['type'] == 'Polygon':
        return [g['coordinates'][0]]
    return [poly[0] for poly in g['coordinates']]  # outer rings only

allpts = []
for f in feats:
    for r in rings_of(f):
        allpts.extend(proj_ring(r))
xs = [p[0] for p in allpts]; ys = [p[1] for p in allpts]
minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
S = 1000.0 / max(maxx - minx, maxy - miny)

def tx(p):
    return (p[0] - minx) * S, (p[1] - miny) * S

def simplify(pts, tol=1.6):
    out = [pts[0]]
    for p in pts[1:]:
        if abs(p[0]-out[-1][0]) + abs(p[1]-out[-1][1]) >= tol:
            out.append(p)
    return out

def path_of(pts):
    pts = simplify([tx(p) for p in pts])
    d = 'M' + ' '.join(f'{x:.1f} {y:.1f}' for x, y in pts) + 'Z'
    cx = sum(p[0] for p in pts)/len(pts); cy = sum(p[1] for p in pts)/len(pts)
    return d, round(cx), round(cy)

out = []
state = []
for f in sorted(feats, key=lambda f: f['properties']['district']):
    name = f['properties']['district']
    ds = []; cxs = []; cys = []
    for r in rings_of(f):
        d, cx, cy = path_of(r)
        ds.append(d); cxs.append(cx); cys.append(cy)
    # biggest ring by path length approx = use the one with most points
    main = max(ds, key=len)
    i = ds.index(main)
    out.append({'n': name, 'd': main, 'cx': cxs[i], 'cy': cys[i]})
    state.extend(ds)

js = 'const MAP={districts:[' + ','.join(json.dumps(o, separators=(',',':')) for o in out) + '],state:"' + ' '.join(state) + '"};'
open('map_data.js', 'w').write(js)
print('districts:', len(out), '| js size KB:', round(len(js)/1024))
