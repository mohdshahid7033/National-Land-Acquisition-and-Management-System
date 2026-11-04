/* =====================================================================
   NLAMS · Telangana  —  01 · CONFIG
   Theme tokens, acquisition stages, parcel-stage palette.
   Load order: 1st (everything depends on these).
   ===================================================================== */
/* ================= NLAMS Telangana — data & helpers ================= */
const EMBLEM='assets/emblem.png';   /* swapped to embedded data-URI in dist build */
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inr=n=>Math.round(n).toLocaleString('en-IN');
function rng(seed){let h=1779033703^seed.length;for(let i=0;i<seed.length;i++){h=Math.imul(h^seed.charCodeAt(i),3432918353);h=(h<<13)|(h>>>19);}return function(){h=Math.imul(h^(h>>>16),2246822507);h=Math.imul(h^(h>>>13),3266489909);return ((h^=h>>>16)>>>0)/4294967296;};}

