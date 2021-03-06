// *******************************************   p-cache.js    ***********************************************
// What it does: it caches all requests a site makes (css, js, html, etc.) and when the app is offline it loads the cached version.
// On the Developer Tools' Network tab, if Disable cache is checked, requests will go to the network instead of the Service Worker. Uncheck that.
// Incognito mode skips the service worker as well!

var cacheName = "resp-off";

// Installing Service Worker
// "https://legends.io/index.html"
self.addEventListener("install", function (e) {
	e.waitUntil(
		caches.open(cacheName).then(function (cache) {
			return cache.addAll(["/", "/icons-512.png"]);
		}),
	);
	self.skipWaiting();
	console.log("[Service Worker] Install");
});

self.addEventListener("activate", (e) => {
	// Remove unwanted caches
	e.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cache) => {
					if (cache !== cacheName) {
						return caches.delete(cache);
					}
				}),
			);
		}),
	);
});

// FETCH PROXY & CACHING
// 1.) try get resource from cache else fetch and update cache else --> error
self.addEventListener("fetch", function (e) {
	e.respondWith(
		caches.match(e.request).then(function (r) {
			return (
				r ||
				fetch(e.request)
					.then(function (response) {
						return caches.open(cacheName).then(function (cache) {
							cache.put(e.request, response.clone()).catch(function (err) {
								return;
							});
							return response;
						});
					})
					.catch(function (err) {
						return;
					})
			);
		}),
	);
});
