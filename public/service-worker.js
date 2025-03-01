self.addEventListener("install", (event) => {
    event.waitUntil(
        fetch("/asset-manifest.json")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Gagal mengambil daftar assets: " + response.statusText);
                }
                return response.json();
            })
            .then((manifest) => {
                return caches.open("offline-cache").then((cache) => {
                    let filesToCache = [
                        "/offline.html",
                        "/manifest.json",
                        "/assets/images/icon.jpg",
                        "/assets/images/web.png",
                        "/",
                        "/dashboard",
                        "/dashboard/category",
                        "/dashboard/stock",
                        "/dashboard/production",
                        "/dashboard/delivery",
                        "/dashboard/user"
                    ];

                    Object.values(manifest.files).forEach((file) => {
                        filesToCache.push(file);
                    });

                    return cache.addAll(filesToCache);
                });
            })
            .catch((error) => {
                console.error("[Service Worker] Gagal mengambil daftar assets:", error);
            })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // Jika ditemukan di cache, gunakan cache
            if (cachedResponse) {
                return cachedResponse;
            }

            // Jika tidak ada di cache, coba ambil dari jaringan
            return fetch(event.request)
                .then((networkResponse) => {
                    return caches.open("offline-cache").then((cache) => {
                        // Simpan file yang berhasil di-fetch ke dalam cache
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                })
                .catch(() => {
                    console.warn("[Service Worker] Tidak ada di cache & jaringan gagal:", event.request.url);
                    return caches.match("/offline.html");
                });
        })
    );
});
