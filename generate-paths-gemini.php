<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); // Adjust for production security
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// --- Background Processing Settings ---
// Allow script to continue running even if the frontend aborts/times out
ignore_user_abort(true);
set_time_limit(120); // Give the AI up to 2 minutes to respond behind the scenes

// Handle CORS Preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Allow POST only
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

// Helper function for error logging
function logApiError($message, $subject) {
    $logFile = __DIR__ . '/api_error.log';
    $timestamp = date("Y-m-d H:i:s");
    file_put_contents($logFile, "[$timestamp] [Subject: $subject] " . print_r($message, true) . PHP_EOL, FILE_APPEND);
}

// Get JSON input
$input = json_decode(file_get_contents("php://input"), true);
$subject = $input["subject"] ?? null;
$category = $input["category"] ?? $subject; // Fallback to subject if category isn't provided

if (!$subject) {
    logApiError("Subject is required.", null);
    http_response_code(400);
    echo json_encode(["error" => "Subject is required"]);
    exit;
}

// --- Caching Logic ---
$cacheDir = __DIR__ . '/cache';
if (!is_dir($cacheDir)) {
    mkdir($cacheDir, 0777, true);
}

$safeSubject = preg_replace('/[^a-zA-Z0-9_-]/', '_', strtolower($category));
$cacheFile = $cacheDir . '/' . $safeSubject . '.json';
$servedFromCache = false;

if (file_exists($cacheFile)) {
    $cacheData = json_decode(file_get_contents($cacheFile), true);
    if (is_array($cacheData) && count($cacheData) > 1) {
        $randomIndex = array_rand($cacheData);
        echo json_encode($cacheData[$randomIndex]);
        $servedFromCache = true;
        
        // Queue a task for the cron job instead of FastCGI
        $queueDir = __DIR__ . '/queue';
        if (!is_dir($queueDir)) {
            mkdir($queueDir, 0777, true);
        }
        $queueFile = $queueDir . '/tasks.txt';
        $task = json_encode(["provider" => "gemini", "subject" => $subject, "category" => $category]) . PHP_EOL;
        file_put_contents($queueFile, $task, FILE_APPEND | LOCK_EX);
        
        exit; // Exit immediately so the user gets the image without waiting
    }
}

// If we are fetching live, queue a backup task just in case the frontend times out
// and Hostinger kills this script before the API responds.
$queueDir = __DIR__ . '/queue';
if (!is_dir($queueDir)) {
    mkdir($queueDir, 0777, true);
}
$queueFile = $queueDir . '/tasks.txt';
$task = json_encode(["provider" => "openrouter", "subject" => $subject, "category" => $category]) . PHP_EOL;
file_put_contents($queueFile, $task, FILE_APPEND | LOCK_EX);

// Load API key securely from .env file
$env = file_exists(__DIR__ . '/.env') ? parse_ini_file(__DIR__ . '/.env') : [];
$apiKey = $env['GEMINI_API_KEY'] ?? getenv("GEMINI_API_KEY");

if (!$apiKey) {
    logApiError("GEMINI_API_KEY is not configured on the server.", $subject);
    if (!$servedFromCache) {
        http_response_code(500);
        echo json_encode(["error" => "GEMINI_API_KEY is not configured on the server."]);
    }
    exit;
}

$prompt = "Generate a simple, bold line art SVG of a {$subject} for a kids' coloring book.\nThe SVG should consist of multiple closed paths so they can be filled with color.\nThe drawing should be clear and easy for a child to color.\nReturn ONLY a JSON object with the following structure:\n{\n  \"viewBox\": \"0 0 500 500\",\n  \"paths\": [\n    { \"id\": \"part-name\", \"d\": \"SVG_PATH_DATA\" }\n  ]\n}\nEnsure all paths are closed (end with Z). Do not include any fill colors in the paths.";

// Prepare request body targeting Gemini's REST API Schema constraints
$data = [
    "contents" => [
        [
            "parts" => [
                ["text" => $prompt]
            ]
        ]
    ],
    "generationConfig" => [
        "responseMimeType" => "application/json",
        "responseSchema" => [
            "type" => "OBJECT",
            "properties" => [
                "viewBox" => [ "type" => "STRING" ],
                "paths" => [
                    "type" => "ARRAY",
                    "items" => [
                        "type" => "OBJECT",
                        "properties" => [
                            "id" => [ "type" => "STRING" ],
                            "d" => [ "type" => "STRING" ],
                            "stroke" => [ "type" => "STRING" ],
                            "strokeWidth" => [ "type" => "NUMBER" ]
                        ],
                        "required" => ["id", "d"]
                    ]
                ]
            ],
            "required" => ["viewBox", "paths"]
        ]
    ]
];

// Initialize cURL for Google Generative AI REST API
$model = "gemini-3-flash-preview"; // Update to your desired model, e.g., gemini-1.5-flash
$url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . $apiKey;

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Content-Type: application/json",
    "HTTP-Referer: https://kidcolor.storywalla.com"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    logApiError("cURL Error: " . curl_error($ch), $subject);
    if (!$servedFromCache) {
        http_response_code(500);
        echo json_encode(["error" => curl_error($ch)]);
    }
    curl_close($ch);
    exit;
}

curl_close($ch);

$result = json_decode($response, true);

if ($httpCode !== 200) {
    $errMsg = $result["error"]["message"] ?? "Gemini API error";
    logApiError("HTTP $httpCode - $errMsg", $subject);
    if (!$servedFromCache) {
        http_response_code($httpCode);
        echo json_encode(["error" => $errMsg]);
    }
    exit;
}

$content = $result["candidates"][0]["content"]["parts"][0]["text"] ?? null;

if (!$content) {
    logApiError("Invalid AI response. Full response: " . $response, $subject);
    if (!$servedFromCache) {
        http_response_code(500);
        echo json_encode(["error" => "Invalid AI response"]);
    }
    exit;
}

// Save newly generated AI image into the respective subject's cache file
$newImage = json_decode($content, true);
if ($newImage && isset($newImage['paths'])) {
    $cacheData = [];
    if (file_exists($cacheFile)) {
        $fileData = json_decode(file_get_contents($cacheFile), true);
        if (is_array($fileData)) {
            $cacheData = $fileData;
        }
    }
    
    if (count($cacheData) >= 30) {
        array_shift($cacheData); // Prevent the cache file from growing infinitely
    }
    
    $cacheData[] = $newImage;
    logApiError("Generated new image and saving to cache. Cache size: " . count($cacheData), $subject); 
    file_put_contents($cacheFile, json_encode($cacheData), LOCK_EX);
}

// If we haven't already returned a cached response, return the generated JSON
if (!$servedFromCache) {
    http_response_code($httpCode);
    echo $content;
}