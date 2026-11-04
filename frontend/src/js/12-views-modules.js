/* =====================================================================
   12 · VIEW: MODULES — Acquisition workflow (Proposal → Scrutiny →
   Notification → Verification → Award → Possession), Compensation DBT
   ledger, Alerts & Risk, shared row builders + review/parcel modals.
   ===================================================================== */
function prjRow(p){
  return `<tr class="rowlink" data-act="proj" data-id="${p.id}">
    <td><span class="gid">${p.id}</span></td>
    <td><b>${esc(p.name)}</b><br><span class="gid">${p.sector} · ${esc(p.dept)}</span></td>
    <td style="font-size:12px;color:#475569">${p.dists.map(esc).join(', ')}</td>
    <td><span class="badge ${ST_BG[p.status]}">${p.status}</span></td>
    <td class="num">${inr(p.land)}</td>
    <td><div style="display:flex;align-items:center;gap:8px"><div class="progbar" style="flex:1"><i style="width:${p.prog}%;background:${p.prog>70?'#16a34a':p.prog>45?'#f59e0b':'#ef4444'}"></i></div><span style="font-size:11.5px;color:#64748b;font-weight:600">${p.prog}%</span></div></td>
    <td><span class="riskchip" style="background:${p.risk>60?'#fdeaea':p.risk>40?'#fef3df':'#e8f7ee'};color:${p.risk>60?'#b91c1c':p.risk>40?'#b45309':'#15803d'}">${p.risk>60?'HIGH':p.risk>40?'MED':'LOW'} ${p.risk}</span></td>
    <td style="font-size:12px;font-weight:600;color:#475569">${p.stage}</td></tr>`;
}
const bboxOf=n=>MAP.districts.find(d=>d.n===n).b;
function fitVB(n){
  const b=bboxOf(n);let w=b[2]-b[0],h=b[3]-b[1];const px=w*0.1,py=h*0.1;
  if(w<MAP.w*0.22){const g=(MAP.w*0.22-w)/2;return [b[0]-px-g,b[1]-py,w+2*px+2*g,h+2*py+2*g];}
  return [b[0]-px,b[1]-py,w+2*px,h+2*py];
}

const SPROPS=[
 {id:'PROP-TG-015',name:'Jagtial Mini Tank Bund Modernisation',dist:'Jagtial',land:180,fam:96,sector:'Irrigation',docs:6,status:'Pending'},
 {id:'PROP-TG-016',name:'Vikarabad Pharma Village – Phase II',dist:'Vikarabad',land:340,fam:210,sector:'Industry',docs:5,status:'Pending'}
];
const _snd=(function(){const n=new Date();n.setDate(n.getDate()-6);const m=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];return n.getDate()+' '+m[n.getMonth()]+' '+n.getFullYear();})();
const SNOTIF=[{no:'TG/Sec11/2026/041',pid:'NLAMS-TG-014',date:_snd,land:480,fam:380,status:'Published'}];
function acqHTML(){
  const t=S.acq;
  const head=(title,sub)=>`<div class="phead" style="margin-bottom:16px"><div><h2 style="font-size:19px">Acquisition · ${title}</h2><div style="color:var(--mut);font-size:12.5px;margin-top:3px">${sub}</div></div></div>`;
  if(t==='proposal'){
    if(!S.propDists)S.propDists=new Set(['Adilabad']);
    const selList=S.propDists.size?[...S.propDists].join(', '):'None selected';
    return head('Create Proposal','New acquisition proposal — flows to Scrutiny after submission')+`
    <div class="card" style="max-width:920px">
      <form id="proposal-form">
      <div class="formgrid">
        <div class="fld full"><label>Project Title</label><input id="np-name" required placeholder="e.g. Adilabad Water Grid Extension" value="Adilabad Water Grid Extension"></div>
        <div class="fld"><label>Sector</label><select id="np-sector"><option>Irrigation</option><option>Highways</option><option>Energy</option><option>Industry</option><option>Railways</option><option>Rural Roads</option></select></div>
        <div class="fld"><label>District</label><select id="np-dist">${MAP.districts.map(d=>`<option${S.propDists&&S.propDists.has(d.n)?' selected':d.n==='Adilabad'?' selected':''}>${esc(d.n)}</option>`).join('')}</select></div>
        <div class="fld"><label>Villages (comma separated)</label><input id="np-vil" value="Jainad, Bela, Kadam"></div>
        <div class="fld"><label>Land Required (ha)</label><input id="np-land" type="number" value="240"></div>
        <div class="fld"><label>Purpose</label><input id="np-purpose" value="Public purpose – drinking water infrastructure"></div>
        <div class="fld"><label>Estimated Cost (₹ Cr)</label><input id="np-cost" type="number" value="410"></div>
        <div class="fld"><label>Est. Affected Families</label><input id="np-fam" type="number" value="150"></div>
      </div>

      <!-- ── Area Marking Tool ── -->
      <div style="margin-top:22px;border-top:1px solid #e2e8f0;padding-top:18px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
          <div style="font-size:13.5px;font-weight:700;color:#1e293b;display:flex;align-items:center;gap:7px">
            ${ic('map',15)} Mark Acquisition Area on Map
          </div>
          <span class="badge bg-blu" id="area-count">${S.propDists.size} district${S.propDists.size!==1?'s':''} selected</span>
          <span style="flex:1"></span>
          <button type="button" class="btn btn-outline btn-sm" id="area-reset-btn">${ic('x',13)} Reset Area</button>
        </div>
        <div style="font-size:12px;color:#64748b;margin-bottom:10px">
          ${ic('pin',13)} Click districts on the map below to mark the acquisition boundary outline. Multi-district selection supported.
        </div>
        <div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap">
          <div style="flex:1;min-width:280px;position:relative;border-radius:12px;overflow:hidden;border:1.5px solid #e2e8f0;background:#f8fafc">
            <div id="area-map-wrap" style="position:relative">
              ${areaMapSVG(S.propDists)}
              <div id="area-maptip" style="position:absolute;background:#1e293b;color:#fff;font-size:11.5px;padding:5px 9px;border-radius:7px;pointer-events:none;display:none;z-index:99;box-shadow:0 2px 8px #0003"></div>
            </div>
          </div>
          <div style="min-width:200px;max-width:240px">
            <div style="font-size:12px;font-weight:700;color:#475569;margin-bottom:8px">SELECTED DISTRICTS</div>
            <div id="area-sel-list" style="display:flex;flex-direction:column;gap:6px">
              ${S.propDists.size===0?'<span style="font-size:12px;color:#94a3b8">Click districts on the map to select</span>':
                [...S.propDists].map(d=>`<div style="display:flex;align-items:center;gap:8px;font-size:12.5px;background:#e8f7ee;color:#15803d;border-radius:7px;padding:5px 10px;font-weight:600">
                  <span style="width:9px;height:9px;background:#16a34a;border-radius:50%;display:inline-block"></span>${esc(d)}
                  <button type="button" class="area-desel" data-d="${esc(d)}" style="margin-left:auto;background:none;border:none;cursor:pointer;color:#15803d;font-size:14px;line-height:1">×</button>
                </div>`).join('')}
            </div>
            ${S.propDists.size>0?`<div style="margin-top:12px;font-size:11.5px;color:#64748b"><b>Est. boundary:</b> ~${Math.round(S.propDists.size*620)} km² · ${S.propDists.size} district${S.propDists.size!==1?'s':''}</div>`:''}
          </div>
        </div>
      </div>
      <!-- ── end area tool ── -->

      <div style="display:flex;gap:10px;margin-top:20px">
        <button type="submit" class="btn btn-primary">${ic('check',15)} Submit Proposal</button>
        <button type="button" class="btn btn-outline" onclick="toast('Draft saved','info')">Save Draft</button>
      </div></form>
    </div>
    <div class="ok-strip" style="margin-top:16px">${ic('layers',16)}<div><b>Workflow:</b> Draft → Submitted → Under Scrutiny → Notification → Verification → Award → Possession → Compensation</div></div>`;
  }
  if(t==='scrutiny'){
    return head('Scrutiny Queue','Authority review of submitted proposals')+`
    <div class="card" style="padding:0"><div style="padding:16px 16px 4px;overflow:auto">
    <table class="tbl"><thead><tr><th>Proposal ID</th><th>Project</th><th>District</th><th class="num">Land (ha)</th><th class="num">Families</th><th>Docs</th><th>Status</th><th></th></tr></thead><tbody>
    ${SPROPS.map(x=>`<tr><td class="gid">${x.id}</td><td><b>${esc(x.name)}</b><br><span class="gid">${x.sector}</span></td><td>${esc(x.dist)}</td><td class="num">${x.land}</td><td class="num">${x.fam}</td>
      <td><span class="badge ${x.docs>=6?'bg-grn':'bg-amb'}">${x.docs}/6</span></td>
      <td><span class="badge ${x.status==='Pending'?'bg-amb':x.status==='Approved'?'bg-grn':x.status==='Sent Back'?'bg-gry':'bg-red'}">${x.status}</span></td>
      <td>${x.status==='Pending'?`<button class="btn btn-blue-soft" data-act="review" data-id="${x.id}">${ic('eye',13)} Review</button>`:'—'}</td></tr>`).join('')}
    </tbody></table></div></div>`;
  }
  if(t==='notification'){
    // Build queue: existing NLAMS-TG-009 demo + approved proposals that haven't been notified yet
    // Use nlamsId (proper NLAMS-TG-* ID) as the button data-id so gennotif can look them up
    const approvedProps=SPROPS.filter(x=>x.status==='Approved'&&!x.notified&&x.nlamsId);
    const queue=[{pid:'NLAMS-TG-009',label:'NLAMS-TG-009'},...approvedProps.map(x=>({pid:x.nlamsId,label:x.id}))];
    return head('Section 11 Notifications','Publish declaration of intent for approved proposals')+`
    <div class="grid" style="grid-template-columns:1fr 1fr;margin-bottom:16px">
      <div class="card"><h3>Awaiting Notification</h3><div class="csub">Approved proposals ready for Sec-11 declaration</div>
        ${queue.map(({pid,label})=>{const p=prj(pid)||SPROPS.find(x=>x.id===pid||x.nlamsId===pid);
          return `<div class="dbar" style="cursor:default"><span class="dn" style="width:auto;flex:1"><b style="color:var(--ink)">${esc(p?p.name:pid)}</b><br><span class="gid">${label}</span></span>
          <button class="btn btn-blue-soft" data-act="gennotif" data-id="${pid}">${ic('file',13)} Generate &amp; Publish</button></div>`;}).join('')||'<div class="ok-strip" style="margin:0">Queue empty — approve proposals in Scrutiny.</div>'}
      </div>
      <div class="card"><h3>Published Notifications</h3><div class="csub">Gazette declarations (Sec 11, RFCTLARR Act 2013)</div>
        <table class="tbl"><thead><tr><th>Notification No.</th><th>Project</th><th>Date</th><th class="num">Land</th><th>Status</th></tr></thead><tbody>
        ${SNOTIF.map(n=>`<tr><td><b>${n.no}</b></td><td style="font-size:12px">${esc((prj(n.pid)||{}).name||n.pid)}</td><td style="font-size:12px">${n.date}</td><td class="num">${n.land} ha</td><td><span class="badge bg-grn">${n.status}</span></td></tr>`).join('')}
        </tbody></table></div>
    </div>`;
  }
  if(t==='verification'){
    const pid=S.verPrj||'NLAMS-TG-001';const p=prj(pid);const cor=corridorFor(p);
    const pd=cor.parcels;const done=pd.filter(x=>S.verDone[pid].has(x.id));
    const pct=Math.round(done.length/pd.length*100);
    return head('Field Verification','Survey, GPS/GIS &amp; document verification along the project alignment')+`
    <div class="searchbar">
      <select class="fsel" id="ver-prj">${PROJECTS.filter(x=>['Verification','Award','Possession','Compensation'].includes(x.stage)).map(x=>`<option value="${x.id}"${x.id===pid?' selected':''}>${esc(x.name)}</option>`).join('')}</select>
      <span class="badge bg-blu">${p.dists.map(esc).join(' → ')}</span><span style="flex:1"></span>
      <span style="font-size:12.5px;color:#64748b">Total <b>${pd.length}</b> parcels · Verified <b style="color:#15803d">${done.length}</b> · Pending <b style="color:#b45309">${pd.length-done.length}</b></span></div>
    <div class="card" style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700"><span>Verification Progress</span><span>${pct}%</span></div>
      <div class="progbar" style="height:12px;margin-top:9px"><i style="width:${pct}%;background:${pct>75?'#16a34a':pct>45?'#f59e0b':'#ef4444'}"></i></div>
      <div class="hint">Verified parcels are GPS-tagged against cadastral maps and matched with Dharani land records.</div></div>
    <div class="card" style="padding:0"><div style="padding:16px 16px 8px;overflow:auto;max-height:430px">
    <table class="tbl"><thead><tr><th>Survey No.</th><th>Owner</th><th>Village</th><th class="num">Area (ha)</th><th>Status</th><th></th></tr></thead><tbody>
    ${pd.map(x=>{const v=S.verDone[pid].has(x.id);
      return `<tr><td><b>${x.survey}</b></td><td>${esc(x.owner)} <span class="gid">(${x.cat})</span></td><td>${esc(x.village)}</td><td class="num">${x.area}</td>
      <td>${v?'<span class="badge bg-grn">Verified</span>':x.stage==='Disputed'?'<span class="badge bg-red">Disputed</span>':'<span class="badge bg-amb">Pending</span>'}</td>
      <td>${v?`<button class="sqbtn" title="View">${ic('eye',14)}</button>`:`<button class="btn btn-blue-soft" data-act="vfy" data-pid="${pid}" data-pcl="${x.id}">${ic('clipcheck',13)} Verify</button>`}</td></tr>`;}).join('')}
    </tbody></table></div></div>`;
  }
  if(t==='award'){
    const pid=S.awPrj||'NLAMS-TG-006';const p=prj(pid);const area=Math.round(p.land*p.acq/100);
    return head('Award & Valuation','Compensation calculation as per RFCTLARR Act, 2013 — Section 26–30')+`
    <div class="searchbar"><select class="fsel" id="aw-prj">${PROJECTS.map(x=>`<option value="${x.id}"${x.id===pid?' selected':''}>${esc(x.name)}</option>`).join('')}</select>
      <span class="badge ${ST_BG[p.status]}">${p.status}</span></div>
    <div class="grid" style="grid-template-columns:1fr 1.1fr">
      <div class="card"><h3>Award Inputs</h3><div class="csub">Award sheet for ${inr(area)} ha acquired (${p.acq}% of ${inr(p.land)} ha)</div>
        <div class="fld"><label>Market Value (₹ lakh / ha) — Dharani benchmark</label><input id="aw-mv" type="number" value="${p.avgL}"></div>
        <div class="fld"><label>Multiplier (Sec 26(2))</label><select id="aw-mult"><option value="2">2.0 — Rural area</option><option value="1.5">1.5 — Peri-urban</option><option value="1">1.0 — Urban</option></select></div>
        <div class="fld"><label>Land Area for this Award (ha)</label><input id="aw-area" type="number" value="${Math.min(120,area)}"></div>
        <div class="fld"><label>Years since Sec-11 Notification</label><input id="aw-years" type="number" value="1" min="0" max="5"></div>
        <div class="award-formula">${ic('scale',14)} <b>Formula (Sec 27):</b> Final = (MV × Multiplier) + 12% per annum + 100% Solatium. Determined by DLAO, verified by District Collector.</div>
        <button class="btn btn-primary btn-sm" data-act="genaward">${ic('award',14)} Generate Award Draft</button>
      </div>
      <div class="card"><h3>Compensation Computation</h3><div class="csub">Live preview — updates as inputs change</div>
        <div class="calcbox" id="aw-out">
          <div class="calcrow"><span>Market Value × Multiplier</span><b id="aw-base">—</b></div>
          <div class="calcrow"><span>+ Additional 12% p.a. (Sec 27.3)</span><b id="aw-add" style="color:#b45309">—</b></div>
          <div class="calcrow"><span>+ Solatium @ 100% (Sec 30)</span><b id="aw-sol" style="color:#7c3aed">—</b></div>
          <div class="calcrow total"><span>Total Award</span><b id="aw-tot">—</b></div>
          <div class="calcrow"><span style="color:#64748b">≈ per affected family (${inr(p.fam)})</span><b id="aw-perfam" style="color:#64748b">—</b></div>
        </div></div>
    </div>`;
  }
  // possession
  return head('Possession','Physical handover after award & payment — Section 38')+`
  <div class="grid kpis" style="grid-template-columns:repeat(3,1fr);margin-bottom:16px">
    <div class="kpi"><div><div class="kl">Possession Completed</div><div class="kv" style="color:#15803d">${inr(Math.round(KPI.acq*0.88))} ha</div><span class="delta-up">88% of acquired land</span></div><div class="kb" style="background:#e8f7ee;color:#16a34a">${ic('check',19)}</div></div>
    <div class="kpi"><div><div class="kl">Pending Handover</div><div class="kv" style="color:#b45309">${inr(Math.round(KPI.acq*0.09))} ha</div><span class="delta-dn">notices to be issued</span></div><div class="kb" style="background:#fef3df;color:#d97706">${ic('box',19)}</div></div>
    <div class="kpi"><div><div class="kl">Disputed / Litigation</div><div class="kv" style="color:#b91c1c">${inr(Math.round(KPI.acq*0.03))} ha</div><span class="delta-dn">14 cases in courts</span></div><div class="kb" style="background:#fdeaea;color:#ef4444">${ic('warn',19)}</div></div></div>
  <div class="card" style="padding:0"><div style="padding:16px 16px 8px;overflow:auto">
  <table class="tbl"><thead><tr><th>Project</th><th>District(s)</th><th class="num">Acquired</th><th>Handover Status</th><th></th></tr></thead><tbody>
  ${PROJECTS.filter(p=>['Possession','Compensation'].includes(p.stage)).map(p=>{
    const done=Math.round(p.land*p.acq/100*0.88),pend=Math.round(p.land*p.acq/100*0.12);
    return `<tr><td><b>${esc(p.name)}</b><br><span class="gid">${p.id}</span></td><td style="font-size:12px">${p.dists.map(esc).join(', ')}</td><td class="num">${inr(Math.round(p.land*p.acq/100))} ha</td>
    <td><div class="progbar" style="width:170px"><i style="width:${Math.round(p.acq*0.88)}%;background:#16a34a"></i></div><span class="gid">${done} ha done · ${pend} ha pending</span></td>
    <td><button class="btn btn-blue-soft" data-act="posnotice" data-id="${p.id}">${ic('file',13)} Issue Notice</button></td></tr>`;}).join('')}
  </tbody></table></div></div>`;
}

/* ---------- COMPENSATION ---------- */
function compHTML(){
  const pid=S.payPrj||'NLAMS-TG-003';const p=prj(pid);
  const rows=famRows(p,12).map(f=>({...f,paid:f.paid||S.paid[pid+':'+f.id]}));
  const released=Object.keys(S.paid).filter(k=>S.paid[k]&&k.startsWith(pid+':')).reduce((s,k)=>{
    const f=famRows(p,12).find(x=>x.id===k.split(':')[1]);return s+(f?f.award:0);},0);
  // All three KPIs derive from the same visible rows → Total = Paid + Pending always
  // f.award is in lakh ₹; divide by 100 to convert to Crores
  const pendingRows=rows.filter(r=>!r.paid);
  const paidRows=rows.filter(r=>r.paid);
  const totalViewCr=Math.round(rows.reduce((s,r)=>s+(r.award||0),0))/100;
  const paidViewCr=Math.round(paidRows.reduce((s,r)=>s+(r.award||0),0))/100;
  const pendingCr=Math.round(pendingRows.reduce((s,r)=>s+(r.award||0),0))/100;
  const pendingCount=pendingRows.length;
  const disbPct=totalViewCr>0?Math.round(paidViewCr/totalViewCr*100):100;
  return `<div class="phead" style="margin-bottom:16px"><div><h2 style="font-size:19px">Compensation — Telangana</h2>
    <div style="color:var(--mut);font-size:12.5px;margin-top:3px">Direct Benefit Transfer via CFMS · RBI-integrated disbursement</div></div>
    <select class="fsel" id="pay-prj">${PROJECTS.map(x=>`<option value="${x.id}"${x.id===pid?' selected':''}>${esc(x.name)}</option>`).join('')}</select></div>
  <div class="grid kpis" style="grid-template-columns:repeat(3,1fr);margin-bottom:16px">
    <div class="kpi"><div><div class="kl">Total Compensation</div><div class="kv">₹ ${inr(totalViewCr)} Cr</div><span class="delta-up">${rows.length} families in view</span></div><div class="kb" style="background:#e8effd;color:#2563eb">${ic('rupee',19)}</div></div>
    <div class="kpi"><div><div class="kl">Paid via DBT</div><div class="kv" style="color:#15803d">₹ ${inr(paidViewCr)} Cr</div><span class="delta-up">${disbPct}% disbursed</span></div><div class="kb" style="background:#e8f7ee;color:#16a34a">${ic('check',19)}</div></div>
    <div class="kpi"><div><div class="kl">Pending</div><div class="kv" style="color:${pendingCount>0?'#b91c1c':'#15803d'}">₹ ${pendingCount>0?inr(pendingCr):'0'} Cr</div><span class="${pendingCount>0?'delta-dn':'delta-up'}">${pendingCount>0?pendingCount+' families in view':'All paid in view'}</span></div><div class="kb" style="background:${pendingCount>0?'#fdeaea':'#e8f7ee'};color:${pendingCount>0?'#ef4444':'#16a34a'}">${ic(pendingCount>0?'warn':'check',19)}</div></div></div>
  ${pid==='NLAMS-TG-003'&&rows.some(r=>!r.paid)?`<div class="warn-strip">${ic('warn',16)}<div><b>Alert A-101:</b> 32 families beyond 90-day SLA. Release pending payments or flag for Lok Adalat.</div></div>`:`<div class="ok-strip">${ic('check',16)}<div>All payments for this project are within the 90-day SLA.</div></div>`}
  <div class="card" style="padding:0"><div style="padding:16px 16px 8px;overflow:auto">
  <table class="tbl"><thead><tr><th>Family ID</th><th>Head of Family</th><th>Village</th><th class="num">Award (₹)</th><th>Bank / CFMS</th><th>Status</th><th></th></tr></thead><tbody>
  ${rows.map(f=>`<tr><td class="gid">${f.id}</td><td>${esc(f.head)} <span class="gid">(${f.cat})</span></td><td>${esc(f.village)}</td><td class="num">₹ ${inr(f.award*100000)}</td>
    <td style="font-size:12px">${esc(f.head.split(' ').pop().toUpperCase())}B******** · SBI</td>
    <td>${f.paid?'<span class="badge bg-grn">Paid</span>':'<span class="badge bg-amb">Pending</span>'}</td>
    <td>${f.paid?'<span class="gid">UTR 20'+Math.floor(10000000000+parseFloat("0."+f.id.replace(/\D/g,''))*8999999999)+'</span>':`<button class="btn btn-blue-soft" data-act="pay" data-pid="${pid}" data-fid="${f.id}" data-amt="${f.award}">${ic('rupee',13)} Release</button>`}</td></tr>`).join('')}
  </tbody></table></div></div>`;
}

/* ---------- ALERTS ---------- */
function alertsHTML(){
  const cnt=s=>ALERTS.filter(a=>a.sev===s).length;
  return `<div class="phead" style="margin-bottom:16px"><div><h2 style="font-size:19px">Alerts &amp; Risk Intelligence</h2>
    <div style="color:var(--mut);font-size:12.5px;margin-top:3px">Rule-engine + early-warning scoring across ${PROJECTS.length} projects</div></div></div>
  <div class="grid kpis" style="grid-template-columns:repeat(4,1fr);margin-bottom:16px">
    ${[['Critical','#ef4444','fdeaea'],['High','#f59e0b','fef3df'],['Medium','#3b82f6','e8effd'],['Info','#94a3b8','eef1f6']].map(s=>`
    <div class="kpi"><div><div class="kl">${s[0]} Alerts</div><div class="kv" style="color:${s[1]}">${cnt(s[0])}</div></div>
    <div class="kb" style="background:#${s[2]};color:${s[1]}">${ic('warn',19)}</div></div>`).join('')}</div>
  <div class="alist">${ALERTS.map(a=>alertCard(a)).join('')}</div>`;
}

/* ---------- modals ---------- */
function reviewModal(id){
  const x=SPROPS.find(s=>s.id===id);
  openModal(`<h3>Review — ${esc(x.name)}</h3><div class="msub">${x.id} · ${esc(x.dist)} district · ${x.land} ha · ${x.fam} families</div>
  <table class="tbl"><tbody>
  <tr><td style="color:#64748b">Legal checklist (Rule 5, Form-4)</td><td>${['Land schedule ✓','Market value certificate ✓','District NOC ✓','Social impact screening ✓','Environment screen ✓','Public purpose justification ✓'].map(d=>`<div style="font-size:12.5px;padding:2px 0;color:#15803d">${d}</div>`).join('')}</td></tr>
  <tr><td style="color:#64748b">Land details</td><td>${x.land} ha · ${x.sector} · Govt land 12 ha, Patta 148 ha</td></tr>
  <tr><td style="color:#64748b">Risk check</td><td><span class="badge bg-grn">Low — no litigation found in Dharani &amp; court records</span></td></tr></tbody></table>
  <div style="display:flex;gap:10px;margin-top:18px">
    <button class="btn btn-primary btn-sm" data-act="decide" data-id="${id}" data-dec="Approved">✔ Approve → Sec-11 Queue</button>
    <button class="btn btn-outline btn-sm" data-act="decide" data-id="${id}" data-dec="Sent Back">↩ Send Back</button>
    <button class="btn btn-outline btn-sm" data-act="decide" data-id="${id}" data-dec="Rejected" style="color:#b91c1c;border-color:#fca5a5">✖ Reject</button></div>`);
}
function parcelModal(pid,dn,idx){
  const p=prj(pid);const x=parcelsFor(p)[idx];
  openModal(`<h3>Parcel ${x.survey}</h3><div class="msub">${esc(p.name)} · ${esc(dn)} · ${esc(x.village)} village</div>
  <table class="tbl"><tbody>
  <tr><td style="color:#64748b">Owner</td><td><b>${esc(x.owner)}</b> <span class="gid">(${x.cat})</span></td></tr>
  <tr><td style="color:#64748b">Area</td><td>${x.area} ha</td></tr>
  <tr><td style="color:#64748b">Workflow stage</td><td><span class="badge" style="background:${x.stage==='Disputed'?PCL_DISPUTED:PCL_COL[x.stage]}1c;color:${x.stage==='Disputed'?PCL_DISPUTED:PCL_COL[x.stage]}">${x.stage}</span></td></tr>
  <tr><td style="color:#64748b">Est. Award Value</td><td>₹ ${inr(x.value*100000)}</td></tr>
  <tr><td style="color:#64748b">GPS / GIS</td><td>✔ Cadastral-matched · Dharani sync ${x.stage==='Compensated'||x.stage==='Possession'?'complete':'in progress'}</td></tr></tbody></table>
  <div style="display:flex;gap:10px;margin-top:16px"><button class="btn btn-primary btn-sm" data-act="proj" data-id="${pid}">Open Project</button></div>`);
}

function alertCard(a){
  const c=a.sev==='Critical'?'#ef4444':a.sev==='High'?'#f59e0b':a.sev==='Medium'?'#3b82f6':'#94a3b8';
  return `<div class="alitem" style="border-left-color:${c}">
    <div class="ah"><span class="riskchip" style="background:${c}1a;color:${c}">${a.sev.toUpperCase()}</span> ${esc(a.title)}
    <span style="margin-left:auto;font-weight:800;font-size:12.5px;color:${c}">${a.score}/100</span></div>
    <p>${esc(a.desc)}</p>
    <div class="act">${ic('check',13)} Recommended: ${esc(a.action)}</div>
    <div class="gid" style="margin-top:8px">${a.id} · <span class="lnk" data-act="proj" data-id="${a.prj}">${a.prj} — ${esc(prj(a.prj).name)}</span> · ${a.when}</div></div>`;
}
