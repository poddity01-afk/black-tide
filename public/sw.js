// 오프라인 지원: 한 번 열었던 파일을 저장해 두고, 인터넷이 없을 때 꺼내 씁니다.
// 새 버전을 올리면 VERSION을 바꿀 필요 없이, 온라인일 때 항상 최신 파일을 먼저 받아옵니다.
const CACHE = 'blacktide-v1';
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html']))); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
