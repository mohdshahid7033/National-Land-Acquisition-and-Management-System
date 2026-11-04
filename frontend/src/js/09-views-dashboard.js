/* ===== 09 · VIEW: DASHBOARD — KPIs, status map, donut, bars, alerts ===== */
function donut(parts,size){
  const tot=parts.reduce((s,p)=>s+p.v,0)||1;const R=54,r=36,cx=60,cy=60;let a0=-Math.PI/2,segs='';
  parts.forEach(p=>{
    const a1=a0+p.v/tot*2*Math.PI;
    const x0=cx+R*Math.cos(a0),y0=cy+R*Math.sin(a0),x1=cx+R*Math.cos(a1),y1=cy+R*Math.sin(a1);
    const xi1=cx+r*Math.cos(a1),yi1=cy+r*Math.sin(a1),xi0=cx+r*Math.cos(a0),yi0=cy+r*Math.sin(a0);
    const la=a1-a0>Math.PI?1:0;
    segs+=`<path d="M${x0.toFixed(1)} ${y0.toFixed(1)} A${R} ${R} 0 ${la} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L${xi1.toFixed(1)} ${yi1.toFixed(1)} A${r} ${r} 0 ${la} 0 ${xi0.toFixed(1)} ${yi0.toFixed(1)}Z" fill="${p.c}" stroke="#fff" stroke-width="1.5"/>`;
    a0=a1;
  });
  return `<div style="display:flex;align-items:center;gap:22px"><svg width="${size||120}" height="${size||120}" viewBox="0 0 120 120">${segs}<text x="60" y="57" text-anchor="middle" font-size="21" font-weight="800" fill="#1e293b">${tot}</text><text x="60" y="73" text-anchor="middle" font-size="9.5" fill="#64748b">PROJECTS</text></svg>
  <div class="legend">${parts.map(p=>`<div class="li"><span class="dotc" style="background:${p.c}"></span>${p.t}<b>${p.v}</b></div>`).join('')}</div></div>`;
}
function dashboardHTML(){
  const K=KPI;
  const byStatus=['On Track','At Risk','Delayed'].map(s=>({t:s,v:PROJECTS.filter(p=>p.status===s).length,c:ST_COL[s]}));
  const topD=Object.keys(DAGG).filter(d=>DAGG[d]).sort((a,b)=>DAGG[b].prog-DAGG[a].prog).slice(0,6);
  const alerts=ALERTS.slice(0,4);
  return `<div class="warn-strip">${ic('warn',17)}<div><b>3 projects need attention</b> — Warangal ORR compensation is 87/100 risk. <span class="lnk" data-act="nav" data-p="alerts">View alerts &rarr;</span></div></div>
  <div class="grid kpis" style="margin-bottom:16px">
    <div class="kpi"><div><div class="kl">Total Projects</div><div class="kv">${K.projects}</div><span class="delta-up">▲ 2 this month</span></div><div class="kb" style="background:#e8effd;color:#2563eb">${ic('folder',19)}</div></div>
    <div class="kpi"><div><div class="kl">Land Proposed</div><div class="kv">${inr(K.land)} ha</div><span class="delta-up">▲ 5.3% this month</span></div><div class="kb" style="background:#e0f4f7;color:#0e7490">${ic('map',19)}</div></div>
    <div class="kpi"><div><div class="kl">Land Acquired</div><div class="kv">${inr(K.acq)} ha</div><span class="delta-up">▲ 6.1% this month</span></div><div class="kb" style="background:#e8f7ee;color:#16a34a">${ic('check',19)}</div></div>
    <div class="kpi"><div><div class="kl">Compensation Paid</div><div class="kv">₹ ${inr(K.compPaid)} Cr</div><span class="delta-up">▲ 8.7% this month</span></div><div class="kb" style="background:#f3e8ff;color:#7c3aed">${ic('rupee',19)}</div></div>
    <div class="kpi"><div><div class="kl">Affected Families</div><div class="kv">${inr(K.fam)}</div><span class="delta-up">▲ 4.8% this month</span></div><div class="kb" style="background:#fef3df;color:#d97706">${ic('users',19)}</div></div>
    <div class="kpi click" data-act="nav" data-p="alerts"><div><div class="kl">Projects at Risk</div><div class="kv">${K.riskN}</div><span class="delta-dn">▲ 1 this month</span></div><div class="kb" style="background:#fdeaea;color:#ef4444">${ic('warn',19)}</div></div>
  </div>
  <div class="grid dsh-main" style="margin-bottom:16px">
    <div class="card" style="padding-bottom:10px">
      <div class="chead"><div><h3>Telangana — Project Status Overview</h3><div class="csub" style="margin:0">Click a district to open it in the GIS Land Map</div></div>
      <button class="btn btn-blue-soft" data-act="nav" data-p="gis">${ic('map',14)} Open GIS</button></div>
      <div id="mapwrap">${mapSVG({id:'dmap',mode:S.mapMode,mini:true,style:'width:100%;height:auto;max-height:560px;display:block;margin:0 auto'})}
        <div id="maptip"></div></div>
      <div style="display:flex;gap:14px;flex-wrap:wrap;font-size:12px;color:#475569;padding:4px 6px 8px">
        ${['On Track','At Risk','Delayed'].map(s=>`<span style="display:flex;gap:6px;align-items:center"><span class="dotc" style="background:${ST_COL[s]}"></span>${s}</span>`).join('')}
        <span style="display:flex;gap:6px;align-items:center"><span class="dotc" style="background:#e2e8f0"></span>No Projects</span></div>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="card"><h3>Top Districts by Progress</h3><div class="csub">Weighted by acquisition area</div>
        ${topD.map(d=>`<div class="dbar" data-act="gopen" data-d="${esc(d)}"><span class="dn">${esc(d)}</span>
          <div class="progbar"><i style="width:${DAGG[d].prog}%;background:${DAGG[d].prog>70?'#16a34a':DAGG[d].prog>50?'#f59e0b':'#ef4444'}"></i></div>
          <span class="dv">${DAGG[d].prog}%</span></div>`).join('')}
        <button class="btn btn-outline btn-block btn-sm" style="margin-top:10px" data-act="nav" data-p="gis">View All Districts</button>
      </div>
      <div class="card"><h3>Projects by Status</h3><div class="csub">Active projects in Telangana</div>${donut(byStatus)}</div>
    </div>
  </div>
  <div class="grid dsh-low">
    <div class="card"><div class="chead"><h3>Sector-wise Land (ha)</h3></div>
      ${(()=>{const secs={};PROJECTS.forEach(p=>secs[p.sector]=(secs[p.sector]||0)+p.land);
        const mx=Math.max(...Object.values(secs));
        return Object.entries(secs).sort((a,b)=>b[1]-a[1]).map(([s,v])=>`<div class="dbar"><span class="dn">${s}</span><div class="progbar"><i style="width:${Math.round(v/mx*100)}%;background:var(--brand)"></i></div><span class="dv">${inr(v)}</span></div>`).join('');})()}
    </div>
    <div class="card"><div class="chead"><h3>Recent Alerts</h3><span class="lnk" data-act="nav" data-p="alerts">View All</span></div>
      <div class="alist">${alerts.map(a=>{const c=a.sev==='Critical'?'#ef4444':a.sev==='High'?'#f59e0b':a.sev==='Medium'?'#3b82f6':'#94a3b8';
        return `<div class="alitem" style="border-left-color:${c};cursor:pointer" data-act="proj" data-id="${a.prj}">
        <div class="ah"><span class="riskchip" style="background:${c}1a;color:${c}">${a.sev.toUpperCase()}</span> ${esc(a.title)}</div>
        <p>${esc(a.desc)}</p><div class="gid">${a.prj} · ${esc(prj(a.prj).name)} · ${a.when}</div></div>`;}).join('')}</div>
    </div>
  </div>`;
}

