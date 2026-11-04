/* =====================================================================
   06 · STATE — single mutable app state (S), verification seeds and
   sessionStorage persistence (refresh keeps you logged in).
   ===================================================================== */
/* mutable demo state */
const S={user:null,role:'State Authority (Telangana)',page:'dashboard',tab:'overview',acq:'scrutiny',
  gDist:null,gProj:null,gvb:null,mapMode:'status',projTab:'overview',flowFilter:null,
  scrQ:'',docQ:'',docT:'All',repT:null,verDone:{},paid:{},rrDone:{},notif:[],acqOpen:true,notifsSeen:false,
  propDists:new Set(['Adilabad'])};

PROJECTS.forEach(p=>S.verDone[p.id]=new Set());

/* ---------- session persistence (fix: refresh kept the user logged in) ---------- */
const SESS_KEY='nlams_session_v1';
function saveSession(){
  if(!S.user)return;
  try{sessionStorage.setItem(SESS_KEY,JSON.stringify({
    u:S.user,p:S.page,pr:S.project||null,pt:S.projTab||'overview',aq:S.acq||'scrutiny',
    gd:S.gDist||null,gp:S.gProj||null,gv:S.gvb||null,mm:S.mapMode
  }));}catch(e){/* sandboxed preview without storage — session lives in memory only */}
}
function loadSession(){
  try{const r=sessionStorage.getItem(SESS_KEY);return r?JSON.parse(r):null;}catch(e){return null;}
}
function clearSession(){try{sessionStorage.removeItem(SESS_KEY);}catch(e){}}

