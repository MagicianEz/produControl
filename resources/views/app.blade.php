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
    {{-- @vite(['resources/js/app.tsx']) --}}
    @inertiaHead
    @laravelPWA

</head>

<body class="font-sans antialiased">
    @inertia

    <!-- Tombol Install -->
    <button id="install-button" style="display: none;">Install</button>

    <script>
        if ("serviceWorker" in navigator) {
            window.addEventListener("load", () => {
                navigator.serviceWorker.register("/service-worker.js")
                    .then((registration) => {
                        console.log("Service Worker Registered:", registration);
                    })
                    .catch((error) => {
                        console.error("Service Worker Registration Failed:", error);
                    });
            });
        }
    </script>
</body>

</html>
