// Stable drawing-buffer allocation: a running/paused transition never resizes it.
export class RenderPolicy {
 constructor(){this.mode='AUTO';this.factor=1;this.slow=0;this.fast=0;this.lastChange=-Infinity;this.lastSize=null;this.allocations=0;}
 setMode(mode){if(!['AUTO','LOW','HIGH'].includes(mode))return;this.mode=mode;this.factor=1;this.slow=0;this.fast=0;}
 sample(ms,time,cpu){if(this.mode!=='AUTO'||!Number.isFinite(ms)||time-this.lastChange<8000)return false;this.slow=ms>(cpu?90:34)?this.slow+1:0;this.fast=ms<(cpu?22:16)?this.fast+1:0;let next=this.factor;if(this.slow>=90)next=Math.max(cpu?.7:.82,this.factor-.08);else if(this.fast>=240)next=Math.min(1,this.factor+.04);if(next===this.factor)return false;this.factor=next;this.slow=0;this.fast=0;this.lastChange=time;return true;}
 size(width,height,dpr=1,cpu=false){if(cpu){const cap=this.mode==='HIGH'?520:this.mode==='LOW'?280:400*this.factor,k=Math.min(1,cap/width,cap*.75/height);return {width:Math.max(1,Math.round(width*k)),height:Math.max(1,Math.round(height*k)),cssWidth:width,cssHeight:height,pixelRatio:1};}const ratio=Math.min(dpr,this.mode==='LOW'?1:this.mode==='HIGH'?2:Math.max(1,1.4*this.factor));return {width,height,cssWidth:width,cssHeight:height,pixelRatio:ratio};}
 changed(size){const key=JSON.stringify(size);if(key===this.lastSize)return false;this.lastSize=key;this.allocations++;return true;}
 profile(cpu=false){return {shadows:!cpu&&this.mode!=='LOW',shadowSize:this.mode==='LOW'?512:1024,detailDistance:cpu?32:this.mode==='LOW'?45:this.mode==='HIGH'?160:100};}
}
export function cameraDepth(mode){return mode==='overview'?{near:15,far:9000}:mode==='high'?{near:1.5,far:3000}:mode==='fps'||mode==='nose'?{near:.12,far:1100}:mode==='trackside'?{near:.8,far:1800}:{near:.65,far:1800};}
