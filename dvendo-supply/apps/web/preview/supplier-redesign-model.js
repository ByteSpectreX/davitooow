/* Synthetic product model for the local design preview. No provider calls. */
(function(root){
  'use strict';
  const DAY=86400000;
  const offers=[
    {id:'pro80',name:'WoWFi PRO 490',price:490,days:30,gb:80,unlimited:false,description:'80 GB high-speed data',detail:'Up to 100 Mbps · 30-day validity'},
    {id:'unli15',name:'WoWFi PRO Unli 490',price:490,days:15,gb:null,unlimited:true,description:'Unlimited high-speed data',detail:'Up to 100 Mbps · 15-day validity'},
    {id:'unli30',name:'WoWFi PRO 790',price:790,days:30,gb:null,unlimited:true,description:'Unlimited high-speed data',detail:'Up to 100 Mbps · 30-day validity'}
  ];
  const managers=[
    {id:'north',name:'Alex Rivera',portfolio:'North portfolio',initials:'AR'},
    {id:'east',name:'Jamie Cruz',portfolio:'East portfolio',initials:'JC'},
    {id:'central',name:'Sam Reyes',portfolio:'Central portfolio',initials:'SR'},
    {id:'south',name:'Taylor Santos',portfolio:'South portfolio',initials:'TS'}
  ];
  function createState(at=Date.now()){
    const dayKey=new Date(at+8*3600000).toISOString().slice(0,10);
    const baseDay=Date.parse(dayKey+'T00:00:00Z');
    const seeds=[
      ['North warehouse','north','1042','pro80',0,3.2,'current',true],
      ['Riverside station','east','2096','unli15',1,null,'current',true],
      ['Corner café','central','3184','pro80',2,2.4,'current',true],
      ['North gate','north','4208','unli30',3,null,'stale',true],
      ['South depot','south','5307','pro80',4,12.6,'current',true],
      ['Central office','central','6419','pro80',6,10.2,'current',true],
      ['East kiosk','east','7530','pro80',9,null,'unconnected',true],
      ['Harbor storage','south','8625','unli30',11,null,'current',true],
      ['Hilltop entrance','north','9751','pro80',null,25.3,'current',true],
      ['Garden annex','central','0863','pro80',22,24.8,'current',false]
    ];
    const sims=seeds.map((v,i)=>{
      const [name,managerId,suffix,offerId,day,remainingGB,connection,auto]=v,offer=offers.find(o=>o.id===offerId);
      return {id:'sim-'+String(i+1).padStart(3,'0'),name,managerId,suffix,assignment:'assigned',validation:'sample-valid',
        connection:{status:connection,checkedAt:connection==='unconnected'?null:at-(connection==='stale'?95:8)*60000},
        current:connection==='unconnected'?null:{offerId,remainingGB,totalGB:offer.gb,unlimited:offer.unlimited,expiryDay:day??17},
        plan:{offerId,day,auto,version:1,dateSource:connection==='unconnected'?'planned':'provider',resumeRequested:false},futurePlan:null};
    });
    const history=[['sim-001',-30],['sim-004',-27],['sim-003',-28],['sim-008',-19]].map(([id,day],i)=>{
      const sim=sims.find(a=>a.id===id),offer=offers.find(o=>o.id===sim.current.offerId);
      return {id:'DEMO-'+(1001+i),simId:id,siteName:sim.name,managerId:sim.managerId,offerId:offer.id,price:offer.price,status:'delivered',day,planVersion:1,walletReflected:true,reference:'SAMPLE-'+(1001+i)};
    });
    return {at,baseDay,role:'admin',managerId:'north',page:'overview',simId:null,tab:'overview',period:7,reserve:500,wallet:2440,
      search:'',simFilter:'all',queueFilter:'upcoming',portfolioFilter:'all',historyFilter:'all',historyType:'all',
      catalog:offers.map(o=>({...o,enabled:true})),managers:managers.map(m=>({...m})),sims,orders:history,
      funding:[{id:'FUND-DEMO-1',day:-35,amount:5000,label:'Manual wallet funding',source:'Sample confirmed credit'}],
      limits:{perSIM:1000,perManager:5000,daily:5000},drafts:{},audit:[],notifications:{renewals:true,results:true},nextId:11};
  }
  const offer=(s,id)=>s.catalog.find(o=>o.id===id);
  const manager=(s,id)=>s.managers.find(m=>m.id===id);
  const sim=(s,id)=>s.sims.find(a=>a.id===id);
  const canSee=(s,a)=>Boolean(a)&&(s.role==='admin'||a.managerId===s.managerId);
  const visibleSims=s=>s.sims.filter(a=>canSee(s,a));
  const visibleOrders=s=>s.orders.filter(o=>s.role==='admin'||o.managerId===s.managerId);
  const inFlight=(s,a)=>s.orders.find(o=>o.simId===a.id&&['submitting','pending','unknown'].includes(o.status));
  function actor(s){return s.role==='admin'?'Supplier Admin':manager(s,s.managerId)?.name||'Account Manager';}
  function audit(s,a,action,detail){s.audit.unshift({id:'change-'+(s.audit.length+1),simId:a?.id||null,managerId:a?.managerId||null,actor:actor(s),action,detail,at:Date.now()});}
  function planStatus(s,a){
    if(a.assignment!=='assigned')return {key:'assignment',label:'Awaiting assignment',tone:'warning',reason:'Supplier Admin needs to confirm the portfolio.'};
    if(inFlight(s,a))return {key:'checking',label:'Needs checking',tone:'warning',reason:'An existing supply attempt must be resolved before another is created.'};
    if(!a.plan.offerId)return {key:'no-plan',label:'Choose a promo',tone:'warning',reason:'A next-promo preference has not been saved.'};
    const o=offer(s,a.plan.offerId);
    if(!o||!o.enabled)return {key:'review',label:'Offer needs review',tone:'warning',reason:'The selected offer is not in the enabled sample catalog.'};
    if(!a.plan.auto)return {key:'paused',label:a.plan.resumeRequested?'Resume requested':'Paused',tone:'neutral',reason:'Future automatic renewals are paused.'};
    if(!Number.isInteger(a.plan.day))return {key:'unscheduled',label:'Set renewal date',tone:'warning',reason:'The funding forecast needs a known or explicitly planned renewal date.'};
    if(o.price>s.limits.perSIM)return {key:'review',label:'Budget review',tone:'warning',reason:'The selected offer exceeds the supplier per-SIM limit.'};
    return {key:'scheduled',label:'Scheduled',tone:'success',reason:a.plan.dateSource==='planned'?'Uses an explicitly planned date.':'Uses the saved expiry date.'};
  }
  function events(s,horizon=s.period){
    const result=[];
    for(const a of s.sims){
      if(a.assignment!=='assigned'||!a.plan.auto||!Number.isInteger(a.plan.day)||a.plan.day<0||inFlight(s,a))continue;
      const o=offer(s,a.plan.offerId);if(!o||!Number.isFinite(o.price)||o.days<=0)continue;
      for(let day=a.plan.day;day<horizon;day+=o.days)result.push({simId:a.id,managerId:a.managerId,day,price:o.price,offerId:o.id,status:planStatus(s,a)});
    }
    return result.sort((a,b)=>a.day-b.day||a.simId.localeCompare(b.simId));
  }
  function forecast(s,horizon=s.period){
    const upcoming=events(s,horizon),cost=upcoming.reduce((n,e)=>n+e.price,0);
    const held=s.orders.filter(o=>['submitting','pending','unknown'].includes(o.status)&&!o.walletReflected).reduce((n,o)=>n+o.price,0);
    let remaining=s.wallet-held,reserveDay=remaining<s.reserve?0:null,uncoveredDay=null;
    for(const e of upcoming){remaining-=e.price;if(remaining<s.reserve&&reserveDay===null)reserveDay=e.day;if(remaining<0&&uncoveredDay===null)uncoveredDay=e.day;}
    const missing=s.sims.filter(a=>a.assignment==='assigned'&&a.plan.auto&&(!a.plan.offerId||!Number.isInteger(a.plan.day)||inFlight(s,a)));
    return {upcoming,cost,held,remaining,reserveDay,uncoveredDay,missing,topup:Math.ceil(Math.max(0,cost+held+s.reserve-s.wallet)/100)*100};
  }
  function budgetWarnings(s){
    const warnings=[],planned=events(s,30),daily=new Map(),byManager=new Map();
    for(const e of planned){daily.set(e.day,(daily.get(e.day)||0)+e.price);byManager.set(e.managerId,(byManager.get(e.managerId)||0)+e.price);}
    for(const [day,total] of daily)if(total>s.limits.daily)warnings.push({kind:'daily',day,total,limit:s.limits.daily});
    for(const [managerId,total] of byManager)if(total>s.limits.perManager)warnings.push({kind:'manager',managerId,total,limit:s.limits.perManager});
    return warnings;
  }
  function savePlan(s,id,offerId,reason=''){
    const a=sim(s,id),o=offer(s,offerId);
    if(!canSee(s,a))return {ok:false,error:'This SIM is outside your portfolio.'};
    if(!o?.enabled)return {ok:false,error:'Choose an enabled sample offer.'};
    if(a.validation!=='sample-valid')return {ok:false,error:'Recipient validation is pending. No eligible catalog is established yet.'};
    if(s.role==='admin'&&a.plan.offerId!==offerId&&!String(reason).trim())return {ok:false,error:'Add a reason for this supplier override.'};
    const locked=inFlight(s,a);
    if(locked){a.futurePlan={offerId,version:a.plan.version+1};audit(s,a,'Following renewal preference saved',o.name+' · current attempt unchanged');return {ok:true,following:true};}
    const old=offer(s,a.plan.offerId)?.name||'No saved promo';
    if(a.plan.offerId===offerId)return {ok:true,unchanged:true};
    a.plan.offerId=offerId;a.plan.version++;audit(s,a,'Next promo changed',old+' → '+o.name+(s.role==='admin'?' · '+String(reason).trim().slice(0,160):''));
    delete s.drafts[id];return {ok:true,review:o.price>s.limits.perSIM};
  }
  function pause(s,id){
    const a=sim(s,id);if(!canSee(s,a))return {ok:false,error:'This SIM is outside your portfolio.'};
    a.plan.auto=false;a.plan.resumeRequested=false;a.plan.version++;audit(s,a,'Future renewals paused','Any attempt already in progress is unchanged.');return {ok:true};
  }
  function resume(s,id){
    const a=sim(s,id);if(!canSee(s,a))return {ok:false,error:'This SIM is outside your portfolio.'};
    if(s.role==='manager'){a.plan.resumeRequested=true;audit(s,a,'Resume requested','Awaiting supplier review.');return {ok:true,requested:true};}
    if(a.assignment!=='assigned'||!offer(s,a.plan.offerId)?.enabled||!Number.isInteger(a.plan.day))return {ok:false,error:'Confirm assignment, an enabled promo and a renewal date first.'};
    if(offer(s,a.plan.offerId).price>s.limits.perSIM)return {ok:false,error:'The selected promo exceeds the per-SIM limit.'};
    a.plan.auto=true;a.plan.resumeRequested=false;a.plan.version++;audit(s,a,'Automatic renewal enabled','Supplier rule enabled in this preview.');return {ok:true};
  }
  function setDate(s,id,day,source='planned'){
    const a=sim(s,id);if(s.role!=='admin'||!a)return {ok:false,error:'Only Supplier Admin sets the execution schedule.'};
    if(!Number.isInteger(day)||day<0||day>365)return {ok:false,error:'Choose a date within the next year.'};
    if(inFlight(s,a))return {ok:false,error:'Resolve the existing attempt before changing its schedule.'};
    a.plan.day=day;a.plan.dateSource=source==='provider'&&a.current?.expiryDay===day?'provider':'planned';a.plan.version++;audit(s,a,'Renewal date set',(a.plan.dateSource==='provider'?'Saved expiry day ':'Explicit planned day ')+day);return {ok:true};
  }
  function assign(s,id,managerId){
    const a=sim(s,id);if(s.role!=='admin'||!a||!manager(s,managerId))return {ok:false,error:'Only Supplier Admin can assign SIMs.'};
    if(inFlight(s,a))return {ok:false,error:'Resolve the current supply attempt before transferring this SIM.'};
    const previous=a.managerId;a.managerId=managerId;a.assignment='assigned';audit(s,a,'Portfolio assignment confirmed',(manager(s,previous)?.portfolio||'Unassigned')+' → '+manager(s,managerId).portfolio);return {ok:true};
  }
  function addSIM(s,{name,suffix,managerId,sample}){
    const target=s.role==='manager'?s.managerId:managerId;
    if(!manager(s,target))return {ok:false,error:'Choose a manager portfolio.'};
    if(!String(name).trim()||!/^\d{4}$/.test(String(suffix)))return {ok:false,error:'Provide a site name and a valid sample or formatted number.'};
    // Only a masked suffix is kept in this prototype; no raw number is retained.
    if(s.sims.some(a=>a.suffix===suffix))return {ok:false,error:'That sample number is already registered. Assignment changes require Supplier Admin.'};
    const a={id:'sim-'+String(s.nextId++).padStart(3,'0'),name:String(name).trim().slice(0,70),suffix,managerId:target,assignment:s.role==='admin'?'assigned':'pending',validation:sample?'sample-valid':'provider-pending',connection:{status:'unconnected',checkedAt:null},current:null,plan:{offerId:null,day:null,auto:false,version:1,dateSource:'planned',resumeRequested:false},futurePlan:null};
    s.sims.push(a);audit(s,a,'SIM submitted',a.assignment==='pending'?'Awaiting supplier assignment.':'Registered in the selected portfolio.');return {ok:true,sim:a};
  }
  function topup(s,amount){
    if(s.role!=='admin'||!Number.isInteger(amount)||amount<1||amount>100000)return {ok:false,error:'Enter a whole demo amount from ₱1 to ₱100,000.'};
    s.wallet+=amount;s.funding.unshift({id:'FUND-DEMO-'+(s.funding.length+1),day:0,amount,label:'Demo manual top-up',source:'Preview credit only'});audit(s,null,'Demo wallet credit recorded','Added '+amount+' to the sample balance.');return {ok:true};
  }
  function setLimit(s,key,value){
    if(s.role!=='admin'||!['perSIM','perManager','daily'].includes(key)||!Number.isInteger(value)||value<0||value>1000000)return {ok:false,error:'Use a whole, non-negative sample limit up to ₱1,000,000.'};
    s.limits[key]=value;audit(s,null,'Spending rule updated',key+' = '+value);return {ok:true};
  }
  function setReserve(s,value){
    if(s.role!=='admin'||!Number.isInteger(value)||value<0||value>100000)return {ok:false,error:'Use a whole reserve from ₱0 to ₱100,000.'};
    s.reserve=value;audit(s,null,'Wallet reserve updated','Reserve = '+value);return {ok:true};
  }
  function catalogToggle(s,id){
    const o=offer(s,id);if(s.role!=='admin'||!o)return {ok:false,error:'Only Supplier Admin manages the catalog.'};
    o.enabled=!o.enabled;audit(s,null,'Sample catalog updated',o.name+' '+(o.enabled?'enabled':'disabled'));return {ok:true};
  }
  function issues(s){
    const f=forecast(s),result=[];
    if(f.topup)result.push({id:'funding',type:'funding',title:'Prepare '+f.topup+' in load',detail:'A top-up protects the selected renewal window and reserve.',action:'wallet'});
    for(const a of s.sims){
      const status=planStatus(s,a);
      if(['assignment','checking','no-plan','unscheduled','review'].includes(status.key)||a.plan.resumeRequested)result.push({id:a.id,type:status.key,simId:a.id,title:a.plan.resumeRequested?'Resume requested':status.label,detail:a.name,action:'sim'});
    }
    for(const w of budgetWarnings(s))result.push({id:w.kind+(w.day??w.managerId),type:'budget',title:w.kind==='daily'?'Daily limit needs review':'Manager budget needs review',detail:w.kind==='daily'?'Planned day '+w.day:manager(s,w.managerId).name,action:'settings'});
    return result;
  }
  const model={DAY,offers,managers,createState,offer,manager,sim,canSee,visibleSims,visibleOrders,inFlight,planStatus,events,forecast,budgetWarnings,savePlan,pause,resume,setDate,assign,addSIM,topup,setLimit,setReserve,catalogToggle,issues};
  root.DVendoDemo=Object.freeze(model);
  if(typeof module!=='undefined'&&module.exports)module.exports=root.DVendoDemo;
})(globalThis);
