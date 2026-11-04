/* ===== 13 · APP — render loop, map wiring, events, boot + session ===== */
function render(){
  const app=document.getElementById('app');
  if(!S.user){app.innerHTML=loginHTML();return;}
  let c='',t='Dashboard',s='Overview of land acquisition activities across Telangana';
  switch(S.page){
    case 'projects':t='Projects';s=PROJECTS.length+' active projects across Telangana';c=projectsHTML();break;
    case 'project':t='Project Details';c=projHTML(S.project);break;
    case 'gis':t='GIS Land Map';s='Cadastral parcel intelligence — 33 districts';c=gisHTML();break;
    case 'acquisition':t='Acquisition';c=acqHTML();break;
    case 'compensation':t='Compensation';c=compHTML();break;
    case 'alerts':t='Alerts & Risk';c=alertsHTML();break;
    default:c=dashboardHTML();
  }
  app.innerHTML=shell(c,t,s);
  afterRender();
  saveSession();
}
function afterRender(){
  const dm=document.getElementById('dmap');
  if(dm)mountMap('dmap',{clickDist:d=>{S.page='gis';S.gDist=d;S.gProj=null;S.gvb=fitVB(d);render();}});
  const gm=document.getElementById('gmap');
  if(gm)mountMap('gmap',{pan:true,clickDist:d=>{S.gDist=d;S.gProj=null;S.gvb=fitVB(d);render();},
    parcels:S.gProj?parcelsFor(prj(S.gProj)):null,
    parcelClick:S.gProj?i=>parcelModal(S.gProj,S.gDist,i):null});
  const pm=document.getElementById('pmap');
  if(pm&&S.page==='project'&&S.projTab==='parcels'&&S.project){const p=prj(S.project);if(p)mountMap('pmap',{parcels:parcelsFor(p),parcelClick:i=>parcelModal(p.id,null,i)});}
  if(document.getElementById('aw-out'))awardCalc();
  if(document.getElementById('amap'))mountAreaMap();
  tickClock();
}
function tickClock(){
  const dt=fmtNow();
  const ct=document.getElementById('clk-time');if(ct)ct.textContent=dt.time;
  const cd=document.getElementById('clk-date');if(cd)cd.textContent=dt.day+', '+dt.date;
  const ft=document.getElementById('foot-ts');if(ft)ft.textContent=dt.date+', '+dt.time;
}
// Start global clock — runs every second, mutates only clock elements (no full re-render)
if(!window._clockStarted){window._clockStarted=true;setInterval(tickClock,1000);}
function awardCalc(){
  const area=parseFloat(document.getElementById('aw-area')?.value)||0;
  const mv=parseFloat(document.getElementById('aw-mv')?.value)||0;
  const mult=parseFloat(document.getElementById('aw-mult')?.value)||1;
  const yrs=parseFloat(document.getElementById('aw-years')?.value)||0;
  const base=area*mv*mult,add=base*0.12*yrs,sol=(base+add),tot=base+add+sol;
  const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v;};
  set('aw-base','₹ '+base.toFixed(2)+' L');
  set('aw-add','₹ '+add.toFixed(2)+' L');
  set('aw-sol','₹ '+sol.toFixed(2)+' L');
  set('aw-tot','₹ '+tot.toFixed(2)+' L');
  const pid=S.awPrj||'NLAMS-TG-006';
  set('aw-perfam','₹ '+(tot/Math.max(prj(pid).fam,1)*100000).toFixed(0));
}
function doLogin(demo){
  const role=demo?'State Authority (Telangana)':(document.getElementById('lg-role')?.value||'State Authority (Telangana)');
  const names={'Central Authority':'S. Raghunandan IAS','State Authority (Telangana)':'A. Sailaja IAS','District Authority':'R. Venkat Reddy','Field Officer':'M. Anjaneyulu'};
  S.user={name:names[role]||'A. Sailaja IAS',role};S.page='dashboard';
  toast('Welcome '+S.user.name.split(' ').slice(0,2).join(' ')+' — '+role,'ok');
  render();
}

/* ---------- global event delegation ---------- */
document.addEventListener('click',e=>{
  const el=e.target.closest('[data-act]');if(!el)return;
  const act=el.dataset.act,id=el.dataset.id;
  switch(act){
    case 'login':doLogin(false);break;
    case 'demo':doLogin(true);break;
    case 'logout':clearSession();S.user=null;render();break;
    case 'nav':S.page=el.dataset.p;if(el.dataset.s)S.acq=el.dataset.s;render();break;
    case 'acq':S.page='acquisition';S.acq=el.dataset.s;render();break;
    case 'proj':S.page='project';S.project=id;S.projTab='overview';closeModal();render();break;
    case 'ptab':S.projTab=el.dataset.t;render();break;
    case 'mode':S.mapMode=el.dataset.m;render();break;
    case 'gz':gzoom(el.dataset.z);break;
    case 'gsel':case 'gopen':{S.page='gis';if(act==='gsel'){S.gDist=el.dataset.d;S.gProj=null;}else{S.gDist=el.dataset.d||S.gDist;S.gProj=el.dataset.id||S.gProj||null;}S.flowFilter=null;S.gvb=S.gProj?fitRouteVB(prj(S.gProj)):fitVB(S.gDist);render();break;}
    case 'gproj':{const p=prj(id);S.page='gis';S.gProj=id;S.gDist=p.dists[0];S.gvb=fitRouteVB(p);S.flowFilter=null;render();break;}
    case 'gclear':S.gDist=null;S.gProj=null;S.gvb=null;S.flowFilter=null;render();break;
    case 'psel':parcelModal(S.gProj,null,+el.dataset.i);break;
    case 'psel2':parcelModal(S.project,null,+el.dataset.i);break;
    case 'flowf':S.flowFilter=el.dataset.s||null;render();break;
    case 'modal-x':closeModal();break;
    case 'review':reviewModal(id);break;
    case 'decide':{
      const x=SPROPS.find(s=>s.id===id);
      x.status=el.dataset.dec;
      closeModal();
      // If approved → promote the proposal into the active PROJECTS list with a proper NLAMS-TG-* ID
      if(el.dataset.dec==='Approved' && !x.nlamsId){
        // Generate next sequential NLAMS-TG-* ID based on current PROJECTS count
        const nextNum=PROJECTS.length+1;
        const nlamsId='NLAMS-TG-'+String(nextNum).padStart(3,'0');
        x.nlamsId=nlamsId; // store back so gennotif can reference it
        const newPrj={
          id: nlamsId,
          name: x.name,
          sector: x.sector||'Infrastructure',
          dept: 'Revenue Department',
          dists: [x.dist||'Hyderabad'],
          land: x.land||0,
          acq: 0,
          prog: 0,
          status: 'On Track',
          risk: 15,
          fam: x.fam||0,
          budget: Math.round((x.land||0)*0.5),
          stage: 'Scrutiny',
          started: new Date().toISOString().slice(0,10),
          avgL: 18,
          vil: [x.dist||'TBD']
        };
        PROJECTS.push(newPrj);
        S.verDone[nlamsId]=new Set();
        toast(nlamsId+' approved → moved to Sec-11 Notification queue','ok');
      } else if(el.dataset.dec!=='Approved'){
        toast('Proposal '+x.status.toLowerCase(),'warn');
      }
      render();
      break;
    }
    case 'gennotif':{
      // pid may be a PROP-TG-* (from SPROPS) or NLAMS-TG-* (already in PROJECTS)
      const propEntry=SPROPS.find(x=>x.id===id||x.nlamsId===id);
      // Resolve the real NLAMS project id
      const nlamsId=propEntry?propEntry.nlamsId:id;
      const resolvedPrj=prj(nlamsId)||(propEntry?{name:propEntry.name,land:propEntry.land,fam:propEntry.fam}:null);
      if(!resolvedPrj){toast('Error: project not found — approve it in Scrutiny first','warn');break;}
      // Advance stage to Notification in PROJECTS
      if(nlamsId){
        const liveP=prj(nlamsId);
        if(liveP && liveP.stage==='Scrutiny') liveP.stage='Notification';
      }
      const nd=fmtNow();
      const notifNo='TG/Sec11/2026/0'+(41+SNOTIF.length+1);
      SNOTIF.unshift({no:notifNo,pid:nlamsId||id,date:nd.date,land:resolvedPrj.land||0,fam:resolvedPrj.fam||0,status:'Published'});
      // Mark the proposal as notified so it leaves the queue
      if(propEntry) propEntry.notified=true;
      toast('Notification '+notifNo+' published — project added to Projects list','ok');
      // Navigate to Projects list so the user can see the new entry
      S.page='projects';render();break;
    }
    case 'vfy':{
      const pid=el.dataset.pid, pcl=el.dataset.pcl;
      // Update local state immediately so UI responds at once
      S.verDone[pid].add(pcl);
      // Also update corridor parcel stage directly in cache
      const _p=prj(pid); if(_p){const _c=corridorFor(_p);if(_c){const _px=_c.parcels.find(x=>x.id===pcl);if(_px)_px.stage='Verified';}}
      toast('Parcel '+pcl+' GPS-verified & matched with Dharani','ok');
      render();
      // Background sync if API available
      if (window.API_CONNECTED) {
        fetch(`/api/projects/${pid}/parcels/${pcl}/verify`, { method: 'POST' })
          .then(r => r.json())
          .catch(e => console.warn('Verify API sync failed:', e));
      }
      break;
    }
    case 'genaward':toast('Award draft generated → sent to DLAO for e-signature','ok');break;
    case 'posnotice':toast('Possession notice (Sec-38) issued for '+id,'ok');break;
    case 'pay':{
      const pid=el.dataset.pid, fid=el.dataset.fid, amt=parseFloat(el.dataset.amt);
      // Update local state immediately so UI responds at once
      S.paid[pid+':'+fid]=1;
      toast('₹ '+(amt*100000).toLocaleString('en-IN')+' released to '+fid+' via CFMS-DBT','ok');
      render();
      // Background sync if API available
      if (window.API_CONNECTED) {
        fetch(`/api/families/${fid}/pay`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: amt })
        })
        .then(r => r.json())
        .catch(e => console.warn('Pay API sync failed:', e));
      }
      break;
    }
  }
});
document.addEventListener('submit',e=>{
  if(e.target.id==='proposal-form'){
    e.preventDefault();
    const name=document.getElementById('np-name').value||'Untitled Proposal';
    const selDists=S.propDists&&S.propDists.size>0?[...S.propDists]:[];
    SPROPS.unshift({id:'PROP-TG-'+(17+SPROPS.length-2),name,dist:document.getElementById('np-dist').value,
      dists:selDists,
      land:+document.getElementById('np-land').value||0,fam:+document.getElementById('np-fam').value||0,
      sector:document.getElementById('np-sector').value,docs:5,status:'Pending'});
    S.propDists=new Set(); /* reset for next proposal */
    S.page='acquisition';S.acq='scrutiny';render();
    toast('Proposal submitted → now in Scrutiny queue','ok');
  }
});
document.addEventListener('input',e=>{
  const id=e.target.id;
  if(id==='prj-q'){S.scrQ=e.target.value;const tb=document.getElementById('prj-tbody');
    if(tb){const q=S.scrQ.toLowerCase();
      tb.innerHTML=PROJECTS.filter(p=>!q||p.name.toLowerCase().includes(q)||p.id.toLowerCase().includes(q)||p.dists.join(' ').toLowerCase().includes(q)).map(prjRow).join('');}}
  if(id&&id.startsWith('aw-')&&id!=='aw-out')awardCalc();
});
document.addEventListener('change',e=>{
  const id=e.target.id;
  if(id==='ver-prj'){S.verPrj=e.target.value;render();}
  if(id==='pay-prj'){S.payPrj=e.target.value;render();}
  if(id==='aw-prj'){S.awPrj=e.target.value;render();}
  if(id==='aw-mult')awardCalc();
});

/* seed verification state + boot (restores session after refresh) */
PROJECTS.forEach(p=>{const pd=parcelsFor(p);const b=Math.round(pd.length*p.acq/100);
  for(let i=0;i<b;i++)S.verDone[p.id].add(pd[i].id);});
window.S=S;
/* sync frontend aggregates when DB data changes */
function syncFrontend(projects, alerts, users) {
  PROJECTS.length = 0;
  PROJECTS.push(...projects);
  ALERTS.length = 0;
  ALERTS.push(...alerts);
  USERS.length = 0;
  USERS.push(...users);

  // Clear global CORR cache
  const cacheObj = window.CORR || {};
  for (const k in cacheObj) delete cacheObj[k];

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
}

window.API_CONNECTED = false;
window.fetchAppState = function() {
  if (!window.API_CONNECTED) return Promise.resolve();
  return Promise.all([
    fetch('/api/projects').then(r => r.json()),
    fetch('/api/alerts').then(r => r.json()),
    fetch('/api/users').then(r => r.json()),
    fetch('/api/payments').then(r => r.json()).catch(() => [])
  ]).then(([projects, alerts, users, payments]) => {
    if (Array.isArray(projects) && Array.isArray(alerts) && Array.isArray(users)) {
      syncFrontend(projects, alerts, users);
    }
    
    // Sync S.paid mapping safely
    S.paid = {};
    if (Array.isArray(projects) && Array.isArray(payments)) {
      projects.forEach(p => {
        payments.forEach(fid => {
          S.paid[p.id + ':' + fid] = 1;
        });
      });
    }

    if (!Array.isArray(projects)) return Promise.resolve();

    return Promise.all(
      projects.map(p => 
        fetch(`/api/projects/${p.id}/alignment`)
          .then(r => r.json())
          .then(align => {
            const cor = corridorFor(p);
            if (align && Array.isArray(align.parcels)) {
              cor.parcels.forEach(parcel => {
                const match = align.parcels.find(x => x.id === parcel.id);
                if (match) {
                  parcel.stage = match.stage;
                  parcel.owner = match.owner;
                  parcel.area = match.areaHa;
                  parcel.village = match.village;
                  parcel.survey = match.survey;
                }
              });
              
              S.verDone[p.id] = new Set();
              align.parcels.forEach(x => {
                if (['Verified', 'Awarded', 'Possession', 'Compensated'].includes(x.stage)) {
                  S.verDone[p.id].add(x.id);
                }
              });
            }
          })
          .catch(e => console.warn(e))
      )
    );
  }).catch(e => console.error(e));
};

/* backend connectivity probe — SPA degrades gracefully to offline mode */
(function(){
  try{
    fetch('/api/health').then(r=>r.json()).then(j=>{
      if(j&&j.ok){
        const b=document.getElementById('api-badge');
        if(b){b.textContent='◉ API connected · '+j.service;b.style.color='#16a34a';}
        window.API_CONNECTED = true;
        window.fetchAppState().then(() => render());
      }
    }).catch(()=>{});
  }catch(e){}
})();

(function boot(){
  const sess=loadSession();
  if(sess&&sess.u){
    S.user=sess.u;S.page=sess.p||'dashboard';S.project=sess.pr;S.projTab=sess.pt||'overview';
    S.acq=sess.aq||'scrutiny';S.gDist=sess.gd;S.gProj=sess.gp;S.gvb=sess.gv;S.mapMode=sess.mm||'status';
  }
  render();
})();
