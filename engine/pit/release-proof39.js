import {RENDER_HEARTBEAT_GRACE_MS} from '../runtime/render-health.js';
// Same service cycle and a genuinely clear rendered scene remain mandatory.
export function validPitProof39(car,proof,time){return !!proof&&['SERVICE','RELEASE'].includes(car.pit.phase)&&proof.serviceAt===car.pit.serviceStarted&&Number.isFinite(proof.at)&&proof.at<=time&&time-proof.at<RENDER_HEARTBEAT_GRACE_MS/1000;}
