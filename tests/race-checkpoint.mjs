import fs from 'node:fs';import v8 from 'node:v8';import crypto from 'node:crypto';
import {StrategyRace} from '../engine/race/strategy-race.js';import {Agent} from '../engine/ai/agent.js';
export function runtimeDigest(){const files=[];for(const dir of ['racing/src','racing/runtime/frozen'])for(const f of fs.readdirSync(dir).sort())if(f.endsWith('.js'))files.push(dir+'/'+f);files.push('engine/race/strategy-race.js','engine/race/weekend.js','engine/rendering/visual-race.js');const h=crypto.createHash('sha256');for(const f of files)h.update(fs.readFileSync(f));return h.digest('hex');}
export function packRace(r){return v8.serialize({digest:runtimeDigest(),race:r});}
export function unpackRace(bytes){const raw=v8.deserialize(bytes);if(raw.digest!==runtimeDigest())throw Error('Checkpoint source differs: start a fresh validation run');const r=Object.assign(Object.create(StrategyRace.prototype),raw.race);for(const c of r.cars)Object.setPrototypeOf(c.agent,Agent.prototype);return r;}
