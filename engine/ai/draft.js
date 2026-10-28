
import {circuit,clamp} from '../tracks/track.js';
// Experimental wake: drag relief only, with no power boost or pose correction.
// Downforce unchanged; this is not calibrated CFD or a full dirty-air model.
function draftFactor(car,field){const own=car.projection;if(Math.hypot(car.state.u,car.state.v)<25||Math.abs(own.k)>.003)return 0;let strength=0;for(const other of field){if(other.id===car.id||other.pit?.active)continue;const gap=circuit.delta(other.projection.s,own.s),lateral=Math.abs(other.projection.d-own.d);if(gap>7&&gap<280&&lateral<4.8)strength=Math.max(strength,clamp(1-(gap-12)/268,0,1)*clamp(1-lateral/4.8,0,1));}return strength;}


export {draftFactor};
