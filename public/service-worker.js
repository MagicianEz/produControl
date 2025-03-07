self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open("offline-cache").then((cache) => {
            return cache.addAll([
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
                "/build/assets/AdminLayout-BhBAE5QR.js",
                "/build/assets/app-CU4SV4jZ.css",
                "/build/assets/app-X2YEo5ur.js",
                "/build/assets/Card-C6ZUuSBe.js",
                "/build/assets/createLucideIcon-EiEJBFdC.js",
                "/build/assets/index-DW0AXzQJ.js",
                "/build/assets/index-ZSF_6mWq.js",
                "/build/assets/Label-DKK-37-_.js",
                "/build/assets/transition-eQR-OGk1.js",
                "/build/assets/Table-D9bn6Wdu.js",
                "/build/assets/Select-Csixy0sL.js",
                "/build/assets/Badge-ClsX21DK.js",
                "/build/assets/react-select.esm-Dmjbj_0X.js",
                "/build/assets/ellipsis-CnZ1XhoW.js",
                "/build/assets/Dashboard-Ce2Lz2cW.js",
                "/build/assets/page-BIqkKZav.js",
                "/build/assets/page-CifPcJHr.js",
                "/build/assets/page-D1fk8oTu.js",
                "/build/assets/Popover-DZpoblEd.js",
                "/build/assets/page-Der6iYVo.js",
                "/build/assets/page-DsnVB_0o.js",
                "/build/assets/utils-BM_CldAA.js",
                "/build/assets/Welcome-BGpgunek.js"
            ]);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== "offline-cache") {
                        console.log("[Service Worker] Menghapus cache lama:", cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") {
        console.log("[Service Worker] Melewatkan request non-GET:", event.request.url);
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // if (!networkResponse || networkResponse.status !== 200) {
                //     console.warn("[Service Worker] Respon jaringan tidak valid:", networkResponse);
                //     return caches.match("/offline.html");
                // }

                return caches.open("offline-cache").then((cache) => {
                    console.log("[Service Worker] Menyimpan respon jaringan ke cache:", event.request.url);
                    // cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                console.warn("[Service Worker] Gagal mengambil dari jaringan, mencoba dari cache:", event.request.url);
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        console.log("[Service Worker] Mengambil dari cache:", event.request.url);
                        return cachedResponse;
                    } else {
                        console.log("[Service Worker] Menampilkan halaman offline.");
                        return caches.match("/offline.html");
                    }
                });
            })
    );
});
