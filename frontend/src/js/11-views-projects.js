/* ===== 11 · VIEW: PROJECTS — table + Project Details (5 tabs) ===== */
function projectsHTML(){
  const q=S.scrQ.toLowerCase();
  const rows=PROJECTS.filter(p=>!q||p.name.toLowerCase().includes(q)||p.id.toLowerCase().includes(q)||p.dists.join(' ').toLowerCase().includes(q));
  return `<div class="phead" style="margin-bottom:16px"><div><h2 style="font-size:19px">Projects — Telangana</h2>
    <div style="color:var(--mut);font-size:12.5px;margin-top:3px">${PROJECTS.length} active projects · Click a row for the single source of truth</div></div>
    <button class="btn btn-primary btn-sm" data-act="nav" data-p="acquisition" data-s="proposal">${ic('plus',15)} New Acquisition Proposal</button></div>
  <div class="card" style="padding:0">
    <div class="searchbar" style="padding:14px 16px 0;margin:0">
      <div class="searchbox">${ic('search',16)}<input placeholder="Search projects, IDs, districts…" value="${esc(S.scrQ)}" id="prj-q"></div>
      <select class="fsel"><option>All Sectors</option><option>Highways</option><option>Irrigation</option><option>Energy</option><option>Industry</option><option>Railways</option><option>Rural Roads</option><option>Urban Transit</option></select>
      <select class="fsel"><option>All Status</option><option>On Track</option><option>At Risk</option><option>Delayed</option></select>
    </div>
    <div style="padding:8px 16px 16px;overflow:auto">
    <table class="tbl"><thead><tr><th>Project ID</th><th>Project Name</th><th>District(s)</th><th>Status</th><th class="num">Land (ha)</th><th>Progress</th><th>Risk</th><th>Stage</th></tr></thead>
    <tbody id="prj-tbody">${rows.map(prjRow).join('')}
    </tbody></table></div>
  </div>`;
}

/* ---------------- PROJECT DETAILS ---------------- */
function projDates(p){
  const R=rng(p.id+'dates');const st=new Date(p.started+'T00:00:00');const out=[];let d=new Date(st);
  const idx=STAGES.indexOf(p.stage);
  for(let i=0;i<=idx;i++){out.push(d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}));d=new Date(d.getTime()+(40+R()*60)*864e5);}
  return out;
}
function projHTML(id){
  const p=prj(id);const di=projDates(p);const idx=STAGES.indexOf(p.stage);
  const tabs=['overview','parcels','acquisition','compensation','alerts'];
  const tabL={overview:'Overview',parcels:'Land Parcels',acquisition:'Acquisition',compensation:'Compensation',alerts:'Alerts'};
  const acqHa=Math.round(p.land*p.acq/100);
  let body='';
  if(S.projTab==='overview'){
    body=`<div class="grid" style="grid-template-columns:1.4fr 1fr">
      <div class="card"><h3>Project Overview</h3><div class="csub">${p.id} · ${p.sector} · ${esc(p.dept)}</div>
        <table class="tbl"><tbody>
        <tr><td style="color:#64748b">State</td><td><b>Telangana</b></td></tr>
        <tr><td style="color:#64748b">District(s)</td><td>${p.dists.map(x=>`<span class="vill-tag">${esc(x)}</span>`).join('')}</td></tr>
        <tr><td style="color:#64748b">Villages covered</td><td>${p.vil.map(x=>`<span class="vill-tag">${esc(x)}</span>`).join('')}</td></tr>
        <tr><td style="color:#64748b">Total Land</td><td><b>${inr(p.land)} ha</b></td></tr>
        <tr><td style="color:#64748b">Acquired</td><td><b style="color:#15803d">${inr(acqHa)} ha</b> (${p.acq}%)</td></tr>
        <tr><td style="color:#64748b">Sanctioned Budget</td><td>₹ ${inr(p.budget)} Cr</td></tr>
        <tr><td style="color:#64748b">Affected Families</td><td>${inr(p.fam)}</td></tr>
        <tr><td style="color:#64748b">Status</td><td><span class="badge ${ST_BG[p.status]}">${p.status}</span> <span class="riskchip" style="background:${p.risk>60?'#fdeaea':p.risk>40?'#fef3df':'#e8f7ee'};color:${p.risk>60?'#b91c1c':p.risk>40?'#b45309':'#15803d'}">Risk ${p.risk}/100</span></td></tr>
        </tbody></table></div>
      <div class="card"><h3>District-wise Progress</h3><div class="csub">Share of project land ≈ ${inr(Math.round(p.land/p.dists.length))} ha per district</div>
        ${p.dists.map(dn=>{const a=DAGG[dn]||{prog:0};return `<div style="margin-bottom:13px"><div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:5px"><b>${esc(dn)}</b><span style="color:#64748b">${a.prog}% progress</span></div>
          <div class="progbar"><i style="width:${a.prog}%;background:${a.prog>70?'#16a34a':a.prog>45?'#f59e0b':'#ef4444'}"></i></div></div>`;}).join('')}
        <button class="btn btn-outline btn-block btn-sm" data-act="gproj" data-id="${p.id}">${ic('map',14)} View parcels on GIS Map</button>
      </div>
    </div>
    <div class="card" style="margin-top:16px"><h3>Acquisition Timeline</h3><div class="csub">RFCTLARR 2013 process — current stage: <b>${p.stage}</b></div>
      <div class="steps">${STAGES.map((s,i)=>`<div class="step ${i<idx?'done':i===idx?'act':''}"><div class="sn">${i<idx?'✓':i+1}</div><span class="sl">${s}</span><span style="font-size:10px;color:#94a3b8">${di[i]||''}</span></div>`).join('')}</div>
    </div>`;
  } else if(S.projTab==='parcels'){
    const cor=corridorFor(p);
    const cnt={};cor.parcels.forEach(x=>cnt[x.stage]=(cnt[x.stage]||0)+1);
    body=`<div class="grid" style="grid-template-columns:1.5fr 1fr">
      <div class="card" style="padding:10px"><div id="mapwrap">
      ${mapSVG({id:'pmap',mode:'status',selDist:p.dists[0],vb:null,align:{pts:cor.route.pts,acq:p.acq,parcels:cor.parcels},routeDists:p.dists,style:'width:100%;height:auto;max-height:470px;display:block;margin:0 auto'})}
        ${cor?`<div class="mapbadge"><b>${esc(p.name)}</b><br>Alignment ≈ ${Math.round(cor.route.len*0.24)} km · ${p.dists.length} districts · ${cor.parcels.filter(x=>x.id.startsWith('IP-')).length} corridor parcels · <span style="color:#6ee7a0">${p.acq}% acquired</span></div>`:''}
      ${flowStrip(p)}
      <div id="maptip"></div></div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;font-size:11.5px;color:#475569;padding:6px">
      ${Object.entries(PCL_COL).map(([k,c])=>`<span style="display:flex;gap:5px;align-items:center"><span class="dotc" style="background:${c}"></span>${k} (${cnt[k]||0})</span>`).join('')}
      <span style="display:flex;gap:5px;align-items:center"><span class="dotc" style="background:${PCL_DISPUTED}"></span>Disputed (${cnt['Disputed']||0})</span></div></div>
      <div class="card"><h3>Parcel Register</h3><div class="csub">${cor.parcels.filter(x=>x.id.startsWith('IP-')).length} corridor parcels · Survey &amp; GPS verified</div>
      <div style="max-height:420px;overflow:auto"><table class="tbl"><thead><tr><th>Survey No.</th><th>Owner</th><th>Area</th></tr></thead><tbody>
      ${cor.parcels.slice(0,18).map(x=>{const c=x.stage==='Disputed'?PCL_DISPUTED:PCL_COL[x.stage];return `<tr class="rowlink" data-act="psel2" data-i="${cor.parcels.indexOf(x)}"><td><b>${x.survey}</b><br><span class="badge" style="background:${c}1c;color:${c}">${x.stage}</span></td><td>${esc(x.owner)}<br><span class="gid">${esc(x.village)} · ${x.cat}</span></td><td class="num">${x.area} ha</td></tr>`;}).join('')}
      </tbody></table></div></div></div>`;
  } else if(S.projTab==='acquisition'){
    body=`<div class="card"><div class="chead"><h3>Acquisition Workflow</h3><span class="badge ${ST_BG[p.status]}">${p.status}</span></div>
      <div class="steps">${STAGES.map((s,i)=>`<div class="step ${i<idx?'done':i===idx?'act':''}"><div class="sn">${i<idx?'✓':i+1}</div><span class="sl">${s}</span><span style="font-size:10px;color:#94a3b8">${di[i]||''}</span></div>`).join('')}</div>
      <table class="tbl" style="margin-top:14px"><thead><tr><th>Stage</th><th>Date</th><th>Authority</th><th>Instrument</th><th>Status</th></tr></thead><tbody>
      ${STAGES.map((s,i)=>{const done=i<idx,act=i===idx;
        return `<tr><td><b>${i+1}. ${s}</b></td><td>${di[i]||'—'}</td><td>${['RDO','District Collector','District Collector','MRO / Field','DLAO','District Collector','DMFT'][i]}</td>
        <td style="font-size:12px">${['Form 4 (Rule 5)','Sec 4(1) RFCTLARR','Sec 11 Declaration','Panchang / 1-A Survey','Sec 30-31 Award','Sec 38 Possession','DBT via CFMS'][i]}</td>
        <td>${done?'<span class="badge bg-grn">Completed</span>':act?'<span class="badge bg-blu">In Progress</span>':'<span class="badge bg-gry">Pending</span>'}</td></tr>`;}).join('')}
      </tbody></table>
      <div style="margin-top:14px;display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-blue-soft" data-act="acq" data-s="verification">${ic('clipcheck',14)} Open Verification Module</button>
        <button class="btn btn-blue-soft" data-act="acq" data-s="award">${ic('award',14)} Award Calculator</button>
      </div></div>`;
  } else if(S.projTab==='compensation'){
    const total=Math.round(acqHa*p.avgL*1.18/100);
    const paid=Math.round(total*0.81);
    body=`<div class="grid kpis" style="grid-template-columns:repeat(3,1fr);margin-bottom:16px">
      <div class="kpi"><div><div class="kl">Total Compensation</div><div class="kv">₹ ${inr(total)} Cr</div></div><div class="kb" style="background:#e8effd;color:#2563eb">${ic('rupee',19)}</div></div>
      <div class="kpi"><div><div class="kl">Paid via DBT</div><div class="kv" style="color:#15803d">₹ ${inr(paid)} Cr</div><span class="delta-up">81% disbursed</span></div><div class="kb" style="background:#e8f7ee;color:#16a34a">${ic('check',19)}</div></div>
      <div class="kpi"><div><div class="kl">Pending</div><div class="kv" style="color:#b91c1c">₹ ${inr(total-paid)} Cr</div><span class="delta-dn">${p.status==='Delayed'?'SLA breached':'within SLA'}</span></div><div class="kb" style="background:#fdeaea;color:#ef4444">${ic('warn',19)}</div></div></div>
      ${p.id==='NLAMS-TG-003'?'<div class="warn-strip">'+ic('warn',16)+'<div><b>32 families awaiting payment</b> — bank reconciliation issue flagged in Alert A-101. <span class="lnk" data-act="nav" data-p="compensation">Process now &rarr;</span></div></div>':''}
      <div class="card"><div class="chead"><h3>Recent Payments</h3><span class="lnk" data-act="nav" data-p="compensation">Full ledger</span></div>
      <table class="tbl"><thead><tr><th>Family</th><th>Head</th><th>Village</th><th class="num">Award</th><th>Mode</th><th>Status</th></tr></thead><tbody>
      ${famRows(p,8).map(f=>`<tr><td class="gid">${f.id}</td><td>${esc(f.head)} <span class="gid">(${f.cat})</span></td><td>${esc(f.village)}</td><td class="num">₹ ${inr(f.award*100000)}</td><td style="font-size:12px">CFMS-DBT</td><td>${f.paid?'<span class="badge bg-grn">Paid</span>':'<span class="badge bg-amb">Pending</span>'}</td></tr>`).join('')}
      </tbody></table></div>`;
  } else {
    const as=ALERTS.filter(a=>a.prj===id);
    body=`<div class="alist">${as.length?as.map(a=>alertCard(a)).join(''):'<div class="ok-strip">'+ic('check',16)+'<div>No active alerts for this project.</div></div>'}</div>`;
  }
  return `<div class="phead" style="margin-bottom:4px">
    <div><div class="crumb"><span class="lnk" data-act="nav" data-p="projects">Projects</span> ${ic('chevR',12)} <b>${p.id}</b></div>
      <h2 style="font-size:19px;margin-top:6px">${esc(p.name)}</h2>
      <div style="color:var(--mut);font-size:12.5px;margin-top:3px">${p.id} · ${p.dists.map(esc).join(', ')} · ${esc(p.dept)}</div></div>
    <div style="display:flex;gap:9px">
      <span class="badge ${ST_BG[p.status]}" style="font-size:12px;padding:7px 13px">${p.status}</span>
      <button class="btn btn-outline btn-sm" data-act="gproj" data-id="${p.id}">${ic('map',14)} GIS View</button>
    </div></div>
  <div class="tabs">${tabs.map(t=>`<div class="tab ${S.projTab===t?'on':''}" data-act="ptab" data-t="${t}">${tabL[t]}${t==='alerts'?` (${ALERTS.filter(a=>a.prj===id).length})`:''}</div>`).join('')}</div>
  ${body}`;
}
