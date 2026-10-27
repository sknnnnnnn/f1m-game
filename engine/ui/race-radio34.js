// Presentation only: select verified race messages, never change team orders.
export class RaceRadio34 {
 constructor(){this.reset();}
 reset(id=null){this.id=id;this.time=-1;this.current=null;this.history=[];this.seen=new Set();this.cooldowns=new Map();this.flag=null;this.serial=0;}
 update(p,id,{replaying=false,running=true}={}){
  if(!p)return null;
  if(id!==this.id||p.time<this.time)this.reset(id);this.time=p.time;
  if(replaying||!running||['GRID','GRID_CLEAR','LIGHTS','FORMATION','PARADE'].includes(p.phase)){this.current=null;return null;}
  const car=p.cars?.find(c=>c.id===id),row=p.snapshot?.cars.find(c=>c.id===id);if(!car||!row)return null;
  const candidates=[],add=(key,text,priority=1,category='info',cooldown=20)=>{
   if(!text||this.seen.has(key)||p.time-(this.cooldowns.get(category)??-Infinity)<cooldown)return;
   candidates.push({key,text,priority,category,cooldown,time:p.time,car:id,name:car.name??row.name});
  };
  const flag=p.controlZone?.flag??'GREEN';
  if(flag!==this.flag){if(flag!=='GREEN'||this.flag!==null)add('flag:'+flag+':'+p.time,flag==='GREEN'?'ธงเขียว · กลับมาแข่งได้':flag==='VSC'?'VSC · ลดความเร็วและห้ามแซง':'ธงเหลือง · ระวังรถในเขตเกิดเหตุ',4,'flag',0);this.flag=flag;}
  if(car.live26?.retired)add('retired:'+id,'รถออกจากการแข่งขันแล้ว',5,'retired',Infinity);
  else if((car.live26?.puncture??-1)>=0)add('puncture:'+id+':'+(car.tyres?.sets??1),'ยางเสีย · ประคองรถกลับพิท',5,'puncture',20);
  if(row.finishedAt!==null&&row.finishedAt!==undefined)add('finish:'+id,'ธงตราหมากรุก · เข้าเส้นชัย P'+(p.results?.find(r=>r.id===id)?.position??row.position??p.snapshot.cars.findIndex(r=>r.id===id)+1),4,'finish',0);
  for(const e of p.moments??[]){if(p.time-e.time<0||p.time-e.time>7)continue;
   if(e.kind==='OVERTAKE'&&(e.by===id||e.of===id))add('pass:'+e.time+':'+e.by+':'+e.of,e.by===id?'ผ่าน '+(p.cars.find(c=>c.id===e.of)?.name??'#'+e.of)+' แล้ว · รักษาจังหวะต่อ':'เสียตำแหน่งให้ '+(p.cars.find(c=>c.id===e.by)?.name??'#'+e.by)+' · รอช่องสวน',3,'pass',5);
  }
  for(const e of p.radio??[]){if((e.id===id||e.id===0)&&p.time-e.time>=0&&p.time-e.time<6)add('radio:'+e.time+':'+e.id+':'+e.text,e.text,e.id===0?3:2,'engineer',9);}
  for(const e of p.pitEvents??[]){if(e.car!==id&&e.kind==='PIT_ENTRY'&&p.time-e.time>=0&&p.time-e.time<6)add('rivalpit:'+e.car+':'+e.time,(p.cars.find(c=>c.id===e.car)?.name??'#'+e.car)+' เข้าพิท · เช็กแผนของเรา',2,'rivalpit',25);}
  const tyre=car.tyres??row.tyres,engineer=p.engineer?.cars.find(c=>c.id===id);
  if(tyre?.thermal38?.phase==='HOT'&&!car.pit?.active)add('hot38:'+id+':'+tyre.sets,'ยางร้อน · ลดการสไลด์และดูแลขาออกโค้ง',2,'thermal38',40);
  if(tyre?.sets>1&&tyre.thermal38?.phase==='READY'&&!car.pit?.active)add('ready38:'+id+':'+tyre.sets,'ยางเข้าช่วงพร้อมแล้ว · บุกเมื่อมีพื้นที่',1,'ready38',35);
  if(tyre&&tyre.health<.35&&!car.pit?.active)add('tyre:'+id+':'+tyre.sets,'ยางเหลือ '+Math.round(tyre.health*100)+'% · ตรวจแผน BOX',3,'tyre',35);
  if(p.time>10&&engineer?.front&&engineer.gap>12&&engineer.gap<90&&engineer.closing>.5&&!car.pit?.active)add('closing:'+engineer.front+':'+Math.floor(p.time/35),'กำลังไล่ '+(p.cars.find(c=>c.id===engineer.front)?.name??'#'+engineer.front)+' · รอช่องบุก',1,'closing',35);
  candidates.sort((a,b)=>b.priority-a.priority);
  const next=candidates[0];
  if(this.current&&p.time-this.current.time>=6.5)this.current=null;
  if(next&&(!this.current||next.priority>=4&&(next.priority>this.current.priority||next.category==='flag'&&this.current.category==='flag'))){
   this.current={...next,serial:++this.serial};this.seen.add(next.key);this.cooldowns.set(next.category,p.time);this.history.push(this.current);
   if(this.history.length>16)this.history.shift();if(this.seen.size>96)this.seen.delete(this.seen.values().next().value);
  }
  return this.current;
 }
}
