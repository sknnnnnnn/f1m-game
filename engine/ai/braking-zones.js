// Visual distance reference only. It never sets a car's braking point.
// Entry is the first 12% curvature shoulder of each isolated tight bend,
// rather than the curvature peak/apex used by the previous boards.
export function brakingZones(track){
 const peaks=[];for(let s=5;s<track.length;s+=5){const k=Math.abs(track.at(s).k);if(k>.022&&k>=Math.abs(track.at(s-5).k)&&k>Math.abs(track.at(s+5).k)&&peaks.every(q=>Math.abs(track.delta(s,q))>130))peaks.push(s);}
 return peaks.map(apex=>{const threshold=Math.max(.002,Math.abs(track.at(apex).k)*.12);let shoulder=0;while(shoulder<160&&Math.abs(track.at(apex-shoulder).k)>threshold)shoulder+=2;const entry=(apex-shoulder+track.length)%track.length,turn=track.turns.reduce((a,b)=>Math.abs(track.delta(b.s,apex))<Math.abs(track.delta(a.s,apex))?b:a).number;return {turn,apex,entry,threshold,boards:[150,100,50].map(distance=>({distance,stripes:distance/50,station:(entry-distance+track.length)%track.length}))};});
}
export function nextBrakingZone(track,zones,station){return zones.map(zone=>({...zone,distance:track.delta(zone.entry,station)})).filter(z=>z.distance>=0&&z.distance<=350).sort((a,b)=>a.distance-b.distance)[0]??null;}
