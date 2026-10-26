// Shared service clock: worker owns readiness, renderer reads the same phases.
export const PIT_CYCLE27={tyres:8.2,nose:13.2,withdraw:4,deploy:18};
export function pitClock27(p,time){const start=p?.flow27?.serviceAt??p?.serviceStarted;if(!Number.isFinite(start))return null;const t=Math.max(0,time-start),nose=!!p.flow27?.nose,duration=nose?PIT_CYCLE27.nose:PIT_CYCLE27.tyres;
 return {t,duration,nose,lift:t<.3?0:t<.8?(t-.3)*.22:t<duration-2?.11:t<duration-1.5?.11*(1-(t-duration+2)/.5):0,remove:Math.max(0,Math.min(1,(t-1.5)/1.1)),install:Math.max(0,Math.min(1,(t-3)/1.3)),secure:t>=4.9,clear:t>=duration,withdraw:Math.max(0,Math.min(1,(t-duration+1.5)/1.5))};}
