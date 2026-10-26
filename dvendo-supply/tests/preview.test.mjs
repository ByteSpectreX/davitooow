// Offline prototype tests. Run directly with node; no account or payment calls.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),M=require('../apps/web/preview/supplier-redesign-model.js');
const fresh=()=>M.createState(Date.UTC(2026,9,25,12));

test('funding estimate reconciles sample funding, delivered supply, reserve and known renewals',()=>{
  const s=fresh(),f=M.forecast(s);
  assert.equal(s.funding.reduce((n,r)=>n+r.amount,0)-s.orders.reduce((n,r)=>n+r.price,0),s.wallet);
  assert.equal(f.cost,3240);assert.equal(f.topup,1300);assert.equal(f.missing.length,1);assert.equal(f.reserveDay,3);
  M.topup(s,1300);assert.equal(M.forecast(s).topup,0);assert.equal(M.forecast(s).remaining,500);
});
test('same-price offers with different validity produce different recurring demand',()=>{
  const s=fresh();assert.equal(M.events(s,30).filter(e=>e.simId==='sim-002').length,2);
  assert.equal(M.events(s,30).filter(e=>e.simId==='sim-001').length,1);
  s.role='manager';s.managerId='north';M.savePlan(s,'sim-001','unli15');
  assert.equal(M.events(s,30).filter(e=>e.simId==='sim-001').length,2);
});
test('drafts do not change the forecast; saved manager choices preserve current service and funds',()=>{
  const s=fresh(),a=M.sim(s,'sim-001'),before=JSON.stringify(a.current),cost=M.forecast(s).cost,day=a.plan.day;
  s.role='manager';s.drafts[a.id]='unli30';assert.equal(M.forecast(s).cost,cost);
  assert.equal(M.savePlan(s,a.id,'unli30').ok,true);assert.equal(M.forecast(s).cost,cost+300);
  assert.equal(JSON.stringify(a.current),before);assert.equal(s.wallet,2440);assert.equal(a.plan.day,day);assert.equal(a.plan.version,2);
});
test('manager mutations cannot cross portfolios or change supplier finances',()=>{
  const s=fresh();s.role='manager';s.managerId='north';
  for(const r of [M.savePlan(s,'sim-002','unli30'),M.pause(s,'sim-002'),M.setDate(s,'sim-001',2),M.assign(s,'sim-001','east'),M.topup(s,1000),M.setLimit(s,'perSIM',2000),M.setReserve(s,0),M.catalogToggle(s,'pro80')])assert.equal(r.ok,false);
  assert.equal(s.wallet,2440);assert.equal(s.audit.length,0);
});
test('supplier overrides require a reason and retain it in the change record',()=>{
  const s=fresh();assert.equal(M.savePlan(s,'sim-001','unli30').ok,false);
  assert.equal(M.savePlan(s,'sim-001','unli30','Approved site plan change').ok,true);
  assert.match(s.audit[0].detail,/Approved site plan change/);
});
test('pausing removes future forecast demand and manager resumption requires supplier action',()=>{
  const s=fresh(),a=M.sim(s,'sim-001'),cost=M.forecast(s).cost;s.role='manager';
  assert.equal(M.pause(s,a.id).ok,true);assert.equal(M.forecast(s).cost,cost-490);
  assert.equal(M.resume(s,a.id).requested,true);assert.equal(a.plan.auto,false);
  s.role='admin';assert.equal(M.resume(s,a.id).ok,true);assert.equal(a.plan.auto,true);assert.equal(a.plan.resumeRequested,false);
});
test('saving a paused SIM preference does not enable it or spend money',()=>{
  const s=fresh();s.role='manager';s.managerId='central';const before=M.forecast(s,30).cost;
  M.savePlan(s,'sim-010','unli30');assert.equal(M.sim(s,'sim-010').plan.auto,false);
  assert.equal(M.forecast(s,30).cost,before);assert.equal(s.wallet,2440);
});
test('an unresolved attempt freezes the accepted plan; a change applies to a following renewal',()=>{
  const s=fresh(),a=M.sim(s,'sim-001');s.role='manager';
  const order={id:'DEMO-LOCKED',simId:a.id,managerId:a.managerId,offerId:'pro80',price:490,status:'unknown',day:0,walletReflected:false};s.orders.push(order);
  const before=JSON.stringify(order),oldPlan=JSON.stringify(a.plan);
  assert.equal(M.savePlan(s,a.id,'unli30').following,true);assert.equal(a.futurePlan.offerId,'unli30');
  assert.equal(JSON.stringify(order),before);assert.equal(JSON.stringify(a.plan),oldPlan);assert.equal(s.orders.length,5);
  assert.equal(M.events(s).filter(e=>e.simId===a.id).length,0);
  assert.equal(M.forecast(s).held,490);order.walletReflected=true;assert.equal(M.forecast(s).held,0);
  s.role='admin';assert.equal(M.assign(s,a.id,'east').ok,false);assert.equal(M.setDate(s,a.id,2).ok,false);
});
test('missing dates and unknown attempts are disclosed instead of silently treated as zero demand',()=>{
  const s=fresh();assert.equal(M.forecast(s).missing[0].id,'sim-009');
  assert.equal(M.setDate(s,'sim-009',17,'provider').ok,true);assert.equal(M.forecast(s,30).missing.length,0);
  assert.equal(M.sim(s,'sim-009').plan.dateSource,'provider');
});
test('catalog and spending changes flag review without silently substituting a plan',()=>{
  const s=fresh();M.catalogToggle(s,'pro80');assert.equal(M.planStatus(s,M.sim(s,'sim-001')).key,'review');
  assert.equal(M.sim(s,'sim-001').plan.offerId,'pro80');assert.equal(M.forecast(s).cost,3240);
  M.catalogToggle(s,'pro80');M.setLimit(s,'perSIM',400);assert.equal(M.planStatus(s,M.sim(s,'sim-001')).label,'Budget review');
  M.setLimit(s,'daily',400);M.setLimit(s,'perManager',100);assert.ok(M.budgetWarnings(s).some(w=>w.kind==='daily'));assert.ok(M.budgetWarnings(s).some(w=>w.kind==='manager'));
});
test('recipient registration and monitoring are independent; managers cannot choose another portfolio',()=>{
  const s=fresh();s.role='manager';s.managerId='north';
  const r=M.addSIM(s,{name:'New sample site',suffix:'9011',managerId:'east',sample:true});assert.equal(r.ok,true);
  assert.equal(r.sim.managerId,'north');assert.equal(r.sim.assignment,'pending');assert.equal(r.sim.current,null);
  assert.equal(M.savePlan(s,r.sim.id,'pro80').ok,true);assert.equal(M.events(s,30).some(e=>e.simId===r.sim.id),false);
  assert.equal(M.addSIM(s,{name:'Duplicate',suffix:'9011',sample:true}).ok,false);
  s.role='admin';M.assign(s,r.sim.id,'north');M.setDate(s,r.sim.id,10);assert.equal(M.resume(s,r.sim.id).ok,true);
});
test('format-only registration cannot claim recipient eligibility',()=>{
  const s=fresh(),r=M.addSIM(s,{name:'Format-only recipient',suffix:'9012',managerId:'north',sample:false});
  assert.equal(r.sim.validation,'provider-pending');assert.equal(M.savePlan(s,r.sim.id,'pro80').ok,false);assert.equal(r.sim.current,null);
});
test('assignment transfer changes SIM access while historical order ownership remains intact',()=>{
  const s=fresh();M.assign(s,'sim-001','east');s.role='manager';s.managerId='north';
  assert.equal(M.canSee(s,M.sim(s,'sim-001')),false);assert.ok(M.visibleOrders(s).some(o=>o.simId==='sim-001'));
  s.managerId='east';assert.equal(M.canSee(s,M.sim(s,'sim-001')),true);assert.equal(M.visibleOrders(s).some(o=>o.simId==='sim-001'),false);
});
test('bad numeric controls are rejected without changing funding state',()=>{
  const s=fresh();for(const value of [-1,0.5,NaN,100001])assert.equal(M.topup(s,value).ok,false);
  assert.equal(M.setDate(s,'sim-001',-1).ok,false);assert.equal(M.setLimit(s,'daily',-1).ok,false);assert.equal(M.setReserve(s,-1).ok,false);assert.equal(s.wallet,2440);
});
