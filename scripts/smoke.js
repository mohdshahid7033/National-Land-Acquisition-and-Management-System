/* NLAMS regression check — evaluates the tree-structured modules exactly
   like the browser would (same order), then renders every page/tab and
   verifies the GIS engine + session persistence.   Run: node tools/smoke.js */
const fs = require('fs'), path = require('path');
const ROOT = path.dirname(__dirname);

const els = {}; globalThis.els = els;
const mkel = id => els[id] = els[id] || {id, innerHTML:'', appendChild:()=>{}, remove:()=>{}, style:{}, value:'',
  classList:{add:()=>{},remove:()=>{},toggle:()=>{}}, addEventListener:()=>{}, querySelectorAll:()=>[],
  setAttribute:()=>{}, dataset:{}, getBoundingClientRect:()=>({left:0,top:0,width:100,height:100}),
  viewBox:{baseVal:{x:0,y:0,width:100,height:100}}};
const store = {};
global.sessionStorage = {getItem:k=>store[k]||null, setItem:(k,v)=>{store[k]=v}, removeItem:k=>{delete store[k]}};
global.document = {getElementById:mkel, addEventListener:()=>{}, createElement:()=>mkel('t'+Math.random()), body:{appendChild:()=>{}}};
global.window = {addEventListener:()=>{}};
global.fs = fs;

const files = fs.readdirSync(path.join(ROOT,'frontend/src/js')).filter(f=>f.endsWith('.js')).sort();
const src = files.map(f=>fs.readFileSync(path.join(ROOT,'frontend/src/js',f),'utf8')).join('\n;\n')
+'\n;console.log("modules loaded:",'+files.length+');'
+'S.user={name:"A. Sailaja IAS",role:"State Authority (Telangana)"};'
+'["dashboard","projects","gis","acquisition","compensation","alerts"].forEach(p=>{S.page=p;render();});console.log("pages ok");'
+'S.page="project";PROJECTS.forEach(pr=>{S.project=pr.id;["overview","parcels","acquisition","compensation","alerts"].forEach(t=>{S.projTab=t;render();});});console.log("projects x tabs ok");'
+'S.page="acquisition";["proposal","scrutiny","notification","verification","award","possession"].forEach(a=>{S.acq=a;render();});console.log("acquisition ok");'
+'PROJECTS.forEach(p=>{const c=corridorFor(p);if(c.parcels.length<20)throw p.id;c.parcels.forEach(x=>{if(!PCL_COL[x.stage]&&x.stage!=="Disputed")throw x.stage;});});console.log("routes+corridors ok");'
+'S.page="gis";S.gProj="NLAMS-TG-001";S.gDist="Sangareddy";S.gvb=fitRouteVB(prj("NLAMS-TG-001"));render();'
+'const h=els["app"].innerHTML;'
+'console.log("alignment view:",h.includes("stroke-dasharray")&&h.includes("mapflow"),"parcels:",(h.match(/class="pcl"/g)||[]).length);'
+'S.flowFilter="Compensated";render();console.log("stage filter:",els["app"].innerHTML.includes("Compensated only"));S.flowFilter=null;'
+'saveSession();console.log("session restore:",!!loadSession().u);'
+'console.log("SMOKE PASS");';
(0,eval)(src);
