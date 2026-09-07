<?php
require_once __DIR__ . '/logger.php';
initApiLogging('generate-paths-gemini.php');

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
    logApiError("Method not allowed. Use POST.", [], 405);
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed. Use POST."]);
    exit;
}

// Lightweight IP Rate Limiter (Max 25 requests per 60s per IP)
function checkIpRateLimit($maxRequests = 25, $windowSeconds = 60)
{
    $ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    $safeIp = preg_replace('/[^a-zA-Z0-9_.-]/', '_', explode(',', $ip)[0]);
    $rateDir = __DIR__ . '/cache/rate_limits';
    if (!is_dir($rateDir)) {
        @mkdir($rateDir, 0755, true);
    }
    $rateFile = $rateDir . '/rl_' . md5($safeIp) . '.json';
    $now = time();
    $data = ['count' => 0, 'start' => $now];

    if (file_exists($rateFile)) {
        $existing = json_decode(@file_get_contents($rateFile), true);
        if (is_array($existing) && isset($existing['start'], $existing['count'])) {
            if ($now - $existing['start'] < $windowSeconds) {
                $data = $existing;
            }
        }
    }

    $data['count']++;
    @file_put_contents($rateFile, json_encode($data), LOCK_EX);

    if ($data['count'] > $maxRequests) {
        logApiError("Rate limit exceeded for IP: " . $ip, ['count' => $data['count']], 429);
        http_response_code(429);
        header('Retry-After: ' . max(1, $windowSeconds - ($now - $data['start'])));
        echo json_encode([
            "error" => "Rate limit exceeded. Please wait a moment before generating more coloring pages."
        ]);
        exit;
    }
}

checkIpRateLimit(25, 60);

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
            logApiCall("Coloring page served from cache (Gemini)", ["subject" => $subject, "category" => $category]);
            echo json_encode($selectedImage);
            $servedFromCache = true;

            // Queue a task for the cron job to add more variations in the background
            $queueDir = __DIR__ . '/queue';
            if (!is_dir($queueDir)) {
                @mkdir($queueDir, 0777, true);
            }
            $queueFile = $queueDir . '/tasks.txt';
            $task = json_encode(["provider" => "gemini", "subject" => $subject, "category" => $category]) . PHP_EOL;
            if (!file_exists($queueFile) || filesize($queueFile) < 500000) {
                @file_put_contents($queueFile, $task, FILE_APPEND | LOCK_EX);
            }

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
if (!file_exists($queueFile) || filesize($queueFile) < 500000) {
    @file_put_contents($queueFile, $task, FILE_APPEND | LOCK_EX);
}

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
        "Referer: https://coloro.in"
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
    logApiCall("Saved new image to cache", ["subject" => $subject, "total_cached" => count($cacheData)]);
}

logApiCall("Gemini coloring page generated successfully", [
    "subject" => $subject,
    "category" => $category,
    "paths_count" => count($finalOutput['paths'] ?? [])
]);

// Return clean JSON
http_response_code(200);
echo json_encode($finalOutput, JSON_UNESCAPED_SLASHES);