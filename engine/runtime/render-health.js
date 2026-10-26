// Rendering hitches do not change physics dt or fabricate speed. A missing view
// for two seconds pauses the race; hidden/blurred tabs still pause immediately.
export const RENDER_HEARTBEAT_GRACE_MS=2000;
export function renderHeartbeatLost(now,last){return now-last>RENDER_HEARTBEAT_GRACE_MS;}
