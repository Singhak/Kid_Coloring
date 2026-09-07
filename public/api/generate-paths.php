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
    $entry = "[$timestamp] [OpenRouter - Subject: " . strval($subject) . "] " . (is_string($message) ? $message : json_encode($message)) . PHP_EOL;
    @file_put_contents($logFile, $entry, FILE_APPEND | LOCK_EX);
}

// Robust custom .env parser
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
    $input = $_POST;
}

$subject = $input["subject"] ?? null;
$category = $input["category"] ?? $subject ?? 'animal';

if (!$subject || trim($subject) === '') {
    logApiError("Subject is required. Received: " . $rawInput, null);
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

// If cache has at least 1 image, serve immediately
if (file_exists($cacheFile)) {
    $cacheContent = @file_get_contents($cacheFile);
    $cacheData = json_decode($cacheContent, true);
    if (is_array($cacheData) && count($cacheData) >= 1) {
        $randomIndex = array_rand($cacheData);
        $selectedImage = $cacheData[$randomIndex];
        if (isset($selectedImage['paths']) && is_array($selectedImage['paths'])) {
            echo json_encode($selectedImage);
            $servedFromCache = true;

            // Queue background cron task
            $queueDir = __DIR__ . '/queue';
            if (!is_dir($queueDir)) {
                @mkdir($queueDir, 0777, true);
            }
            $queueFile = $queueDir . '/tasks.txt';
            $task = json_encode(["provider" => "openrouter", "subject" => $subject, "category" => $category]) . PHP_EOL;
            @file_put_contents($queueFile, $task, FILE_APPEND | LOCK_EX);

            exit;
        }
    }
}

// Queue backup task
$queueDir = __DIR__ . '/queue';
if (!is_dir($queueDir)) {
    @mkdir($queueDir, 0777, true);
}
$queueFile = $queueDir . '/tasks.txt';
$task = json_encode(["provider" => "openrouter", "subject" => $subject, "category" => $category]) . PHP_EOL;
@file_put_contents($queueFile, $task, FILE_APPEND | LOCK_EX);

// Load API keys
$env = loadEnv();
$openRouterApiKey = $env['OPENROUTER_API_KEY'] ?? getenv("OPENROUTER_API_KEY");
$geminiApiKey = $env['GEMINI_API_KEY'] ?? $env['API_KEY'] ?? $env['GOOGLE_API_KEY'] ?? getenv("GEMINI_API_KEY") ?? getenv("API_KEY") ?? getenv("GOOGLE_API_KEY");

$finalOutput = null;

// Helper: Try OpenRouter
if ($openRouterApiKey) {
    $activeModels = [
        "google/gemini-2.5-flash:free",
        "google/gemini-2.0-flash-exp:free",
        "meta-llama/llama-3.3-70b-instruct:free",
        "mistralai/mistral-small-24b-instruct-2501:free",
        "openai/gpt-4o-mini:free",
        "openrouter/free",
        "openrouter/auto",
    ];

    $prompt = "Generate a simple, bold line art SVG of a {$subject} for a kids' coloring book.
The SVG must consist of multiple distinct closed paths so each part can be filled with color.
The drawing must have clear outlines suitable for children to color.
Return ONLY a valid JSON object with:
{
  \"viewBox\": \"0 0 500 500\",
  \"paths\": [
    { \"id\": \"part-name\", \"d\": \"SVG_PATH_DATA\", \"stroke\": \"#000000\", \"strokeWidth\": 3 }
  ]
}
Ensure all paths are closed (end with Z). Do not include fill colors.";

    $data = [
        "models" => $activeModels,
        "messages" => [
            [
                "role" => "system",
                "content" => "You are a specialized SVG path generator for kids' coloring books. You only output valid JSON with no conversational text."
            ],
            [
                "role" => "user",
                "content" => $prompt
            ]
        ],
        "response_format" => ["type" => "json_object"]
    ];

    $ch = curl_init("https://openrouter.ai/api/v1/chat/completions");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $openRouterApiKey",
        "HTTP-Referer: https://kidcolor.storywalla.com",
        "X-Title: Coloro App",
        "Content-Type: application/json"
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $response) {
        $result = json_decode($response, true);
        $content = $result["choices"][0]["message"]["content"] ?? null;
        if ($content) {
            $cleanJson = trim($content);
            if (preg_match('/^```(?:json)?\s*(.*?)\s*```$/is', $cleanJson, $matches)) {
                $cleanJson = trim($matches[1]);
            } else if (preg_match('/\{[\s\S]*\}/', $cleanJson, $matches)) {
                $cleanJson = trim($matches[0]);
            }
            $parsed = json_decode($cleanJson, true);
            if (is_array($parsed) && !empty($parsed['paths'])) {
                $finalOutput = $parsed;
            }
        }
    } else {
        logApiError("OpenRouter request failed (HTTP $httpCode): " . substr($response, 0, 300), $subject);
    }
}

// Fallback: If OpenRouter failed or no key, try Gemini automatically
if (!$finalOutput && $geminiApiKey) {
    logApiError("OpenRouter unavailable or failed. Falling back to Gemini for subject: $subject", $subject);

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

    $geminiPayload = [
        "contents" => [["parts" => [["text" => $prompt]]]],
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

    $models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
    foreach ($models as $m) {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$m}:generateContent?key=" . urlencode($geminiApiKey);
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 35);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Content-Type: application/json",
            "Referer: https://kidcolor.storywalla.com"
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($geminiPayload));
        $resp = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($code === 200 && $resp) {
            $gResult = json_decode($resp, true);
            $rawText = $gResult["candidates"][0]["content"]["parts"][0]["text"] ?? null;
            if ($rawText) {
                $clean = trim($rawText);
                if (preg_match('/^```(?:json)?\s*(.*?)\s*```$/is', $clean, $matches)) {
                    $clean = trim($matches[1]);
                } else if (preg_match('/\{[\s\S]*\}/', $clean, $matches)) {
                    $clean = trim($matches[0]);
                }
                $parsed = json_decode($clean, true);
                if (is_array($parsed) && !empty($parsed['paths'])) {
                    $finalOutput = $parsed;
                    break;
                }
            }
        }
    }
}

if (!$finalOutput || empty($finalOutput['paths'])) {
    logApiError("All AI path generation providers failed for subject: $subject", $subject);
    if (!$servedFromCache) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to generate AI coloring paths."]);
    }
    exit;
}

// Sanitize paths
$sanitizedPaths = [];
foreach ($finalOutput['paths'] as $index => $p) {
    if (empty($p['d']))
        continue;
    $sanitizedPaths[] = [
        'id' => !empty($p['id']) ? strval($p['id']) : 'part-' . ($index + 1),
        'd' => trim($p['d']),
        'fill' => '#FFFFFF',
        'stroke' => !empty($p['stroke']) ? strval($p['stroke']) : '#000000',
        'strokeWidth' => !empty($p['strokeWidth']) ? floatval($p['strokeWidth']) : 3
    ];
}

$cleanResult = [
    'viewBox' => $finalOutput['viewBox'] ?? '0 0 500 500',
    'paths' => $sanitizedPaths
];

// Save to cache
if (!empty($sanitizedPaths)) {
    $cacheData = [];
    if (file_exists($cacheFile)) {
        $existing = json_decode(@file_get_contents($cacheFile), true);
        if (is_array($existing))
            $cacheData = $existing;
    }
    if (count($cacheData) >= 30)
        array_shift($cacheData);
    $cacheData[] = $cleanResult;
    @file_put_contents($cacheFile, json_encode($cacheData, JSON_UNESCAPED_SLASHES), LOCK_EX);
}

http_response_code(200);
echo json_encode($cleanResult, JSON_UNESCAPED_SLASHES);