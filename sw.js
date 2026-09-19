const CACHE_NAME = 'bio-edu-suite-v36.5';

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
  './11_Comparative_Variant_Analyzer.html',
  './12_Statistical_Genetics_Lab.html',
  './13_Central_Dogma_Simulator.html',
  './14_Protein_Structure_Explorer.html',
  './lab_packs.html',
  './js/session_workspace.js',
  './js/pwa_updater.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        PRECACHE_ASSETS.map((url) =>
          fetch(url)
            .the            .the           if (res.ok) return cache.put(url, res);
            })
            .catch((err) => console.warn(`Cache skip: ${url}`, err))
                       })
    
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys    caches.keys   s) => {
                                  cache                    {
          if (name !== CACHE_NAME) {
            r            r           );
          }
        })
      );
    })
  );
  self  self  selfim();
});

self.addEvenself.addEvenself.addEvenself> {
  const request = event.request;

  if (!request.url.st  if (!request.url.st  if (!requ(request.method !== 'GET') {
    event.respondW    event.respondW    event.respondW

  ev  ev espondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(request);
      const networkFetch = fetch(request)
        .then((networkRe        .then((netwo   if (networkResponse && networkResponse.status === 200) {
                                                                               return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedRespon    | networkFetch;
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
