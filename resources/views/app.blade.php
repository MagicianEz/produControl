<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#4DB8FF">
    <meta name="description" content="ProduControl">
    <link rel="manifest" href="{{ asset('manifest.json') }}">
    <link rel="icon" href="{{ asset('assets/images/icon.jpg') }}" sizes="256x256">
    <title inertia>{{ config('app.name', 'Laravel') }}</title>
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

    <!-- Scripts -->
    @routes
    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
    @inertiaHead
    @laravelPWA

</head>

<body class="font-sans antialiased">
    @inertia
    <script>
        let deferredPrompt;

        // Mendaftarkan service worker  
        if ("serviceWorker" in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register("service-worker.js").then(
                    (registration) => {
                        console.log("Service worker registration succeeded:", registration);
                    },
                    (error) => {
                        console.error(`Service worker registration failed: ${error}`);
                    }
                );
            });
        } else {
            console.error("Service workers are not supported.");
        }

        // Menangani event beforeinstallprompt  
        window.addEventListener('beforeinstallprompt', (event) => {
            // Mencegah prompt default  
            event.preventDefault();
            // Simpan event untuk digunakan nanti  
            deferredPrompt = event;
            // Tampilkan tombol instalasi  
            document.getElementById('install-button').style.display = 'block';
        });

        // Menangani klik pada tombol instalasi  
        document.getElementById('install-button').addEventListener('click', () => {
            if (deferredPrompt) {
                // Tampilkan prompt instalasi  
                deferredPrompt.prompt();
                // Tunggu hasil dari prompt  
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the A2HS prompt');
                    } else {
                        console.log('User dismissed the A2HS prompt');
                    }
                    deferredPrompt = null; // Reset deferredPrompt  
                });
            }
        });
    </script>
</body>

</html>