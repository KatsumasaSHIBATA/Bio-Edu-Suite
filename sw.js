const CACHE_NAME = 'bio-edu-suite-v34.1';

// アプリ全体の主要ファイル・全サブページをプリキャッシュ
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './auth_sync.js',
  './1_Master_Mix_Studio.html',
  './2_Thermal_Cycler_Simulator.html',
  './3_Virtual_PCR_RFLP.html',
  './4_Sanger_Trace_Editor.html',
  './5_DNA_Alignment_Studio.html',
  './6_Alignment_Print_Studio.html',
  './7_Virtual_BLAST_Explorer.html',
  './8_Phylogenetic_Tree_Builder.html',
  './9_Morphometrics_Studio.html',
  './10_integrative_taxonomy_studio.html',
  './11_Statistical_Genetics_Lab.html',
  './12_Central_Dogma_Simulator.html',
  './13_Protein_Structure_Explorer.html',
  './lab_packs.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // 1つ失敗しても全体が落ちないよう個別catch付きでキャッシュ
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          fetch(url)
            .then((res) => {
              if (res.ok) return cache.put(url, res);
            })
            .catch((err) => console.warn(`Cache skip: ${url}`, err))
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // HTTP/HTTPS 以外のスキーム（chrome-extension等）は無視
  if (!request.url.startsWith('http')) return;

  // POST等のデータ通信はキャッシュせず通常ネットワークへ
  if (request.method !== 'GET') {
    event.respondWith(fetch(request));
    return;
  }

  // HTML / JS / 画像等: Stale-While-Revalidate（即座にキャッシュを返し、裏で最新版へ更新）
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(request);

      const networkFetch = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      // キャッシュがあれば即返し、なければネットワーク待機
      return cachedResponse || networkFetch;
    })
  );
});
