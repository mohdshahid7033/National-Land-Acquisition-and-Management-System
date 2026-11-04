/* =====================================================================
   10 · VIEW: GIS LAND MAP — the core page:
   · mapSVG(): districts + route alignment + workflow-coloured parcels
   · flowStrip()/stageLegend(): acquisition workflow ON the map (click = filter)
   · gisHTML(): state → district → project-alignment drill-down
   · mountMap(): tooltips, drag-pan, clicks · gzoom(): zoom controls
   ===================================================================== */
function mapSVG(opts){
  const o=opts||{};const mode=o.mode||'status';const mini=!!o.mini;
  const inRoute=dn=>!o.align||o.routeDists.includes(dn);
  const paths=MAP.districts.map(d=>{
    const sel = o.selDist===d.n;
    const fill = inRoute(d.n)?distColor(d.n,mode):'#eef1f5';
    return `<path class="md" data-d="${d.n}" d="${d.d}" fill="${fill}" stroke="${sel?'#1d4ed8':'#ffffff'}" stroke-width="${sel?3:(mini?1:1.5)}" ${inRoute(d.n)?'':'opacity=".75"'}/>`;
  }).join('');
  let vb=o.vb||`0 0 ${MAP.w} ${MAP.h}`;
  /* Compute scale factor from viewBox so labels stay readable at any zoom */
  const vbParts=vb.split(' ').map(Number);
  const vbW=vbParts[2]||MAP.w;
  const labelScale=Math.max(0.6,Math.min(2.5,vbW/320));
  let extra='';
  /* helper: polygon centroid */
  const polyCentroid=pts=>{
    let ax=0,ay=0,n=pts.length;
    pts.forEach(p=>{ax+=p[0];ay+=p[1];});
    return[ax/n,ay/n];
  };
  const parsePoly=s=>s.trim().split(/[\s,]+/).reduce((a,v,i,arr)=>{
    if(i%2===0)a.push([+v,+arr[i+1]]);return a;},[]);
  if(o.align){
    const rt=o.align.pts;
    const dPath='M'+rt.map(q=>q[0].toFixed(1)+' '+q[1].toFixed(1)).join(' L');
    const nA=Math.max(2,Math.round(rt.length*Math.min(o.align.acq,100)/100));
    const dDone='M'+rt.slice(0,nA).map(q=>q[0].toFixed(1)+' '+q[1].toFixed(1)).join(' L');
    const st=rt[0],en=rt[rt.length-1];

    /* ── Outer parcels first (lower z-order, reduced opacity = unaffected land) ── */
    extra+=o.align.parcels.filter(p=>!p.id.startsWith('IP-')).map((p,_)=>{
      const i=o.align.parcels.indexOf(p);
      const c=PCL_COL[p.stage]||'#94a3b8';
      const dim=S.flowFilter&&p.stage!==S.flowFilter;
      return `<polygon class="pcl" data-p="${i}" points="${p.poly}" fill="${c}" fill-opacity="${dim?'.07':'.32'}" stroke="#cbd5e1" stroke-width="0.9" vector-effect="non-scaling-stroke"/>`;
    }).join('');

    /* ── Inner corridor parcels (affected — full colour) ── */
    extra+=o.align.parcels.filter(p=>p.id.startsWith('IP-')).map((p,_)=>{
      const i=o.align.parcels.indexOf(p);
      const c=p.stage==='Disputed'?PCL_DISPUTED:PCL_COL[p.stage];
      const dim=S.flowFilter&&p.stage!==S.flowFilter&&p.stage!=='Disputed';
      return `<polygon class="pcl" data-p="${i}" points="${p.poly}" fill="${c}" fill-opacity="${dim?'.15':'.90'}" stroke="#fff" stroke-width="1.5" vector-effect="non-scaling-stroke"/>`;
    }).join('');

    /* ── Road corridor layers (drawn ABOVE parcels so centreline is always visible) ── */
    /* soft blue glow = corridor buffer */
    extra+=`<path d="${dPath}" fill="none" stroke="#3b82f6" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" opacity=".14"/>`;
    /* blue dashed boundary */
    extra+=`<path d="${dPath}" fill="none" stroke="#2563eb" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="22 16" opacity=".28"/>`;
    /* base road (dark) */
    extra+=`<path d="${dPath}" fill="none" stroke="#1f2937" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" opacity=".80"/>`;
    /* acquired segment (green) */
    extra+=`<path d="${dDone}" fill="none" stroke="#16a34a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
    /* centreline: red dashed */
    extra+=`<path d="${dPath}" fill="none" stroke="#ef4444" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="9 7" opacity=".92"/>`;

    /* ── Survey labels — inner parcels only (outer parcels get no label to avoid clutter) ── */
    extra+=o.align.parcels.filter(p=>p.id.startsWith('IP-')).map(p=>{
      const dim=S.flowFilter&&p.stage!==S.flowFilter&&p.stage!=='Disputed';
      if(dim)return '';
      const verts=parsePoly(p.poly);if(!verts.length)return '';
      const[cx,cy]=polyCentroid(verts);
      const fs=Math.max(4.5,Math.min(8.5,labelScale*6.8));
      return `<text x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" text-anchor="middle" dominant-baseline="middle"
        font-size="${fs}" font-weight="700" fill="#0f172a" paint-order="stroke"
        stroke="#fff" stroke-width="2.2" stroke-linejoin="round"
        style="pointer-events:none;user-select:none">${esc(p.survey)}</text>`;
    }).join('');

    /* Start / End markers */
    extra+=`<circle cx="${st[0].toFixed(1)}" cy="${st[1].toFixed(1)}" r="7" fill="#16a34a" stroke="#fff" stroke-width="2.5"/><text x="${st[0].toFixed(1)}" y="${(st[1]+3).toFixed(1)}" text-anchor="middle" font-size="8" font-weight="800" fill="#fff">S</text>`;
    extra+=`<circle cx="${en[0].toFixed(1)}" cy="${en[1].toFixed(1)}" r="7" fill="#0f172a" stroke="#fff" stroke-width="2.5"/><text x="${en[0].toFixed(1)}" y="${(en[1]+3).toFixed(1)}" text-anchor="middle" font-size="8" font-weight="800" fill="#fff">E</text>`;

  }
  return `<svg id="${o.id||'tmap'}" viewBox="${vb}" preserveAspectRatio="xMidYMid meet" style="${o.style||'width:100%;height:auto;display:block'}">
    <g>${paths}${extra}</g></svg>`;
}

function flowStrip(p){
  const idx=STAGES.indexOf(p.stage);
  return `<div class="mapflow">${STAGES.map((s,i)=>`<div class="mfs ${i<idx?'done':i===idx?'act':''}" data-act="flowf" data-s="${s}" title="Click to highlight parcels at stage: ${s}"><span class="mn">${i<idx?'✓':i+1}</span><span>${s}</span></div>${i<STAGES.length-1?'<span class="mfs-arrow">→</span>':''}`).join('')}</div>`;
}
function stageLegend(counts){
  return Object.keys(PCL_COL).map(k=>`<div class="li" style="${S.flowFilter===k?'':'opacity:.55'};cursor:pointer" data-act="flowf" data-s="${k}"><span class="dotc" style="background:${PCL_COL[k]}"></span>${k}<b>${counts[k]||0}</b></div>`).join('')
   +`<div class="li" style="cursor:pointer"><span class="dotc" style="background:${PCL_DISPUTED}"></span>Disputed<b>${counts['Disputed']||0}</b></div>`;
}
function gisHTML(){
  const d=S.gDist?DAGG[S.gDist]:null;
  let cor=null,p=null;
  if(S.gDist&&S.gProj){p=prj(S.gProj);cor=corridorFor(p);}
  const vb=S.gvb?S.gvb.join(' '):null;
  let panel;
  if(!S.gDist){
    const topD=Object.keys(DAGG).filter(x=>DAGG[x]).sort((a,b)=>DAGG[b].prog-DAGG[a].prog).slice(0,8);
    panel=`<div class="card"><h3>Legend</h3><div class="csub">${S.mapMode==='status'?'District status = worst project status':S.mapMode==='progress'?'Avg acquisition progress':'Max project risk score'}</div>
      <div class="legend">
      ${S.mapMode==='status'?['On Track','At Risk','Delayed'].map(s=>`<div class="li"><span class="dotc" style="background:${ST_COL[s]}"></span>${s}<b>${Object.keys(DAGG).filter(x=>DAGG[x]&&DAGG[x].status===s).length}</b></div>`).join('')+`<div class="li"><span class="dotc" style="background:#e2e8f0"></span>No Projects<b>${33-Object.keys(DAGG).filter(x=>DAGG[x]).length}</b></div>`
       :S.mapMode==='progress'?`<div style="height:10px;border-radius:6px;background:linear-gradient(90deg,#f0f5f8,#7fd08f,#166534)"></div><div style="display:flex;justify-content:space-between;font-size:11px;color:#64748b"><span>0%</span><span>100% progress</span></div>`
       :`<div style="height:10px;border-radius:6px;background:linear-gradient(90deg,#fafcfd,#fbbf77,#b91c1c)"></div><div style="display:flex;justify-content:space-between;font-size:11px;color:#64748b"><span>0</span><span>100 risk</span></div>`}
      </div></div>
    <div class="card" style="margin-top:16px"><h3>Districts</h3><div class="csub">Click to inspect</div>
      ${topD.map(x=>`<div class="dbar" data-act="gsel" data-d="${esc(x)}"><span class="dn">${esc(x)}</span><div class="progbar"><i style="width:${DAGG[x].prog}%;background:${DAGG[x].prog>70?'#16a34a':DAGG[x].prog>50?'#f59e0b':'#ef4444'}"></i></div><span class="dv">${DAGG[x].prog}%</span></div>`).join('')}</div>`;
  } else if(!S.gProj){
    panel=`<div class="card">
      <div class="crumb" style="margin-bottom:10px"><span class="lnk" data-act="gclear">Telangana</span> ${ic('chevR',12)} <b>${esc(S.gDist)}</b></div>
      <h3 style="font-size:16px">${esc(S.gDist)}</h3>
      <div class="csub">${d?d.prjs.length+' active project'+(d.prjs.length>1?'s':'')+' · '+inr(d.land)+' ha proposed':'No active projects recorded'}</div>
      ${d?`<div class="mini-metrics" style="grid-template-columns:1fr 1fr;margin:0 0 12px">
        <div class="mm"><span>LAND PROPOSED</span><b>${inr(d.land)} ha</b></div>
        <div class="mm"><span>PROGRESS</span><b>${d.prog}%</b></div>
        <div class="mm"><span>FAMILIES</span><b>${inr(d.fam)}</b></div>
        <div class="mm"><span>RISK</span><b style="color:${d.risk>60?'#b91c1c':d.risk>40?'#b45309':'#15803d'}">${d.risk}/100</b></div></div>`:'<div class="ok-strip" style="margin:0">No land acquisition activity recorded in this district.</div>'}
      ${d?`<div style="font-weight:700;font-size:12px;color:#475569;margin:12px 0 6px">PROJECTS IN DISTRICT — click to open alignment</div>`+
        d.prjs.map(pid=>{const p2=prj(pid);return `<div class="dbar" data-act="gproj" data-id="${pid}" style="padding:9px 0;border-bottom:1px solid #eef1f6">
          <span class="dn" style="width:auto;flex:1"><b style="color:var(--ink)">${esc(p2.name)}</b><br><span style="font-size:11px;color:#94a3b8">${pid} · ${p2.sector}</span></span>
          <span class="badge ${ST_BG[p2.status]}">${p2.status}</span><span class="dv">${p2.prog}%</span></div>`;}).join('')
      :''}
    </div>`;
  } else {
    const counts={};cor.parcels.forEach(x=>counts[x.stage]=(counts[x.stage]||0)+1);
    const km=Math.round(cor.route.len*0.24);
    panel=`<div class="card">
      <div class="crumb" style="margin-bottom:10px"><span class="lnk" data-act="gclear">Telangana</span> ${ic('chevR',12)} <span class="lnk" data-act="gsel" data-d="${esc(S.gDist)}">${esc(S.gDist)}</span> ${ic('chevR',12)} <b>Alignment</b></div>
      <h3 style="font-size:15.5px">${esc(p.name)}</h3>
      <div class="csub">${p.id} · ${p.sector}</div>
      <div class="mini-metrics" style="grid-template-columns:1fr 1fr;margin:0 0 12px">
        <div class="mm"><span>ALIGNMENT</span><b>≈ ${km} km</b></div>
        <div class="mm"><span>LAND ACQUIRED</span><b style="color:#15803d">${p.acq}%</b></div>
        <div class="mm"><span>DISTRICTS</span><b>${p.dists.length}</b></div>
        <div class="mm"><span>CORRIDOR PARCELS</span><b>${cor.parcels.filter(x=>x.id.startsWith('IP-')).length}</b></div></div>
      <div style="font-weight:700;font-size:12px;color:#475569;margin:12px 0 2px">CADASTRAL CORRIDOR MAP</div>
      <div class="hint" style="margin:0 0 8px">
        <div style="display:flex;flex-direction:column;gap:4px;font-size:11.5px">
          <span><span style="display:inline-block;width:22px;height:3px;background:#16a34a;border-radius:2px;vertical-align:middle;margin-right:5px"></span>Green line — land acquired</span>
          <span><span style="display:inline-block;width:22px;height:3px;background:#2563eb;border-radius:2px;vertical-align:middle;margin-right:5px;opacity:.5"></span>Blue dashed — corridor boundary</span>
          <span><span style="display:inline-block;width:22px;height:2px;background:#ef4444;border-radius:2px;vertical-align:middle;margin-right:5px"></span>Red dashed — road centreline</span>
        </div>
        <span style="display:inline-block;margin-top:6px"><b>${cor.parcels.filter(x=>x.id.startsWith('IP-')).length} affected parcels</b> physically intersect the corridor · <b>${cor.parcels.filter(x=>!x.id.startsWith('IP-')).length} outer parcels</b> outside corridor · stage: <b>${p.stage}</b>.</span>
      </div>
      <div style="font-weight:700;font-size:12px;color:#475569;margin:12px 0 6px">PARCEL STAGES</div>
      <div class="legend">${stageLegend(counts)}</div>
    </div>
    <div class="card" style="margin-top:16px"><div class="chead"><h3>Corridor Parcels</h3><span class="badge bg-gry">${S.flowFilter?esc(S.flowFilter)+' only':'All stages'}</span></div>
      <div style="max-height:300px;overflow:auto">
      <table class="tbl"><thead><tr><th>Survey No.</th><th>Owner</th><th>Area</th><th>Stage</th></tr></thead><tbody>
      ${cor.parcels.filter(x=>!S.flowFilter||x.stage===S.flowFilter||x.stage==='Disputed').map(x=>{const c=x.stage==='Disputed'?PCL_DISPUTED:PCL_COL[x.stage];
        return `<tr class="rowlink" data-act="psel" data-i="${cor.parcels.indexOf(x)}"><td><b>${x.survey}</b></td><td>${esc(x.owner)}<br><span class="gid">${esc(x.village)} · ${x.cat}</span></td><td class="num">${x.area} ha</td><td><span class="badge" style="background:${c}1c;color:${c}">${x.stage}</span></td></tr>`;}).join('')}
      </tbody></table></div></div>`;
  }
  const mapBody = cor?mapSVG({id:'gmap',mode:S.mapMode,selDist:S.gDist,vb,align:{pts:cor.route.pts,acq:p.acq,parcels:cor.parcels},routeDists:p.dists,style:'width:100%;height:auto;max-height:640px;display:block;margin:0 auto'})
    :mapSVG({id:'gmap',mode:S.mapMode,selDist:S.gDist,vb,style:'width:100%;height:auto;max-height:640px;display:block;margin:0 auto'});
  return `<div class="searchbar">
      <div style="font-weight:700;font-size:15.5px;flex:1">GIS Land Map ${S.gProj?'<span style="color:#94a3b8;font-weight:500">· Alignment View</span>':S.gDist?`<span style="color:#94a3b8;font-weight:500">· ${esc(S.gDist)}</span>`:'<span style="color:#94a3b8;font-weight:500">· Telangana State</span>'}</div>
      ${['status|Status','progress|Progress Heat','risk|Risk'].map(m=>{const[k,l]=m.split('|');return `<button class="modechip ${S.mapMode===k?'on':''}" data-act="mode" data-m="${k}">${l}</button>`;}).join('')}
    </div>
  <div class="gis-wrap">
    <div class="card" style="padding:10px">
      <div id="mapwrap" style="min-height:420px">
        ${mapBody}
        ${cor?`<div class="mapbadge"><b>${esc(p.name)}</b><br>Alignment ≈ ${Math.round(cor.route.len*0.24)} km · ${p.dists.length} districts · ${cor.parcels.length} parcels · <span style="color:#6ee7a0">${p.acq}% acquired</span></div>`:''}
        ${cor?flowStrip(p):''}
        <div id="maptip"></div>
      </div>
      <div style="display:flex;gap:10px;align-items:center;padding:8px 6px 4px;flex-wrap:wrap">
        ${S.gDist?`<button class="btn btn-outline btn-sm" data-act="gclear">${ic('back',14)} State View</button>`:''}
        ${S.flowFilter?`<button class="btn btn-blue-soft btn-sm" data-act="flowf" data-s="">✕ Clear stage filter: ${esc(S.flowFilter)}</button>`:''}
        <span style="flex:1"></span>
        <button class="sqbtn" data-act="gz" data-z="in">${ic('plus',15)}</button>
        <button class="sqbtn" data-act="gz" data-z="out">−</button>
        <button class="sqbtn" data-act="gz" data-z="reset">${ic('map',14)}</button>
      </div>
    </div>
    <div class="gis-panel" style="display:flex;flex-direction:column;gap:0">${panel}</div>
  </div>`;
}

function mountMap(id,o){
  const svg=document.getElementById(id);if(!svg)return;
  const tip=document.getElementById('maptip');
  const wrap=svg.parentElement;
  svg.querySelectorAll('.md').forEach(pa=>{
    pa.addEventListener('mousemove',e=>{
      const dn=pa.dataset.d,a=DAGG[dn],r=wrap.getBoundingClientRect();
      tip.style.display='block';tip.style.left=(e.clientX-r.left)+'px';tip.style.top=(e.clientY-r.top)+'px';
      tip.innerHTML=`<b>${esc(dn)}</b><br>`+(a?`${a.prjs.length} project(s) · ${a.prog}% avg progress<br>${inr(a.land)} ha proposed · risk ${a.risk}/100`:'No active projects');
    });
    pa.addEventListener('mouseleave',()=>tip.style.display='none');
    if(o.clickDist)pa.addEventListener('click',()=>{if(mountMap._moved)return;o.clickDist(pa.dataset.d);});
  });
  if(o.parcels){
    svg.querySelectorAll('.pcl').forEach(pl=>{
      const x=o.parcels[+pl.dataset.p];
      pl.addEventListener('mousemove',e=>{
        const r=wrap.getBoundingClientRect();tip.style.display='block';
        tip.style.left=(e.clientX-r.left)+'px';tip.style.top=(e.clientY-r.top)+'px';
        tip.innerHTML=`<b>${x.survey}</b> · ${x.stage}${x.stage==='Disputed'?' ⚠':''}<br>${esc(x.owner)} · ${x.area} ha<br>${esc(x.village)} · workflow position ${(x.t*100).toFixed(0)}%`;});
      pl.addEventListener('mouseleave',()=>tip.style.display='none');
      if(o.parcelClick)pl.addEventListener('click',()=>{if(!mountMap._moved)o.parcelClick(+pl.dataset.p);});
    });
  }
  if(o.pan){
    let drag=null;mountMap._moved=false;
    svg.addEventListener('mousedown',e=>{const vb=svg.viewBox.baseVal;drag={x:e.clientX,y:e.clientY,vb:[vb.x,vb.y,vb.width,vb.height]};mountMap._moved=false;});
    window.addEventListener('mousemove',e=>{
      if(!drag)return;
      if(Math.abs(e.clientX-drag.x)+Math.abs(e.clientY-drag.y)>4)mountMap._moved=true;
      if(!mountMap._moved)return;
      const r=svg.getBoundingClientRect(),k=drag.vb[2]/r.width;
      const nvb=`${drag.vb[0]-(e.clientX-drag.x)*k} ${drag.vb[1]-(e.clientY-drag.y)*k} ${drag.vb[2]} ${drag.vb[3]}`;
      svg.setAttribute('viewBox',nvb);S.gvb=nvb.split(' ').map(Number);
    });
    window.addEventListener('mouseup',()=>drag=null);
  }
}
function gzoom(z){
  const svg=document.getElementById('gmap');if(!svg)return;
  if(z==='reset'){S.gvb=null;render();return;}
  const vb=svg.getAttribute('viewBox').split(' ').map(Number);
  const f=z==='in'?0.76:1.3,cx=vb[0]+vb[2]/2,cy=vb[1]+vb[3]/2,w=vb[2]*f,h=vb[3]*f;
  svg.setAttribute('viewBox',`${cx-w/2} ${cy-h/2} ${w} ${h}`);S.gvb=[cx-w/2,cy-h/2,w,h];
}

/* ── Area-marking map for the proposal form ── */
function areaMapSVG(selSet){
  const sel=selSet||new Set();
  const paths=MAP.districts.map(d=>{
    const isSel=sel.has(d.n);
    const fill=isSel?'#bbf7d0':'#eef1f5';
    const stroke=isSel?'#16a34a':'#d1d5db';
    const sw=isSel?3:1.2;
    return `<path class="amd" data-d="${d.n}" d="${d.d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" style="cursor:pointer;transition:fill .15s"/>`;
  }).join('');
  return `<svg id="amap" viewBox="0 0 ${MAP.w} ${MAP.h}" preserveAspectRatio="xMidYMid meet" style="width:100%;height:auto;display:block;max-height:420px"><g>${paths}</g></svg>`;
}

function mountAreaMap(){
  const svg=document.getElementById('amap');if(!svg)return;
  if(!S.propDists)S.propDists=new Set(['Adilabad']);
  const tip=document.getElementById('area-maptip');
  const wrap=document.getElementById('area-map-wrap');

  const refreshList=()=>{
    const badge=document.getElementById('area-count');
    if(badge)badge.textContent=S.propDists.size+' district'+(S.propDists.size!==1?'s':'')+' selected';
    const listEl=document.getElementById('area-sel-list');
    if(!listEl)return;
    if(S.propDists.size===0){
      listEl.innerHTML='<span style="font-size:12px;color:#94a3b8">Click districts on the map to select</span>';
    } else {
      listEl.innerHTML=[...S.propDists].map(d=>`<div style="display:flex;align-items:center;gap:8px;font-size:12.5px;background:#e8f7ee;color:#15803d;border-radius:7px;padding:5px 10px;font-weight:600">
        <span style="width:9px;height:9px;background:#16a34a;border-radius:50%;display:inline-block"></span>${esc(d)}
        <button type="button" class="area-desel" data-d="${esc(d)}" style="margin-left:auto;background:none;border:none;cursor:pointer;color:#15803d;font-size:16px;line-height:1">&times;</button>
      </div>`).join('');
      listEl.querySelectorAll('.area-desel').forEach(btn=>{
        btn.addEventListener('click',()=>toggleDist(btn.dataset.d));
      });
    }
    /* update dropdown to first selected district */
    const dd=document.getElementById('np-dist');
    if(dd&&S.propDists.size>0){
      const first=[...S.propDists][0];
      for(const opt of dd.options){if(opt.text===first){opt.selected=true;break;}}
    }
  };

  const paintDist=(dn,sel)=>{
    const pa=svg.querySelector(`.amd[data-d="${dn}"]`);
    if(!pa)return;
    pa.setAttribute('fill',sel?'#bbf7d0':'#eef1f5');
    pa.setAttribute('stroke',sel?'#16a34a':'#d1d5db');
    pa.setAttribute('stroke-width',sel?3:1.2);
  };

  const toggleDist=dn=>{
    if(S.propDists.has(dn)){S.propDists.delete(dn);paintDist(dn,false);}
    else{S.propDists.add(dn);paintDist(dn,true);}
    refreshList();
  };

  svg.querySelectorAll('.amd').forEach(pa=>{
    const dn=pa.dataset.d;
    pa.addEventListener('mousemove',e=>{
      if(!tip||!wrap)return;
      const r=wrap.getBoundingClientRect();
      tip.style.display='block';tip.style.left=(e.clientX-r.left+14)+'px';tip.style.top=(e.clientY-r.top-38)+'px';
      tip.innerHTML=`<b>${esc(dn)}</b><br>${S.propDists.has(dn)?'\u2713 Selected \u2014 click to deselect':'Click to mark for acquisition'}`;
    });
    pa.addEventListener('mouseleave',()=>{if(tip)tip.style.display='none';});
    pa.addEventListener('click',()=>toggleDist(dn));
  });

  /* reset button */
  const resetBtn=document.getElementById('area-reset-btn');
  if(resetBtn){
    resetBtn.addEventListener('click',()=>{
      [...S.propDists].forEach(d=>paintDist(d,false));
      S.propDists=new Set();
      refreshList();
    });
  }

  /* wire initial deselect buttons in the sidebar list */
  document.querySelectorAll('.area-desel').forEach(btn=>{
    btn.addEventListener('click',()=>toggleDist(btn.dataset.d));
  });
}

