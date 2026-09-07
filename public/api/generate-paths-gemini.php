<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Max-Age: 86400");

// --- Background Processing Settings ---
ignore_user_abort(true);
set_time_limit(120);

// Handle CORS Preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Allow POST only
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed. Use POST."]);
    exit;
}

// Helper function for error logging
function logApiError($message, $subject = 'unknown')
{
    $logFile = __DIR__ . '/api_error.log';
    $timestamp = date("Y-m-d H:i:s");
    $entry = "[$timestamp] [Gemini - Subject: " . strval($subject) . "] " . (is_string($message) ? $message : json_encode($message)) . PHP_EOL;
    @file_put_contents($logFile, $entry, FILE_APPEND | LOCK_EX);
}

// Robust custom .env parser that doesn't rely on parse_ini_file
function loadEnv($path = __DIR__ . '/.env')
{
    $vars = [];
    if (file_exists($path) && is_readable($path)) {
        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || strpos($line, '#') === 0)
                continue;
            if (strpos($line, '=') !== false) {
                list($name, $value) = explode('=', $line, 2);
                $name = trim($name);
                $value = trim($value, " \t\n\r\0\x0B\"'");
                $vars[$name] = $value;
                if (!getenv($name)) {
                    putenv("$name=$value");
                }
            }
        }
    }
    return $vars;
}

// Get JSON input
$rawInput = file_get_contents("php://input");
$input = json_decode($rawInput, true);

if (!is_array($input)) {
    // Fallback to $_POST if sent as form-data
    $input = $_POST;
}

$subject = $input["subject"] ?? null;
$category = $input["category"] ?? $subject ?? 'animal';

if (!$subject || trim($subject) === '') {
    logApiError("Subject is required. Received input: " . $rawInput, null);
    http_response_code(400);
    echo json_encode(["error" => "Subject is required"]);
    exit;
}

$subject = trim($subject);
$category = trim($category);

// --- Caching Logic ---
$cacheDir = __DIR__ . '/cache';
if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0777, true);
}

$safeSubject = preg_replace('/[^a-zA-Z0-9_-]/', '_', strtolower($category));
$cacheFile = $cacheDir . '/' . $safeSubject . '.json';
$servedFromCache = false;

// If cache has at least 1 image, randomly serve from cache for instant response (<200ms)
if (file_exists($cacheFile)) {
    $cacheContent = @file_get_contents($cacheFile);
    $cacheData = json_decode($cacheContent, true);
    if (is_array($cacheData) && count($cacheData) >= 1) {
        $randomIndex = array_rand($cacheData);
        $selectedImage = $cacheData[$randomIndex];
        if (isset($selectedImage['paths']) && is_array($selectedImage['paths'])) {
            echo json_encode($selectedImage);
            $servedFromCache = true;

            // Queue a task for the cron job to add more variations in the background
            $queueDir = __DIR__ . '/queue';
            if (!is_dir($queueDir)) {
                @mkdir($queueDir, 0777, true);
            }
            $queueFile = $queueDir . '/tasks.txt';
            $task = json_encode(["provider" => "gemini", "subject" => $subject, "category" => $category]) . PHP_EOL;
            @file_put_contents($queueFile, $task, FILE_APPEND | LOCK_EX);

            exit;
        }
    }
}

// If fetching live, queue a backup task in case request gets interrupted
$queueDir = __DIR__ . '/queue';
if (!is_dir($queueDir)) {
    @mkdir($queueDir, 0777, true);
}
$queueFile = $queueDir . '/tasks.txt';
$task = json_encode(["provider" => "gemini", "subject" => $subject, "category" => $category]) . PHP_EOL;
@file_put_contents($queueFile, $task, FILE_APPEND | LOCK_EX);

// Load API key securely
$env = loadEnv();
$apiKey = $env['GEMINI_API_KEY']
    ?? $env['API_KEY']
    ?? $env['GOOGLE_API_KEY']
    ?? getenv("GEMINI_API_KEY")
    ?? getenv("API_KEY")
    ?? getenv("GOOGLE_API_KEY");

if (!$apiKey) {
    logApiError("GEMINI_API_KEY is not configured on the server.", $subject);
    if (!$servedFromCache) {
        http_response_code(500);
        echo json_encode(["error" => "GEMINI_API_KEY is not configured on the server."]);
    }
    exit;
}

$prompt = "Generate a simple, bold line art SVG of a {$subject} for a kids' coloring book.
The SVG must consist of multiple distinct closed paths (parts of the body, background, features) so each part can be filled with color.
The drawing must have clear outlines, suitable for children ages 3-8 to color.
Return ONLY a valid JSON object with this exact structure:
{
  \"viewBox\": \"0 0 500 500\",
  \"paths\": [
    { \"id\": \"part-name\", \"d\": \"SVG_PATH_DATA\", \"stroke\": \"#000000\", \"strokeWidth\": 3 }
  ]
}
Ensure all paths are closed (end with Z). Do not include fill colors.";

// Prepare request payload targeting Gemini API schema
$requestData = [
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
                "viewBox" => ["type" => "STRING"],
                "paths" => [
                    "type" => "ARRAY",
                    "items" => [
                        "type" => "OBJECT",
                        "properties" => [
                            "id" => ["type" => "STRING"],
                            "d" => ["type" => "STRING"],
                            "stroke" => ["type" => "STRING"],
                            "strokeWidth" => ["type" => "NUMBER"]
                        ],
                        "required" => ["id", "d"]
                    ]
                ]
            ],
            "required" => ["viewBox", "paths"]
        ]
    ]
];

// Active Gemini models with progressive fallback (latest LLM versions)
$modelsToTry = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash',
    'gemini-1.5-pro'
];

$successfulResponse = null;
$lastHttpCode = 0;
$lastError = "";

foreach ($modelsToTry as $model) {
    $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . urlencode($apiKey);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 40);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Content-Type: application/json",
        "Referer: https://kidcolor.storywalla.com"
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestData));

    $response = curl_exec($ch);
    $lastHttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($curlErr) {
        $lastError = "cURL Error on model $model: " . $curlErr;
        logApiError($lastError, $subject);
        continue;
    }

    if ($lastHttpCode === 200 && $response) {
        $result = json_decode($response, true);
        $rawText = $result["candidates"][0]["content"]["parts"][0]["text"] ?? null;

        if ($rawText) {
            // Strip markdown code fences if present (e.g. ```json ... ```)
            $cleanJson = trim($rawText);
            if (preg_match('/^```(?:json)?\s*(.*?)\s*```$/is', $cleanJson, $matches)) {
                $cleanJson = trim($matches[1]);
            } else if (preg_match('/\{[\s\S]*\}/', $cleanJson, $matches)) {
                $cleanJson = trim($matches[0]);
            }

            $parsedImage = json_decode($cleanJson, true);
            if (is_array($parsedImage) && !empty($parsedImage['paths'])) {
                $successfulResponse = $parsedImage;
                break; // Successfully generated!
            }
        }
    } else {
        $errorResult = json_decode($response, true);
        $errMsg = $errorResult["error"]["message"] ?? "HTTP $lastHttpCode";
        $lastError = "Model $model failed: $errMsg";
        logApiError($lastError, $subject);
    }
}

if (!$successfulResponse) {
    logApiError("All Gemini models failed for subject: $subject. Last error: $lastError", $subject);
    if (!$servedFromCache) {
        http_response_code($lastHttpCode > 0 ? $lastHttpCode : 500);
        echo json_encode(["error" => $lastError ?: "Failed to generate AI drawing."]);
    }
    exit;
}

// Sanitize paths
$sanitizedPaths = [];
foreach ($successfulResponse['paths'] as $index => $p) {
    if (empty($p['d']))
        continue;
    $d = trim($p['d']);
    $sanitizedPaths[] = [
        'id' => !empty($p['id']) ? strval($p['id']) : 'part-' . ($index + 1),
        'd' => $d,
        'fill' => '#FFFFFF',
        'stroke' => !empty($p['stroke']) ? strval($p['stroke']) : '#000000',
        'strokeWidth' => !empty($p['strokeWidth']) ? floatval($p['strokeWidth']) : 3
    ];
}

$finalOutput = [
    'viewBox' => $successfulResponse['viewBox'] ?? '0 0 500 500',
    'paths' => $sanitizedPaths
];

// Save to cache
if (!empty($sanitizedPaths)) {
    $cacheData = [];
    if (file_exists($cacheFile)) {
        $existingCache = json_decode(@file_get_contents($cacheFile), true);
        if (is_array($existingCache)) {
            $cacheData = $existingCache;
        }
    }

    if (count($cacheData) >= 30) {
        array_shift($cacheData); // Keep latest 30
    }

    $cacheData[] = $finalOutput;
    @file_put_contents($cacheFile, json_encode($cacheData, JSON_UNESCAPED_SLASHES), LOCK_EX);
    logApiError("Saved new image to cache for '$subject'. Total cached: " . count($cacheData), $subject);
}

// Return clean JSON
http_response_code(200);
echo json_encode($finalOutput, JSON_UNESCAPED_SLASHES);