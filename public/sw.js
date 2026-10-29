const BASE=new URL('./',self.location.href),PREFIX='f1m-engine-scope-'+encodeURIComponent(BASE.pathname)+'-',CACHE=PREFIX+'__CACHE_VERSION__',ASSETS=__PRECACHE__,HASHES=__ASSET_HASHES__,SHARED='f1m-immutable-sha256-v1';
const immutable=path=>/^\.\/(models\/|icons\/|assets\/(engine|cpu|hand|rig)\.js$)/.test(path);
const cacheStatus56={completed:0,total:ASSETS.length,downloaded:0,reused:0};
async function notifyCache56(phase){if(!self.clients.matchAll)return;const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});for(const client of clients)client.postMessage({type:'F1M_CACHE56',phase,...cacheStatus56});}
const sharedKey=path=>new URL('/__f1m_asset_sha256__/'+HASHES[path],BASE).href;
async function verified(response,path){if(!response.ok)throw Error('Update asset unavailable: '+path);const bytes=await response.clone().arrayBuffer(),digest=await crypto.subtle.digest('SHA-256',bytes),hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');if(hash!==HASHES[path])throw Error('Update asset hash mismatch: '+path);return response;}
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE),shared=await caches.open(SHARED);let cursor=0;
 // Limit download/hash concurrency on phones. Unchanged large files are reused
 // by content hash across releases and preview paths on the same origin.
 async function next(){while(cursor<ASSETS.length){const path=ASSETS[cursor++],key=new URL(path,BASE),stable=immutable(path),target=stable?shared:cache,lookup=stable?sharedKey(path):key.href;if(stable&&await shared.match(lookup)){cacheStatus56.reused++;cacheStatus56.completed++;await notifyCache56('INSTALLING');continue;}const fresh=new URL(key);fresh.searchParams.set('__f1m',CACHE);const response=await verified(await fetch(new Request(fresh,{cache:'reload'})),path);await target.put(lookup,response);cacheStatus56.downloaded++;cacheStatus56.completed++;await notifyCache56('INSTALLING');}}
 const results=await Promise.allSettled(Array.from({length:4},next));const failed=results.find(r=>r.status==='rejected');if(failed){await notifyCache56('ERROR');throw failed.reason;}await notifyCache56('READY');
})()));
self.addEventListener('message',event=>{if(event.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();if(event.data?.type==='GET_CACHE_STATUS56')event.waitUntil((async()=>{const cache=await caches.open(CACHE),shared=await caches.open(SHARED);let found=0;for(const path of ASSETS)if(await (immutable(path)?shared.match(sharedKey(path)):cache.match(new URL(path,BASE).href)))found++;event.source?.postMessage({type:'F1M_CACHE56',phase:found===ASSETS.length?'READY':'INCOMPLETE',completed:found,total:ASSETS.length});})());});
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==BASE.origin||!url.pathname.startsWith(BASE.pathname))return;
 if(request.mode==='navigate'&&/\.html?$/.test(url.pathname)&&url.pathname!==new URL('index.html',BASE).pathname)return;
 if(request.mode==='navigate'){event.respondWith(caches.open(CACHE).then(cache=>cache.match(new URL('index.html',BASE).href)).then(shell=>shell||fetch(request)));return;}
 const path='./'+url.pathname.slice(BASE.pathname.length),stable=immutable(path)&&!!HASHES[path]&&!url.search;
 event.respondWith((async()=>{const cache=await caches.open(stable?SHARED:CACHE),key=stable?sharedKey(path):request,hit=await cache.match(key);if(hit)return hit;const response=await fetch(request);if(stable&&response.ok){const checked=await verified(response,path);await cache.put(key,checked.clone());}return response;})());
});
