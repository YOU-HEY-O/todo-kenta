const CACHE_NAME = 'todo-kenta-v3';
const CACHE_URLS = [
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Noto+Sans+JP:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache=>{
      return cache.addAll(CACHE_URLS).catch(()=>{});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ネットワーク優先（常に最新を取得）
self.addEventListener('fetch', e=>{
  if(e.request.url.includes('supabase.co')) return;

  e.respondWith(
    fetch(e.request)
      .then(res=>{
        if(res.ok && e.request.method === 'GET'){
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put(e.request, clone));
        }
        return res;
      })
      .catch(()=> caches.match(e.request))
  );
});
