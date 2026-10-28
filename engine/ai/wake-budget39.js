import {circuit,clamp} from '../tracks/track.js';
// Budget the wake reachable before the next thought, rather than assuming the
// strongest possible wake whenever any car is anywhere within 110 metres.
export function forecastWake39(car,field,current=0){let worst=current;const own=car.projection,speed=Math.hypot(car.state.u,car.state.v);for(const o of field){if(o.id===car.id||o.pit?.active)continue;const gap=circuit.delta(o.projection.s,own.s),closing=Math.max(0,speed-Math.hypot(o.state.u,o.state.v)),futureGap=gap-closing*.2-1,lateral=Math.max(0,Math.abs(o.projection.d-own.d)-.35);if(gap>7&&futureGap<75&&gap<110&&lateral<3)worst=Math.max(worst,clamp(1-(futureGap-7)/68,0,1)*(1-lateral/3));}return clamp(worst,0,1);}
