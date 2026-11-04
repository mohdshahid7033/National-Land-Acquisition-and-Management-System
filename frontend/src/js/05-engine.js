/* =====================================================================
   05 · GIS ENGINE — the spatial brain:
   · DAGG/KPI district & state roll-ups · distColor() colour scales
   · routeFor(): Catmull-Rom alignment per project (ORR = closed ring)
   · corridorFor(): parcels strung along the route, each with its live
     acquisition-workflow stage · famRows(): affected-family records
   ===================================================================== */
/* ---------------- derived aggregates ---------------- */
const RANK={'On Track':1,'At Risk':2,'Delayed':3};
const DAGG={};
MAP.districts.forEach(d=>DAGG[d.n]=null);
PROJECTS.forEach(p=>p.dists.forEach(dn=>{
  if(!DAGG[dn])DAGG[dn]={prjs:[],land:0,fam:0,risk:0,status:'On Track'};
  const a=DAGG[dn];a.prjs.push(p.id);a.land+=p.land;a.fam+=p.fam;
  a.risk=Math.max(a.risk,p.risk);
  if(RANK[p.status]>RANK[a.status])a.status=p.status;
}));
Object.values(DAGG).forEach(a=>{
  if(a){a.prog=Math.round(a.prjs.reduce((s,id)=>s+prj(id).prog*prj(id).land,0)/a.land);}
});
const KPI=(()=>{
  const k={projects:PROJECTS.length,land:0,acq:0,fam:0,riskN:0,comp:0,compPaid:0,prog:0};
  PROJECTS.forEach(p=>{k.land+=p.land;k.acq+=Math.round(p.land*p.acq/100);k.fam+=p.fam;
    if(p.status!=='On Track')k.riskN++;
    k.comp+=Math.round(p.land*p.acq/100*p.avgL*1.18/100);});
  k.prog=Math.round(PROJECTS.reduce((s,p)=>s+p.prog*p.land,0)/k.land);
  k.compPaid=Math.round(k.comp*0.806);return k;
})();

/* district color by mode */
function distColor(name,mode){
  const a=DAGG[name];
  if(!a)return '#e2e8f0';
  if(mode==='status')return ST_COL[a.status];
  if(mode==='progress'){const t=a.prog/100;return `rgb(${Math.round(240-140*t)},${Math.round(245-95*t)},${Math.round(248-180*t)})`;}
  const t=Math.min(a.risk,100)/100;return `rgb(${Math.round(248-140*t)},${Math.round(250-175*t)},${Math.round(252-160*t)})`;
}
function lerpHex(a,b,t){return '#'+[0,1,2].map(i=>Math.round(a[i]+(b[i]-a[i])*t).toString(16).padStart(2,'0')).join('');}

/* deterministic parcels per project+district */
const PCL_DISPUTED2='#ef4444';
const CORR = (typeof window !== 'undefined' ? window : globalThis).CORR = {};                                   /* corridor cache per project */

/* ---- route alignment geometry ---- */
function catmull(ctl,closed,n){
  const P=ctl,out=[];const get=i=>closed?P[(i+P.length)%P.length]:P[Math.max(0,Math.min(P.length-1,i))];
  const segs=closed?P.length:Math.max(1,P.length-1);
  for(let s=0;s<segs;s++){
    const p0=get(s-1),p1=get(s),p2=get(s+1),p3=get(s+2);
    const steps=Math.max(4,Math.round(n/segs));
    for(let t=0;t<steps;t++){const u=t/steps,u2=u*u,u3=u2*u;
      out.push([
        .5*((2*p1[0])+(-p0[0]+p2[0])*u+(2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*u2+(-p0[0]+3*p1[0]-3*p2[0]+p3[0])*u3),
        .5*((2*p1[1])+(-p0[1]+p2[1])*u+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*u2+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*u3)]);
    }
  }
  if(!closed&&P.length)out.push(P[P.length-1].slice());
  return out;
}
const dCen=n=>{const d=MAP.districts.find(x=>x.n===n);return [d.cx,d.cy];};
function routeFor(p){
  if(CORR[p.id])return CORR[p.id].route;
  const R=rng(p.id+'route');let wps=[],closed=false;
  if(p.id==='NLAMS-TG-003'){                     /* Warangal ORR — closed ring */
    const c=dCen('Warangal Urban');closed=true;
    const rx=112,ry=84,n=22;
    for(let i=0;i<n;i++){const a=i/n*2*Math.PI;
      wps.push([c[0]+Math.cos(a)*rx*(1+(R()-.5)*.16), c[1]+Math.sin(a)*ry*(1+(R()-.5)*.16)]);}
  } else {
    wps=p.dists.map(dCen);
    const ins=[];
    for(let i=0;i<wps.length-1;i++){
      ins.push(wps[i]);
      const mx=(wps[i][0]+wps[i+1][0])/2, my=(wps[i][1]+wps[i+1][1])/2;
      if(p.id==='NLAMS-TG-001') ins.push([mx,my-72]);          /* arc bows north around Hyderabad */
      else if(p.id==='NLAMS-TG-004') ins.push([mx+30,my+30]);  /* metro curves via outskirts */
      else ins.push([mx+(R()-.5)*90, my+(R()-.5)*90]);         /* natural S-curve */
    }
    ins.push(wps[wps.length-1]);wps=ins;
  }
  const pts=catmull(wps,closed,150).map((q,i)=>[q[0]+Math.sin(i*.7)*5+(R()-.5)*5, q[1]+Math.cos(i*.5)*4+(R()-.5)*5]);
  let len=0;for(let i=1;i<pts.length;i++)len+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);
  return {pts,closed,len:Math.round(len)};
}
function fitRouteVB(p){
  const rt=routeFor(p).pts;
  const x0=Math.min(...rt.map(q=>q[0]))-80,y0=Math.min(...rt.map(q=>q[1]))-80;
  return [x0,y0,Math.max(...rt.map(q=>q[0]))-x0+80,Math.max(...rt.map(q=>q[1]))-y0+80];
}
/* =====================================================================
   CADASTRAL PARCEL FABRIC — topology-preserving grid subdivision.

   WHY the previous approach was wrong:
   It generated three independent linear strips along the route normal
   (inner row + left row + right row), creating radial chevron shapes
   with no shared boundaries between rows.

   CORRECT approach used here:
   1. Compute bounding box around the route (with padding).
   2. Build a (ROWS+1) × (COLS+1) grid of vertices, perturbing ONLY
      interior vertices.  Adjacent cells share the exact same vertex
      objects → guaranteed shared boundaries, no gaps or overlaps.
   3. Optionally subdivide interior cells (horizontal or vertical split)
      with a shared dividing edge for natural size variation.
   4. For each parcel centroid, compute minimum distance to 80 sampled
      route points → real spatial intersection, no hardcoding.
   5. Affected (IP-*) parcels straddle the route corridor.
      Outer (OP-*) parcels are outside it.
   ===================================================================== */
function corridorFor(p){
  if(CORR[p.id])return CORR[p.id];
  const route=routeFor(p);const R=rng(p.id+'cor');const pts=route.pts;
  const acq=p.acq/100;const parcels=[];

  /* ── Pre-sample route (80 pts) for O(1)-ish proximity queries ── */
  const RS=[];
  for(let i=0;i<80;i++)RS.push(pts[Math.round(i*(pts.length-1)/79)]);

  function distToRoute(x,y){
    let d=Infinity;
    for(const r of RS){const dd=Math.hypot(r[0]-x,r[1]-y);if(dd<d)d=dd;}
    return d;
  }
  /* Normalized t of nearest sampled route point */
  function routeT(x,y){
    let d=Infinity,idx=0;
    for(let i=0;i<RS.length;i++){const dd=Math.hypot(RS[i][0]-x,RS[i][1]-y);if(dd<d){d=dd;idx=i;}}
    return idx/(RS.length-1);
  }

  /* ── Bounding box around route ────────────────────────────────── */
  let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;
  pts.forEach(q=>{x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);y0=Math.min(y0,q[1]);y1=Math.max(y1,q[1]);});
  const PAD=96;
  x0-=PAD;x1+=PAD;y0-=PAD;y1+=PAD;
  const W=x1-x0,H=y1-y0;

  /* ── Perturbed grid ──────────────────────────────────────────── */
  /* Target cell ≈ 42 SVG units wide → natural parcel size in zoomed view */
  const COLS=Math.max(5,Math.min(12,Math.round(W/42)));
  const ROWS=Math.max(4,Math.min(8,Math.round(H/42)));
  const cW=W/COLS,cH=H/ROWS;

  /* G[r][c] = [x,y].  Boundary vertices fixed, interior perturbed ≤45%. */
  const G=[];
  for(let r=0;r<=ROWS;r++){
    G.push([]);
    for(let c=0;c<=COLS;c++){
      const bx=x0+c*cW,by=y0+r*cH;
      const edge=(r===0||r===ROWS||c===0||c===COLS);
      const px=edge?0:(R()-.5)*cW*0.9;
      const py=edge?0:(R()-.5)*cH*0.9;
      G[r].push([bx+px,by+py]);
    }
  }

  /* ── Helpers ─────────────────────────────────────────────────── */
  const polyStr=vs=>vs.map(([x,y])=>x.toFixed(1)+','+y.toFixed(1)).join(' ');
  const centroid=vs=>[vs.reduce((s,v)=>s+v[0],0)/vs.length,vs.reduce((s,v)=>s+v[1],0)/vs.length];

  /* Shoelace polygon area (SVG units²) */
  function polyArea(vs){
    let a=0,n=vs.length;
    for(let i=0;i<n;i++){const j=(i+1)%n;a+=vs[i][0]*vs[j][1]-vs[j][0]*vs[i][1];}
    return Math.abs(a)/2;
  }

  /* Stage assignment */
  function stageFor(t,affected){
    const rr=R();
    if(!affected)return rr<0.45?'Notified':'Verified';
    if(rr<0.055&&t>0.2)return 'Disputed';
    if(t<acq*0.8)return rr<0.68?'Compensated':rr<0.9?'Possession':'Awarded';
    if(t<acq)return rr<0.5?'Possession':'Awarded';
    if(t<acq+0.14)return 'Awarded';
    if(t<acq+0.46)return 'Verified';
    return 'Notified';
  }

  /* Corridor half-width for intersection test (SVG units).
     Slightly larger than visual corridor so edge-clipping parcels are included. */
  const CHW=32;
  let pIdx=0;

  /* ── Generate parcel cells ───────────────────────────────────── */
  for(let r=0;r<ROWS;r++){
    for(let c=0;c<COLS;c++){
      const tl=G[r][c],tr=G[r][c+1],br=G[r+1][c+1],bl=G[r+1][c];

      /* Subdivide some interior cells into 2 quads with a shared edge.
         The shared edge points are computed once and used for BOTH sub-cells,
         guaranteeing topological consistency (no gap between the two sub-parcels). */
      const canSplit=(c>0&&c<COLS-1&&r>0&&r<ROWS-1);
      const doSplit=canSplit&&R()<0.35;

      let cells;
      if(doSplit){
        const ratio=0.28+R()*0.44;               /* split position (28–72%)   */
        if(R()<0.5){
          /* Horizontal split — dividing line runs left→right              */
          /* Both mL and mR are shared between the upper and lower sub-cell */
          const mL=[tl[0]+(bl[0]-tl[0])*ratio+(R()-.5)*7, tl[1]+(bl[1]-tl[1])*ratio+(R()-.5)*7];
          const mR=[tr[0]+(br[0]-tr[0])*ratio+(R()-.5)*7, tr[1]+(br[1]-tr[1])*ratio+(R()-.5)*7];
          cells=[[tl,tr,mR,mL],[mL,mR,br,bl]];
        }else{
          /* Vertical split — dividing line runs top→bottom                */
          const mT=[tl[0]+(tr[0]-tl[0])*ratio+(R()-.5)*7, tl[1]+(tr[1]-tl[1])*ratio+(R()-.5)*7];
          const mB=[bl[0]+(br[0]-bl[0])*ratio+(R()-.5)*7, bl[1]+(br[1]-bl[1])*ratio+(R()-.5)*7];
          cells=[[tl,mT,mB,bl],[mT,tr,br,mB]];
        }
      }else{
        cells=[[tl,tr,br,bl]];
      }

      for(const vs of cells){
        const[cx,cy]=centroid(vs);
        const dist=distToRoute(cx,cy);
        const affected=dist<CHW;
        const t=routeT(cx,cy);
        const di=Math.min(Math.floor(t*p.dists.length),p.dists.length-1);
        const code=p.dists[di].slice(0,3).toUpperCase();
        /* Realistic hectare area: shoelace × small scale factor */
        const areaHa=Math.max(0.12,+(polyArea(vs)*0.0014+R()*0.4).toFixed(2));
        pIdx++;
        parcels.push({
          id:(affected?'IP':'OP')+'-'+String(pIdx).padStart(3,'0'),
          survey:code+'/'+(10+Math.floor(R()*60))+'/'+(1+Math.floor(R()*280)),
          owner:OWNER_NAMES[Math.floor(R()*OWNER_NAMES.length)],
          cat:CATS[Math.floor(R()*CATS.length)],
          area:areaHa,
          value:+(areaHa*p.avgL*(0.7+R()*0.7)).toFixed(1),
          village:p.vil[Math.floor(R()*p.vil.length)],
          stage:stageFor(t,affected),
          t,
          poly:polyStr(vs)
        });
      }
    }
  }

  /* Sort: IP (corridor-affected) first so parcel register shows useful rows */
  parcels.sort((a,b)=>a.id.startsWith('IP')===b.id.startsWith('IP')?a.t-b.t:a.id.startsWith('IP')?-1:1);

  CORR[p.id]={route,parcels};return CORR[p.id];
}

/* array interface kept for verification module & seeds */
function parcelsFor(p){return corridorFor(p).parcels;}

/* deterministic family rows */
function famRows(p,n){
  const R=rng(p.id+'fam');const out=[];
  for(let i=0;i<n;i++){
    const paid=R()<(p.status==='Delayed'?0.6:0.85);
    out.push({id:'F-'+(1000+Math.floor(R()*8999)),head:OWNER_NAMES[Math.floor(R()*OWNER_NAMES.length)],
      cat:CATS[Math.floor(R()*CATS.length)],village:p.vil[Math.floor(R()*p.vil.length)],
      area:+(0.2+R()*2.2).toFixed(2),award:+(p.avgL*(0.5+R()*1.6)).toFixed(1),paid,rr:R()<(p.stage==='Compensation'||p.stage==='Possession'?0.72:0.4)});
  }
  return out;
}
