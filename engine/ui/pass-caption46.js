export function passCaption46(payload,selected){
 const event=payload?.events?.filter(e=>e.kind==='OVERTAKE'&&(e.by===selected||e.of===selected)&&!['YELLOW','VSC'].includes(e.decision)).at(-1);
 if(!event||payload.time-event.time>5||payload.time<event.time)return null;
 return (event.by===selected?'แซงสำเร็จ · ':'เสียตำแหน่ง · ')+(event.explanation46??'ผ่านช่องว่างในสนาม');
}
export function mountPassCaption46(){
 const node=document.createElement('div');node.id='pass-caption46';node.hidden=true;
 node.style.cssText='position:fixed;bottom:calc(165px + env(safe-area-inset-bottom));left:50%;transform:translateX(-50%);z-index:62;pointer-events:none;max-width:88vw;padding:8px 13px;border-radius:8px;border:1px solid #86d9cf;background:#102d36eb;color:#e7fff5;font:600 12px system-ui;text-align:center';document.body.append(node);
 return {update(payload,selected,running,replay){const text=!replay&&running?passCaption46(payload,selected):null;node.hidden=!text;if(text)node.textContent=text;}};
}
