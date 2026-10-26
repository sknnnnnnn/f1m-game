const CACHE='f1m-engine-50bc2a6ed90a5aab',ASSETS=["./assets/app.js","./assets/cpu.js","./assets/engine.js","./assets/game.css","./assets/hand.js","./assets/mobile.js","./assets/rig.js","./build.json","./icons/icon-192.png","./icons/icon-512.png","./icons/maskable-512.png","./index.html","./manifest.webmanifest","./models/F1M_SafetyCar_SC1.glb","./models/car163.glb","./workers/physics-worker.js","./workers/race-worker.js"],BASE=new URL('./',self.location.href);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS))));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();});
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('f1m-engine-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))return;
 if(request.mode==='navigate'){event.respondWith(caches.match(new URL('index.html',BASE).href).then(shell=>shell||fetch(request)));return;}
 event.respondWith(caches.match(request).then(hit=>hit||fetch(request)));
});
