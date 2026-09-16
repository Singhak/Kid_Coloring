<?php
/**
 * Auto Community Art Publisher for Pinterest Integration
 * Silently saves user-colored artworks (from AI or static templates)
 * and injects them into the Pinterest RSS Auto-Publish Feed.
 *
 * Endpoint: POST /api/publish-community-art.php
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (empty($data) || empty($data['imageData'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing imageData payload']);
    exit;
}

$imageData = $data['imageData'];
$category = preg_replace('/[^a-zA-Z0-9_-]/', '', $data['category'] ?? 'animal');
$templateName = trim($data['templateName'] ?? 'Magical Coloring Artwork');
$isAi = !empty($data['isAi']);

// Clean up base64 image data
if (strpos($imageData, ',') !== false) {
    $parts = explode(',', $imageData);
    $imageData = $parts[1];
}

$decodedImage = base64_decode($imageData);
if (!$decodedImage) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid image base64']);
    exit;
}

// Storage directory
$storageDir = __DIR__ . '/../community-pins';
if (!is_dir($storageDir)) {
    @mkdir($storageDir, 0777, true);
}
@chmod($storageDir, 0777);

// Generate unique filename
$timestamp = time();
$randomHash = substr(md5(uniqid('', true)), 0, 6);
$filename = "user-art-{$timestamp}-{$randomHash}.png";
$filePath = $storageDir . '/' . $filename;

// Save PNG file to server
if (file_put_contents($filePath, $decodedImage) === false) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Failed to save image to ' . $filePath]);
    exit;
}
@chmod($filePath, 0644);

$baseUrl = 'https://coloro.in';
$publicImageUrl = "{$baseUrl}/community-pins/{$filename}";
$destinationUrl = "{$baseUrl}/?category={$category}";

// Title & SEO description
$categoryLabel = ucfirst($category);
$title = "Color by Kids: {$templateName} ({$categoryLabel}) | Coloro";
if (strlen($title) > 95) {
    $title = substr($title, 0, 92) . '...';
}

$description = "Check out this wonderful {$templateName} artwork colored live by a kid on Coloro.in! Download the free printable coloring sheet or paint online with glitter brushes and fun sounds at {$destinationUrl}. #colorbykids #kidsart #coloringpages #artforkids #preschoolactivities";

// Update Community Manifest
$manifestFile = $storageDir . '/manifest.json';
$manifest = ['pins' => []];

if (file_exists($manifestFile)) {
    $existing = json_decode(file_get_contents($manifestFile), true);
    if (!empty($existing['pins'])) {
        $manifest['pins'] = $existing['pins'];
    }
}

// Extract visitor identifier to distinguish between different users
$visitorId = preg_replace('/[^a-zA-Z0-9_-]/', '', $data['visitorId'] ?? 'guest');
$userScope = ($visitorId && $visitorId !== 'guest') 
    ? $visitorId 
    : substr(md5($_SERVER['REMOTE_ADDR'] ?? 'guest'), 0, 10);

// Normalize template identifier key scoped to this user (e.g. "vis_123_juicy purple grapes_fruits")
$templateKey = $userScope . '_' . strtolower(trim($templateName)) . '_' . strtolower($category);

// Clean up existing / previous version of the same template for THIS specific user in manifest to replace it
$filteredPins = [];
foreach ($manifest['pins'] as $existingPin) {
    $existingKey = $existingPin['templateKey'] ?? '';
    $isSameUserTemplate = ($existingKey === $templateKey);
    
    if ($isSameUserTemplate) {
        // Delete old image file from disk to prevent orphaned files
        if (!empty($existingPin['filename'])) {
            $oldFile = $storageDir . '/' . $existingPin['filename'];
            if (file_exists($oldFile) && $existingPin['filename'] !== $filename) {
                @unlink($oldFile);
            }
        }
    } else {
        $filteredPins[] = $existingPin;
    }
}
$manifest['pins'] = $filteredPins;

// Prepend the new updated artwork to the top of the feed
array_unshift($manifest['pins'], [
    'id' => "user-{$timestamp}-{$randomHash}",
    'title' => $title,
    'description' => $description,
    'templateName' => $templateName,
    'templateKey' => $templateKey,
    'category' => $category,
    'categoryLabel' => $categoryLabel,
    'destinationUrl' => $destinationUrl,
    'imageUrl' => $publicImageUrl,
    'filename' => $filename,
    'publishedAt' => date('Y-m-d H:i:s'),
    'isCommunity' => true
]);

// Keep latest 250 community pins
if (count($manifest['pins']) > 250) {
    $removed = array_splice($manifest['pins'], 250);
    foreach ($removed as $oldPin) {
        if (!empty($oldPin['filename'])) {
            $oldFile = $storageDir . '/' . $oldPin['filename'];
            if (file_exists($oldFile)) {
                @unlink($oldFile);
            }
        }
    }
}

file_put_contents($manifestFile, json_encode($manifest, JSON_PRETTY_PRINT));

echo json_encode([
    'success' => true,
    'message' => 'Artwork silently saved and queued for Pinterest auto-publish',
    'imageUrl' => $publicImageUrl,
    'destinationUrl' => $destinationUrl
]);
