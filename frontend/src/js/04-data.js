/* =====================================================================
   04 · DATA — synthetic demo dataset: 14 projects / 25 districts, alerts
   with risk scores, users, owner & category pools. Production: REST APIs.
   ===================================================================== */
/* ---------------- Telangana project dataset ---------------- */
const PROJECTS=[
 {id:'NLAMS-TG-001',name:'Regional Ring Road – Northern Arc',sector:'Highways',dept:'R&B Department',dists:['Sangareddy','Medak','Siddipet','Yadadri Bhuvanagiri'],land:2850,acq:68,prog:74,status:'On Track',risk:32,fam:4120,budget:595,stage:'Verification',started:'2025-06-10',avgL:26,vil:['Narsapur','Toopran','Choutuppal Rd','Wargal']},
 {id:'NLAMS-TG-002',name:'Sitarama Lift Irrigation Scheme – Phase II',sector:'Irrigation',dept:'I&CAD Department',dists:['Bhadradri Kothagudem','Khammam'],land:7120,acq:81,prog:69,status:'At Risk',risk:74,fam:9840,budget:2110,stage:'Compensation',started:'2025-02-18',avgL:31,vil:['Bhadrachalam','Aswapuram','Kothagudem','Manuguru','Sathupalli']},
 {id:'NLAMS-TG-003',name:'Warangal Outer Ring Road',sector:'Highways',dept:'R&B Department',dists:['Warangal Urban','Warangal Rural','Jangaon'],land:1430,acq:62,prog:58,status:'Delayed',risk:81,fam:2310,budget:304,stage:'Compensation',started:'2025-04-05',avgL:29,vil:['Atmakur','Dharmasagar','Wardhannapet','Geesukonda']},
 {id:'NLAMS-TG-004',name:'Hyderabad Metro Rail Phase-II (Corridor 4)',sector:'Urban Transit',dept:'HMR / MA&UD',dists:['Hyderabad','Ranga Reddy','Medchal Malkajgiri'],land:210,acq:74,prog:71,status:'On Track',risk:28,fam:1120,budget:176,stage:'Possession',started:'2025-07-22',avgL:96,vil:['Kokapet','Nanakramguda','Balanagar','Shamirpet']},
 {id:'NLAMS-TG-005',name:'Yadadri Thermal Power Station – Expansion',sector:'Energy',dept:'TGENCO',dists:['Yadadri Bhuvanagiri','Nalgonda'],land:940,acq:88,prog:84,status:'On Track',risk:22,fam:1460,budget:234,stage:'Possession',started:'2025-01-30',avgL:24,vil:['Dameracherla','Meliguda','Penchikalpahad']},
 {id:'NLAMS-TG-006',name:'Khammam Industrial Corridor Park',sector:'Industry',dept:'TSIIC',dists:['Khammam','Suryapet'],land:1780,acq:45,prog:41,status:'At Risk',risk:66,fam:2050,budget:208,stage:'Award',started:'2025-09-14',avgL:22,vil:['Kalluru','Wyra','Thirumalapur']},
 {id:'NLAMS-TG-007',name:'Nizam Sagar Canal Modernisation',sector:'Irrigation',dept:'I&CAD Department',dists:['Kamareddy','Nizamabad'],land:1120,acq:57,prog:52,status:'On Track',risk:41,fam:980,budget:143,stage:'Verification',started:'2025-11-08',avgL:19,vil:['Bichkunda','Pitlam','Varni']},
 {id:'NLAMS-TG-008',name:'Siddipet Agri Corridor Roads',sector:'Rural Roads',dept:'Panchayat Raj Engg.',dists:['Siddipet'],land:320,acq:91,prog:89,status:'On Track',risk:12,fam:410,budget:58,stage:'Possession',started:'2025-03-12',avgL:17,vil:['Cherial','Husnabad','Chintamadaka']},
 {id:'NLAMS-TG-009',name:'Nirmal–Bhainsa New Broad-Gauge Line',sector:'Railways',dept:'SCR / Revenue',dists:['Nirmal','Komaram Bheem'],land:690,acq:38,prog:33,status:'Delayed',risk:72,fam:870,budget:56,stage:'Notification',started:'2025-12-02',avgL:18,vil:['Khanapur','Bhainsa','Dasturabad']},
 {id:'NLAMS-TG-010',name:'Nagarkurnool Tribal Connectivity Roads',sector:'Rural Roads',dept:'ITDA / PR Engg.',dists:['Nagarkurnool','Jogulamba Gadwal'],land:540,acq:52,prog:48,status:'On Track',risk:38,fam:690,budget:50,stage:'Verification',started:'2026-01-19',avgL:15,vil:['Achampet','Kollapur','Ieeja']},
 {id:'NLAMS-TG-011',name:'Mancherial Coal Evacuation Corridor',sector:'Industry',dept:'SCCL / TSIIC',dists:['Mancherial','Peddapalli'],land:830,acq:64,prog:61,status:'At Risk',risk:58,fam:1240,budget:132,stage:'Award',started:'2025-08-25',avgL:21,vil:['Kyathampalle','Ramakrishnapur','Odela']},
 {id:'NLAMS-TG-012',name:'Mahabubabad Hill & Forest Fringe Roads',sector:'Rural Roads',dept:'ITDA / PR Engg.',dists:['Mahabubabad','Mulugu'],land:410,acq:47,prog:44,status:'On Track',risk:35,fam:520,budget:32,stage:'Verification',started:'2026-02-11',avgL:14,vil:['Kothaguda','Bhupalpally','Kuravi']},
 {id:'NLAMS-TG-013',name:'Narayanpet Solar Park (1.2 GW)',sector:'Energy',dept:'TSREDCO',dists:['Narayanpet','Jogulamba Gadwal'],land:1260,acq:55,prog:50,status:'On Track',risk:30,fam:740,budget:131,stage:'Award',started:'2025-10-06',avgL:16,vil:['Kosgi','Makthal','Atmakur(S)']},
 {id:'NLAMS-TG-014',name:'Medchal Multi-Modal Logistics Hub',sector:'Industry',dept:'TSIIC',dists:['Medchal Malkajgiri','Sangareddy'],land:480,acq:69,prog:66,status:'On Track',risk:26,fam:380,budget:203,stage:'Possession',started:'2025-05-28',avgL:52,vil:['Kandlakoya','Gundlapochampally','Mucherla']}
];
const prj=id=>PROJECTS.find(p=>p.id===id);

const ALERTS=[
 {id:'A-101',sev:'Critical',prj:'NLAMS-TG-003',title:'Compensation pending for 32 families',desc:'Payment stalled beyond 90 days in Atmakur & Dharmasagar villages due to bank-account and Aadhaar linkage mismatches.',score:87,when:'2 hours ago',action:'Complete compensation verification within 7 days.'},
 {id:'A-102',sev:'High',prj:'NLAMS-TG-009',title:'Forest land overlap – 96 ha under Section 24 review',desc:'Khanapur range forest land overlaps with proposed alignment; social audit and FCA clearance pending.',score:74,when:'5 hours ago',action:'Coordinate with Forest Dept; resubmit FCA Stage-I compliance.'},
 {id:'A-103',sev:'High',prj:'NLAMS-TG-006',title:'14 award disputes referred to Lok Adalat',desc:'Land owners in Kalluru & Wyra contested market-value benchmark under RFCTLARR Act 2013.',score:68,when:'1 day ago',action:'Prepare rebuttal valuation sheets before Lok Adalat on 12 Sep 2026.'},
 {id:'A-104',sev:'Medium',prj:'NLAMS-TG-002',title:'R&R kit delivery lag in 4 villages',desc:'Subsistence allowance & transportation grant pending for 118 displaced families of Phase-I.',score:52,when:'1 day ago',action:'Release pending R&R entitlements within 15 days.'},
 {id:'A-105',sev:'Info',prj:'NLAMS-TG-014',title:'Section 4 notification published for 3 villages',desc:'Preliminary notification for Kandlakoya, Gundlapochampally & Mucherla published in Telangana Gazette.',score:18,when:'2 days ago',action:'Begin objection window (21 days) and field survey.'}
];

const DOCS=[
 {id:'D-01',name:'RRR Northern Arc – Joint Survey Report',type:'Survey',prj:'NLAMS-TG-001',by:'Field Officer, Sangareddy',date:'12 Aug 2026',ver:'v3.2',status:'Verified'},
 {id:'D-02',name:'Sitarama LIS – Section 11 Declaration',type:'Notification',prj:'NLAMS-TG-002',by:'District Collector, Bhadradri Kothagudem',date:'02 Mar 2026',ver:'v1.0',status:'Published'},
 {id:'D-03',name:'Warangal ORR – Award Sheet (Atmakur)',type:'Award',prj:'NLAMS-TG-003',by:'RDO, Atmakur',date:'18 Jul 2026',ver:'v2.1',status:'Under Review'},
 {id:'D-04',name:'Warangal ORR – Compensation Ledger Aug',type:'Compensation',prj:'NLAMS-TG-003',by:'Treasury Officer, Warangal',date:'25 Aug 2026',ver:'v1.4',status:'Draft'},
 {id:'D-05',name:'Metro Corridor-4 – Land Records Extract',type:'Land Records',prj:'NLAMS-TG-004',by:'MRO, Serilingampally',date:'30 Jun 2026',ver:'v1.0',status:'Verified'},
 {id:'D-06',name:'Yadadri TPS – Possession Notices Bundle',type:'Notification',prj:'NLAMS-TG-005',by:'MRO, Dameracherla',date:'15 May 2026',ver:'v2.0',status:'Published'},
 {id:'D-07',name:'Khammam ICP – 1A Notification Draft',type:'Notification',prj:'NLAMS-TG-006',by:'Section Officer, TSIIC',date:'22 Aug 2026',ver:'v0.9',status:'Draft'},
 {id:'D-08',name:'Nizam Sagar – Pahani/Adangal Extracts',type:'Land Records',prj:'NLAMS-TG-007',by:'MRO, Bichkunda',date:'05 Aug 2026',ver:'v1.1',status:'Verified'},
 {id:'D-09',name:'Nirmal Rail Line – FCA Compliance Report',type:'Survey',prj:'NLAMS-TG-009',by:'DFO, Nirmal',date:'20 Aug 2026',ver:'v1.0',status:'Under Review'},
 {id:'D-10',name:'Sitarama LIS – R&R Entitlement Register',type:'R&R',prj:'NLAMS-TG-002',by:'RRO, Bhadrachalam',date:'28 Jul 2026',ver:'v2.3',status:'Verified'},
 {id:'D-11',name:'Narayanpet Solar – Valuation Benchmark Note',type:'Award',prj:'NLAMS-TG-013',by:'DLAO, Narayanpet',date:'10 Aug 2026',ver:'v1.2',status:'Approved'},
 {id:'D-12',name:'Medchal Logistics Hub – 1A Notification',type:'Notification',prj:'NLAMS-TG-014',by:'District Collector, Medchal',date:'25 Aug 2026',ver:'v1.0',status:'Published'}
];

const USERS=[
 {name:'A. Sailaja IAS',role:'State Authority',dept:'Revenue (Land Acquisition)',level:'State',status:'Active',last:'Online now',col:'#0ea56b'},
 {name:'R. Venkat Reddy',role:'District Authority',dept:'Collectorate, Warangal',level:'District',status:'Active',last:'12 min ago',col:'#2563eb'},
 {name:'M. Anjaneyulu',role:'Field Officer',dept:'RDO, Atmakur',level:'Field',status:'Active',last:'1 hr ago',col:'#d97706'},
 {name:'K. Swapna',role:'District Authority',dept:'Collectorate, Khammam',level:'District',status:'Active',last:'3 hrs ago',col:'#2563eb'},
 {name:'B. Naveen Kumar',role:'Field Officer',dept:'MRO, Bichkunda',level:'Field',status:'On Leave',last:'2 days ago',col:'#d97706'},
 {name:'S. Raghunandan',role:'Central Authority',dept:'Dept. of Land Resources, GoI',level:'Central',status:'Active',last:'26 min ago',col:'#7c3aed'}
];
const PERMS=[['Central Authority',1,1,1,1,1,1],['State Authority',1,1,1,1,1,0],['District Authority',1,1,1,1,1,0],['Field Officer',1,1,0,0,0,0],['Viewer',1,0,0,0,0,0]];
const OWNER_NAMES=['R. Anjaneyulu','B. Sailaja','K. Ram Reddy','M. Yadagiri','G. Laxmi Narayana','P. Rajeshwari','T. Narsimha','V. Padma','D. Srinivas','Ch. Anitha','N. Venkataramana','S. Komuraiah','B. Naveen Kumar','K. Swapna','A. Malla Reddy','E. Ravi','L. Bharathi','P. Saidulu'];
const CATS=['SC','ST','BC','OBC','Gen'];

