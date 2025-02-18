<?php

return [
    'name' => 'ProduControl',
    'manifest' => [
        'name' => env('APP_NAME', 'ProduControl'),
        'short_name' => 'ProduControl',
        'start_url' => '/',
        'background_color' => '#ffffff',
        'theme_color' => '#000000',
        'display' => 'standalone',
        'orientation' => 'any',
        'status_bar' => 'black',
        'icons' => [
            '72x72' => [
                'path' => '/public/assets/images/icon.jpg',
                'purpose' => 'any'
            ],
            '96x96' => [
                'path' => '/public/assets/images/icon.jpg',
                'purpose' => 'any'
            ],
            '128x128' => [
                'path' => '/public/assets/images/icon.jpg',
                'purpose' => 'any'
            ],
            '144x144' => [
                'path' => '/public/assets/images/icon.jpg',
                'purpose' => 'any'
            ],
            '152x152' => [
                'path' => '/public/assets/images/icon.jpg',
                'purpose' => 'any'
            ],
            '192x192' => [
                'path' => '/public/assets/images/icon.jpg',
                'purpose' => 'any'
            ],
            '384x384' => [
                'path' => '/public/assets/images/icon.jpg',
                'purpose' => 'any'
            ],
            '512x512' => [
                'path' => '/public/assets/images/icon.jpg',
                'purpose' => 'any'
            ],
        ],
        'splash' => [
            '640x1136' => '/public/assets/images/icon.jpg',
            '750x1334' => '/public/assets/images/icon.jpg',
            '828x1792' => '/public/assets/images/icon.jpg',
            '1125x2436' => '/public/assets/images/icon.jpg',
            '1242x2208' => '/public/assets/images/icon.jpg',
            '1242x2688' => '/public/assets/images/icon.jpg',
            '1536x2048' => '/public/assets/images/icon.jpg',
            '1668x2224' => '/public/assets/images/icon.jpg',
            '1668x2388' => '/public/assets/images/icon.jpg',
            '2048x2732' => '/public/assets/images/icon.jpg',
        ],
        'shortcuts' => [
            [
                'name' => 'Shortcut Link 1',
                'description' => 'Shortcut Link 1 Description',
                'url' => '/shortcutlink1',
                'icons' => [
                    "src" => "/public/assets/images/icon.jpg",
                    "purpose" => "any"
                ]
            ],
            [
                'name' => 'Shortcut Link 2',
                'description' => 'Shortcut Link 2 Description',
                'url' => '/shortcutlink2'
            ]
        ],
        'custom' => []
    ]
];