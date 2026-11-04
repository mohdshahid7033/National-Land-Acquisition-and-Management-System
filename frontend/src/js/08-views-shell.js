/* ===== 08 · VIEW: SHELL — sidebar, topbar, page frame, statusbar ===== */
const NAV=[
 {p:'dashboard',t:'Dashboard',i:'home'},
 {p:'projects',t:'Projects',i:'folder'},
 {p:'gis',t:'GIS Land Map',i:'map'},
 {p:'acquisition',t:'Acquisition',i:'layers',sub:[['proposal','Proposal'],['scrutiny','Scrutiny'],['notification','Notification'],['verification','Verification'],['award','Award'],['possession','Possession']]},
 {p:'compensation',t:'Compensation',i:'rupee'},
 {p:'alerts',t:'Alerts & Risk',i:'bell'}
];
function sidebarHTML(){
  const groups=[['Monitoring',new Set(['dashboard','projects','gis','acquisition'])],['Compensation & Risk',new Set(['compensation','alerts'])]];
  let navOut='';
  groups.forEach(([gname,gset])=>{
    navOut+=`<div class="nsec">${gname}</div>`;
    NAV.forEach(n=>{
      if(!gset.has(n.p))return;
      const on = S.page===n.p;
      navOut+=`<div class="ni ${on?'on':''}" data-act="nav" data-p="${n.p}">${ic(n.i)}<span class="nt">${n.t}</span></div>`;
      if(n.sub&&on&&S.acqOpen){n.sub.forEach(s=>{navOut+=`<div class="ni ni-sub ${S.acq===s[0]?'on':''}" data-act="acq" data-s="${s[0]}"><span class="nt">${s[1]}</span></div>`;});}
    });
  });
  const name=S.user.name,ini=name.split(' ').map(w=>w[0]).slice(0,2).join('');
  return `<aside class="sb">
    <div class="sb-brand"><img class="emb-img" src="${EMBLEM}" alt="State Emblem of India"><div><b>NLAMS</b><span>TELANGANA STATE</span></div></div>
    <nav class="sb-nav">${navOut}</nav>
    <div class="sb-foot">
      <div class="sb-user"><div class="av">${ini}</div><div><b>${esc(name)}</b><span>${esc(S.user.role)}</span></div></div>
      <div class="ni" data-act="logout">${ic('logout')}<span class="nt">Logout</span></div>
    </div>
  </aside>`;
}
function fmtNow(){
  const n=new Date();
  const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const hh=n.getHours(),mm=String(n.getMinutes()).padStart(2,'0');
  const ampm=hh>=12?'PM':'AM';const h12=hh%12||12;
  return {
    day:days[n.getDay()],
    date:n.getDate()+' '+months[n.getMonth()]+' '+n.getFullYear(),
    time:h12+':'+mm+' '+ampm
  };
}
function topbarHTML(title,sub){
  const ini=S.user.name.split(' ').map(w=>w[0]).slice(0,2).join('');
  const dt=fmtNow();
  return `<header class="tb">
    <div><div class="tb-title">${title}</div><div class="tb-sub">${sub||('Telangana State · Level: '+S.user.role)}</div></div>
    <div class="tb-right">
      <div class="tb-clock" id="tb-clock" style="text-align:right;line-height:1.3;margin-right:14px">
        <div style="font-size:13.5px;font-weight:700;color:var(--ink);letter-spacing:.5px" id="clk-time">${dt.time}</div>
        <div style="font-size:11px;color:var(--mut)" id="clk-date">${dt.day}, ${dt.date}</div>
      </div>
      <div class="tb-profile"><div class="av">${ini}</div><div><b>${esc(S.user.name)}</b><span>${esc(S.user.role)}</span></div></div>
    </div>
  </header>`;
}
function shell(content,title,sub){
  const dt=fmtNow();
  return `${sidebarHTML()}<main>${topbarHTML(title,sub)}
   <div class="content">${content}</div>
   <footer class="statusbar"><span>Last Updated: <span id="foot-ts">${dt.date}, ${dt.time}</span></span><span><span id="api-badge" style="color:#94a3b8">◉ API: checking…</span> &nbsp;·&nbsp; Designed &amp; Developed for Government of Telangana</span></footer>
  </main>`;
}

