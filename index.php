<?php
/**
 * Routeur PHP principal pour ALGO++
 * 
 * Sert l'application SPA (dist/index.html) et les fichiers statiques.
 * 
 * http://127.0.0.1/MesProjets/FnUs2/
 */

// Désactiver l'affichage des erreurs en production
ini_set('display_errors', 0);

// Récupérer l'URI demandée
$requestUri = $_SERVER['REQUEST_URI'] ?? '/';
$path = parse_url($requestUri, PHP_URL_PATH);

// Enlever le préfixe du projet pour obtenir le chemin relatif
$basePath = '/MesProjets/FnUs2';
$relativePath = str_replace($basePath, '', $path);
$relativePath = '/' . ltrim($relativePath, '/');

// === ROUTES STATIC FILES ===
// Si le fichier demandé existe dans dist/, le servir directement
$distFile = __DIR__ . '/dist' . $relativePath;
if ($relativePath !== '/' && file_exists($distFile) && !is_dir($distFile)) {
    // Déterminer le type MIME
    $extension = pathinfo($distFile, PATHINFO_EXTENSION);
    $mimeTypes = [
        'html' => 'text/html',
        'css'  => 'text/css',
        'js'   => 'application/javascript',
        'json' => 'application/json',
        'png'  => 'image/png',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif'  => 'image/gif',
        'svg'  => 'image/svg+xml',
        'ico'  => 'image/x-icon',
        'woff' => 'font/woff',
        'woff2' => 'font/woff2',
        'ttf'  => 'font/ttf',
        'eot'  => 'application/vnd.ms-fontobject',
        'webp' => 'image/webp',
        'wasm' => 'application/wasm',
    ];
    
    if (isset($mimeTypes[$extension])) {
        header('Content-Type: ' . $mimeTypes[$extension]);
    }
    
    readfile($distFile);
    exit;
}

// === Fichiers statiques legacy (css/, js/ à la racine) ===
$legacyFile = __DIR__ . $relativePath;
if ($relativePath !== '/' && file_exists($legacyFile) && !is_dir($legacyFile)) {
    $extension = pathinfo($legacyFile, PATHINFO_EXTENSION);
    $mimeTypes = [
        'html' => 'text/html',
        'css'  => 'text/css',
        'js'   => 'application/javascript',
        'json' => 'application/json',
        'svg'  => 'image/svg+xml',
    ];
    
    if (isset($mimeTypes[$extension])) {
        header('Content-Type: ' . $mimeTypes[$extension]);
    }
    
    readfile($legacyFile);
    exit;
}

// === SPA FALLBACK ===
// Pour toutes les autres routes, servir dist/index.html
// Cela permet au routeur Vue.js de gérer ses propres routes côté client
$indexFile = __DIR__ . '/dist/index.html';
if (file_exists($indexFile)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile($indexFile);
    exit;
}

// === FALLBACK ULTIME ===
http_response_code(404);
header('Content-Type: text/html; charset=utf-8');
echo '<h1>404 - Page non trouvée</h1>';
echo '<p>Le dossier dist/ est peut-être vide. Lancez <code>npm run build</code> pour générer les fichiers.</p>';