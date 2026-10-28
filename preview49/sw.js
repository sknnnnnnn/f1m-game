const BASE=new URL('./',self.location.href),PREFIX='f1m-engine-scope-'+encodeURIComponent(BASE.pathname)+'-',CACHE=PREFIX+'d0864a782aa826ea',ASSETS=["./assets/app.js","./assets/cpu.js","./assets/engine.js","./assets/game.css","./assets/hand.js","./assets/mobile.js","./assets/rig.js","./build.json","./icons/icon-192.png","./icons/icon-512.png","./icons/maskable-512.png","./index.html","./manifest.webmanifest","./mobile49.html","./models/F1M_SafetyCar_SC1.glb","./models/car163.glb","./workers/physics-worker.js","./workers/race-worker.js"];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 // Version the network request, but retain canonical offline lookup keys.
 // Otherwise a new SW can fill its new cache with an older HTTP/CDN response.
 await Promise.all(ASSETS.map(async path=>{
  const key=new URL(path,BASE),fresh=new URL(key);fresh.searchParams.set('__f1m',CACHE);
  const response=await fetch(new Request(fresh,{cache:'reload'}));
  if(!response.ok)throw Error('Update asset unavailable: '+path);
  await cache.put(key.href,response);
 }));
})()));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))return;
 if(request.mode==='navigate'&&/\.html?$/.test(url.pathname)&&url.pathname!==new URL('index.html',BASE).pathname)return;
 if(request.mode==='navigate'){event.respondWith(caches.open(CACHE).then(cache=>cache.match(new URL('index.html',BASE).href)).then(shell=>shell||fetch(request)));return;}
 event.respondWith(caches.open(CACHE).then(cache=>cache.match(request)).then(hit=>hit||fetch(request)));
});
