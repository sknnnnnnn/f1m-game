import {step,MODEL57} from '../physics/mobile57.js';
import {surface32} from './physics-surface32.js';
// This runs inside the race worker, never on the UI thread. A cheap integrator
// no longer benefits from cloning 22 states/environment into three more workers.
export function mobileRuntime57(){const metrics={model57:MODEL57,workers:0,inlineInRaceWorker:true,jobs:0,batches:0,jobMS:0,roundTripMS:0,error:null};return {metrics,run(proposed,environment){const start=performance.now();for(const q of proposed){const state=q.next;q.result=step({...q.config,CdA:q.aeroCdA},state,q.out.command,{compactRecords56:true,surface:(x,y)=>surface32(environment,x,y,q.car.tyres.compound,q.car.pit.active,state.psi)});metrics.jobs++;}metrics.batches++;metrics.jobMS=metrics.roundTripMS=performance.now()-start;},close(){}};}
