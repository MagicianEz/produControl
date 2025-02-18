const filesToCache = ["/", "/offline.html", "/assets/images/icon.jpg"];

// Preload files into the cache during the service worker installation
const preLoad = function () {
    return caches.open("offline").then(function (cache) {
        return Promise.all(
            filesToCache.map(function (url) {
                return fetch(url).then(function (response) {
                    if (response.ok) {
                        return cache.put(url, response.clone());
                    }
                    return Promise.reject(new Error(`Failed to fetch ${url}`));
                });
            })
        )
            .then(function () {
                console.log("All files cached successfully");
            })
            .catch(function (error) {
                console.error("Failed to cache files:", error);
            });
    });
};

// Install event to cache files
self.addEventListener("install", function (event) {
    event.waitUntil(preLoad());
});

// Check if the response is valid
const checkResponse = function (request) {
    return new Promise(function (fulfill, reject) {
        fetch(request)
            .then(function (response) {
                if (response.ok) {
                    fulfill(response);
                } else {
                    reject();
                }
            })
            .catch(reject); // Catch network errors
    });
};

// Add the request to the cache
const addToCache = function (request) {
    return caches.open("offline").then(function (cache) {
        return fetch(request).then(function (response) {
            if (response.ok) {
                return cache.put(request, response.clone());
            }
            return response; // Return the response if not ok
        });
    });
};

// Return the cached response or the offline page
const returnFromCache = function (request) {
    return caches.open("offline").then(function (cache) {
        return cache.match(request).then(function (matching) {
            if (!matching || matching.status === 404) {
                return cache.match("offline.html"); // Return offline page if not found
            } else {
                return matching; // Return the cached response
            }
        });
    });
};

// Fetch event to handle requests
self.addEventListener("fetch", function (event) {
    if (event.request.url.startsWith(self.location.origin)) {
        // Check if the request is for the same origin
        event.respondWith(
            checkResponse(event.request).catch(function () {
                return returnFromCache(event.request);
            })
        );
        if (event.request.method === "GET") {
            event.waitUntil(addToCache(event.request));
        }
    }
});
