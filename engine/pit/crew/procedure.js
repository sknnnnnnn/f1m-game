import {BRAKE as B} from './brake-service.js';
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const ease=x=>{const t=clamp(x);return t*t*t*(t*(t*6-15)+10);};
export const ramp=(t,a,b)=>ease((t-a)/(b-a));
export const MODES={
 tyres:{title:'เปลี่ยนยาง 4 ล้อ',context:'PIT LANE',duration:9.5,serviceEnd:6.13,description:'ช่าง 3 คนต่อล้อ • แม่แรงหน้า–หลัง • ตรวจปล่อยรถ'},
 nose:{title:'เปลี่ยนจมูก–ปีกหน้า',context:'PIT LANE',duration:14,serviceEnd:10.70,description:'พยุงด้วย side jack • ถอดชุดเก่า • ประกบและล็อกชุดใหม่'},
 rear:{title:'โรงรถ · เปลี่ยนปีกหลัง',context:'GARAGE',duration:17,serviceEnd:13.5,description:'รถบนขาตั้ง • ถอดชุดปีกหลัง • จัดแนวและขันยึด'},
 brakes:{title:'โรงรถ · งานเบรก',context:'GARAGE',duration:15,serviceEnd:12,description:'ถอดเฉพาะล้อ FR • ถอดชุดเบรกจำลอง • ใส่ชุดใหม่ • ตรวจและประกอบล้อ'},
 panels:{title:'โรงรถ · เปลี่ยนแผงข้างซ้ายที่เสีย',context:'GARAGE',duration:19,serviceEnd:15.5,description:'ปลดเฉพาะแผงซ้าย • ดึงออกด้านข้าง • ตรวจภายในและประกอบกลับ'}
};
export function sampleProcedure(mode,t,{traffic=false,fault=false,crewReadyAt=0,releasePermitAt=0,releaseEnabled=true}={}){
 const spec=MODES[mode]??MODES.tyres;t=Math.max(0,t);
 const garage=spec.context==='GARAGE',stop=garage?0:2.75,delayed=fault&&mode==='tyres'?1.25:0;
 const serviceEnd=spec.serviceEnd+delayed,clearAt=Math.max(serviceEnd,crewReadyAt),downAt=clearAt+.02,releaseAt=Math.max(downAt+.10+(traffic&&!garage?2.5:0),releasePermitAt);
 const u=Math.max(0,t-releaseAt),powered=9*Math.min(u,30/18)**2+30*Math.max(0,u-30/18);
 const carZ=garage?0:(1-ramp(t,0,2))*10-(releaseEnabled?powered:0);
 const lift=garage?.14:.085*ramp(t,2.55,2.85)*(1-ramp(t,downAt,downAt+.10));
 const corners=[0,.035,.055,.08].map((offset,i)=>{
  const delay=i===1?delayed:0,a=stop+offset;
  const idle={preload:0,unlock:0,pull:0,mount:0,tighten:1,secure:true,oldAway:0,active:false,dodge:0,gunReturn:1,exit:1,gunUse:false};
  if(mode!=='tyres'&&mode!=='brakes')return idle;
  if(mode==='brakes'&&i!==1)return idle;
  if(mode==='brakes')return {preload:ramp(t,B.wheelPrepare,B.wheelReady),unlock:ramp(t,1,1.4),dodge:ramp(t,1.15,1.85),pull:ramp(t,2.05,2.65),mount:ramp(t,B.wheelReady,B.wheelMountEnd),gunReturn:ramp(t,B.wheelMountEnd,B.gunReady),tighten:ramp(t,B.gunReady+.05,B.tightEnd),exit:ramp(t,B.exitStart,B.exitEnd),secure:t>=B.exitStart,oldAway:ramp(t,2.4,3.4),active:t>1&&t<B.exitStart,gunUse:t<1.45||t>B.gunReady&&t<B.exitStart};
  return {preload:ramp(t,a+.42,a+1.18),unlock:ramp(t,a+.16,a+.38),dodge:ramp(t,a+.30,a+.82),pull:ramp(t,a+.95,a+1.50),mount:ramp(t,a+1.65+delay,a+2.40+delay),gunReturn:ramp(t,a+2.40+delay,a+2.95+delay),tighten:ramp(t,a+3.0+delay,a+3.25+delay),exit:ramp(t,a+3.30+delay,a+3.85+delay),secure:t>=a+3.30+delay,oldAway:ramp(t,a+1.35,a+1.95),active:t>a+.08&&t<a+3.30+delay,gunUse:t<a+.40||t>a+2.98+delay&&t<a+3.30+delay};
 });
 let part={remove:0,install:0,unlock:0,fasten:1,active:false};
 if(mode==='nose')part={unlock:ramp(t,3.5,4.3),remove:ramp(t,4.4,7.7),install:ramp(t,5.0,8.8),fasten:ramp(t,8.85,10.7),active:t>3.2&&t<10.8};
 if(mode==='rear')part={unlock:ramp(t,1,3),remove:ramp(t,3.1,7.1),install:ramp(t,4.2,9.6),fasten:ramp(t,9.65,13.2),active:t>1&&t<13.3};
 if(mode==='panels')part={unlock:ramp(t,1,3.5),remove:ramp(t,3.6,7.2),install:ramp(t,10,13.6),fasten:ramp(t,13.65,15.3),active:t>1&&t<15.4};
 if(mode==='brakes')part={unlock:ramp(t,3.15,B.removeStart),remove:ramp(t,B.removeStart,B.removeEnd),install:ramp(t,B.installStart,B.installEnd),fasten:ramp(t,B.fastenStart,B.fastenEnd),verified:t>=B.verifyEnd,active:t>3.15&&t<B.verifyEnd};
 const allWheels=corners.every(c=>c.secure),partSecure=mode==='tyres'||(mode==='brakes'?t<B.removeStart&&part.unlock===0||part.verified:part.fasten>=.999);
 const crewClear=t>=clearAt,carDown=garage?false:t>=downAt+.10;
 const laneClear=!traffic||t>=downAt+.10+2.5;
 const released=releaseEnabled&&!garage&&allWheels&&partSecure&&crewClear&&carDown&&laneClear&&t>=releaseAt;
 let stage='เตรียมพื้นที่';
 if(mode==='tyres'&&t>=2.26&&t<serviceEnd){const c=corners[0];stage=c.unlock<1?'ยิงคลาย / เริ่มหลบแนวล้อ':c.pull===0?'คนยิงหลบ / คนถอดเข้าจับ':c.pull<1?'ดึงล้อเก่าออก':c.mount===0?'ถอนล้อเก่า / ล้อใหม่เข้ารอ':c.mount<1?'ใส่ล้อใหม่':c.gunReturn<1?'คนใส่ถอนตัว / คนยิงกลับเข้าดุม':c.tighten<1?'ยิงยึดล้อ':'ยืนยัน / ถอนตัวออกจากรถ';}
 else if(mode==='nose'&&t>=2.26&&t<serviceEnd)stage=t<3.9?'ย้ายแม่แรง / ปลดชุดปีกหน้า':t<7.45?'ถอดชุดเก่า / นำชุดใหม่เข้ารอ':'ประกบและขันยึดปีกหน้า';
 else if(!garage){if(t<1.9)stage='รถเข้าจุดจอด';else if(t<2.26)stage='หยุดตรงมาร์ก / ยกรถ';else if(t<2.65)stage='คลายน็อต';else if(t<3)stage='ดึงล้อเก่าออก';else if(t<3.55+delayed)stage='จัดแนวล้อใหม่เข้าดุม';else if(t<4.15+delayed)stage='ขันยึดและยืนยัน';else if(t<serviceEnd)stage=mode==='nose'?'เปลี่ยนชุดจมูก–ปีกหน้า':'ตรวจล้อทั้งสี่';else if(!crewClear)stage='ช่างถอนตัว';else if(!carDown)stage='ลดแม่แรง';else if(!laneClear)stage='HOLD · รอช่องว่างในพิตเลน';else if(released)stage='GREEN · ปล่อยรถ';else stage='ตรวจปล่อยรถ';}
 else if(mode==='brakes')stage=t<1?'เตรียมงานเบรก':t<2.65?'คลายน็อต / ถอดล้อเดิม':t<B.removeStart?'ปลดชุดเบรก / เตรียมชุดใหม่':t<B.removeEnd?'นำชุดเก่าออก / ชุดใหม่เข้ารอ':t<B.installEnd?'ประกบชุดเบรกใหม่':t<B.fastenEnd?'ขันยึดชุดเบรก':t<B.verifyEnd?'ตรวจการยึดและระบบเบรก':t<B.wheelReady?'นำล้อเดิมกลับเข้ารอ':t<B.wheelMountEnd?'ใส่ล้อเดิม':t<B.exitStart?'ยิงยึดล้อ / ยืนยัน':'งานเสร็จ · รถยังอยู่ในโรงรถ';
 else stage=t<1?'รถบนขาตั้ง / เตรียมเครื่องมือ':part.remove<1&&mode!=='brakes'?'ปลดตัวยึด / ยกชิ้นส่วน':t<spec.serviceEnd?'ทำงาน / ประกอบและตรวจ':'งานเสร็จ · รถยังอยู่ในโรงรถ';
 return {mode,t,spec,duration:spec.duration+delayed+(traffic&&!garage?2.5:0)+Math.max(0,releaseAt-(serviceEnd+.02+.10+(traffic&&!garage?2.5:0))),garage,carZ,lift,corners,part,stage,serviceEnd,clearAt,downAt,releaseAt,crewClear,allWheels,partSecure,carDown,laneClear,released,signal:released?'green':'red',sideSupport:mode==='nose'&&t>=3.05&&!carDown,crewRetreat:garage?ramp(t,spec.serviceEnd,spec.serviceEnd+1):ramp(t,serviceEnd-.35,serviceEnd+.65)};
}
