
// Presentation only: select a real close pair; never modifies race state.
class BattleCamera {
 constructor(){this.reset();}
 reset(){this.pair=null;this.since=-Infinity;this.label='SEARCHING FOR A BATTLE';}
 select(cars,now){
  const active=cars.filter(c=>c.finishedAt===null),pairs=[];
  for(let i=0;i<active.length;i++)for(let j=i+1;j<active.length;j++){
   const a=active[i],b=active[j],gap=Math.abs(a.progress-b.progress);if(gap>42)continue;
   const rear=a.progress<b.progress?a:b,front=rear===a?b:a,closing=Math.max(0,rear.speed-front.speed);
   const attacking=/SLINGSHOT|PASS_COMMIT|COUNTER|THIRD_CAR_ATTACK|HOLD_SPACE|DEFEND/.test(a.decision+' '+b.decision);
   pairs.push({ids:[a.id,b.id].sort((a,b)=>a-b),rear:rear.id,gap,score:50-gap+Math.min(8,closing)*2+(attacking?12:0)});
  }
  pairs.sort((a,b)=>b.score-a.score);const current=this.pair&&pairs.find(p=>p.ids.join(',')===this.pair.join(','));
  const best=pairs[0],pick=current&&(now-this.since<5000||!best||best.score<current.score+16)?current:best;
  if(!pick){this.pair=null;this.label='SEARCHING FOR A BATTLE';return null;}
  if(!this.pair||pick.ids.join(',')!==this.pair.join(',')){this.pair=pick.ids;this.since=now;}
  this.label=`BATTLE CAM / #${pick.ids.join(' vs #')} · ${pick.gap.toFixed(0)} m`;
  // Hold one subject while that pair exchanges positions; avoid camera hopping.
  return current&&pick===current?this.subject:(this.subject=pick.rear);
 }
}


export {BattleCamera};
