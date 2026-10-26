// Public simulation API. Browser rendering starts separately in rendering/app.js.
export {LivingSession26 as RaceSession} from './race/living-session26.js';
export {LivingRace26 as RaceSimulation} from './race/living-race26.js';
export {Agent as RaceAgent} from './ai/agent.js';
export {circuit,Circuit} from './tracks/track.js';
export {CIRCUITS23 as circuits} from './tracks/circuit-catalog23.js';
export {PIT,pitRoad} from './pit/pit-lane.js';
export {zonesFor24 as drsZones} from './drs/drs24.js';
export {runPhysicsBatch} from './runtime/physics-batch.js';
export const ENGINE_VERSION='1.0';
