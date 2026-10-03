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

// Color-by-number mode: shapes are drawn back-to-front with a "slot" (color role) per shape.
// These pictures are cached per SUBJECT (not per category) and never mixed with normal coloring pages.
$numbered = !empty($input["numbered"]);
// "custom" = the child typed their own idea (cache per exact subject); otherwise the category cache is used.
$custom = !empty($input["custom"]);
// Category cache policy for numbered pictures: only serve from cache once it holds MORE than 5 pictures,
// and after serving, quietly generate one more in the background so the pool keeps growing.
$minCachedToServe = ($numbered && !$custom) ? 6 : 1;
$refillInBackground = $numbered && !$custom;

// A numbered picture needs enough closed shapes, each with a slot, or the next model is tried.
function numberedLooksValid($img)
{
    if (!is_array($img) || empty($img['paths']) || !is_array($img['paths'])) {
        return false;
    }
    $closed = 0;
    foreach ($img['paths'] as $p) {
        $d = isset($p['d']) ? trim($p['d']) : '';
        if ($d !== '' && preg_match('/[zZ]$/', $d) && !empty($p['slot'])) {
            $closed++;
        }
    }
    return $closed >= 5 && $closed <= 24;
}

// --- Caching Logic ---
$cacheDir = __DIR__ . '/cache';
if (!is_dir($cacheDir)) {
    @mkdir($cacheDir, 0777, true);
}

$cacheKey = $numbered ? ('num_' . substr($custom ? $subject : $category, 0, 60)) : $category;
$safeSubject = preg_replace('/[^a-zA-Z0-9_-]/', '_', strtolower($cacheKey));
$cacheFile = $cacheDir . '/' . $safeSubject . '.json';
$servedFromCache = false;

// If cache has at least 1 image, randomly serve from cache for instant response (<200ms)
if (file_exists($cacheFile)) {
    $cacheContent = @file_get_contents($cacheFile);
    $cacheData = json_decode($cacheContent, true);
    if (is_array($cacheData) && count($cacheData) >= $minCachedToServe) {
        $randomIndex = array_rand($cacheData);
        $selectedImage = $cacheData[$randomIndex];
        if (isset($selectedImage['paths']) && is_array($selectedImage['paths'])) {
            logApiCall("Coloring page served from cache (Gemini)", ["subject" => $subject, "category" => $category, "numbered" => $numbered]);
            $cachedBody = json_encode($selectedImage);
            if ($refillInBackground) {
                // Tell the browser the response is complete so it doesn't wait for the background work below
                header('Content-Length: ' . strlen($cachedBody));
                header('Connection: close');
            }
            echo $cachedBody;
            $servedFromCache = true;

            // Queue a task for the cron job to add more variations in the background
            // (not for numbered pictures: the queue worker only builds normal coloring pages)
            if (!$numbered) {
                $queueDir = __DIR__ . '/queue';
                if (!is_dir($queueDir)) {
                    @mkdir($queueDir, 0777, true);
                }
                $queueFile = $queueDir . '/tasks.txt';
                $task = json_encode(["provider" => "gemini", "subject" => $subject, "category" => $category]) . PHP_EOL;
                if (!file_exists($queueFile) || filesize($queueFile) < 500000) {
                    @file_put_contents($queueFile, $task, FILE_APPEND | LOCK_EX);
                }
            }

            if ($refillInBackground) {
                // Send the cached picture now, close the connection, then keep going below to
                // generate one more picture and add it to the category cache.
                if (function_exists('fastcgi_finish_request')) {
                    fastcgi_finish_request();
                } elseif (function_exists('litespeed_finish_request')) {
                    litespeed_finish_request();
                } else {
                    while (ob_get_level() > 0) {
                        @ob_end_flush();
                    }
                    @flush();
                }
            } else {
                exit;
            }
        }
    }
}

// If fetching live, queue a backup task in case request gets interrupted
if (!$numbered) {
    $queueDir = __DIR__ . '/queue';
    if (!is_dir($queueDir)) {
        @mkdir($queueDir, 0777, true);
    }
    $queueFile = $queueDir . '/tasks.txt';
    $task = json_encode(["provider" => "gemini", "subject" => $subject, "category" => $category]) . PHP_EOL;
    if (!file_exists($queueFile) || filesize($queueFile) < 500000) {
        @file_put_contents($queueFile, $task, FILE_APPEND | LOCK_EX);
    }
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

$prompt = "You are an expert children's coloring book illustrator.
Create a delightful, cute, professional vector line-art drawing of: {$subject}.

CRITICAL STYLE REQUIREMENTS:
- Target audience: Children ages 3 to 8.
- Style: Cute, clean, cartoon storybook line art with friendly shapes.
- Lines: Bold, smooth, continuous black outlines (strokeWidth 3 to 4).
- Structure: 8 to 25 distinct, closed SVG paths representing individual parts (e.g. body, head, features, background elements, stars/clouds).
- Coloring friendliness: Every path must be a clean, enclosed shape with a spacious open interior that a child can tap and fill with color.
- STRICT PROHIBITIONS:
  * NO solid black fills or dark backgrounds.
  * NO cross-hatching, shading, gradients, or sketchy pencil textures.
  * The entire drawing must be pure black outlines on a clean open canvas.
- Ensure every path is a closed loop ending with 'Z'.

Return ONLY a valid JSON object matching:
{
  \"viewBox\": \"0 0 500 500\",
  \"paths\": [
    { \"id\": \"meaningful-part-name\", \"d\": \"SVG_PATH_DATA\", \"stroke\": \"#000000\", \"strokeWidth\": 3 }
  ]
}";

if ($numbered) {
    $prompt = "You are designing a COLOR-BY-NUMBER page for children ages 3 to 7. Subject: {$subject}.
Build the picture from 8 to 16 BIG, simple, closed SVG shapes, like cut-out paper pieces. Use viewBox \"0 0 1000 1000\".

RULES:
- Draw BACK TO FRONT. The first shape is the full background: \"M 40,40 L 960,40 L 960,960 L 40,960 Z\". Later shapes are painted on top of earlier ones and MAY overlap (a head over a body, a wheel over a car). The child colors the visible part of each shape, so never try to cut holes.
- Every shape is ONE closed path ending in Z, made of smooth simple curves or straight lines (at most about 12 commands). No tiny details: every shape must stay at least 60 x 60 units after overlaps. No thin strips, no lines, no whiskers, no hair, no text, no numbers.
- Give every shape a 'slot': a short lowercase word for its role (body, head, ear, eye, nose, wing, petal, wheel, sky, water, grass, sand, sun, cloud...). Shapes that should naturally share one color (both ears, all petals, both wheels) MUST share the same slot. Use 4 to 9 different slots in total.
- Use slot 'sky', 'water' or 'bg' for the background, 'grass' or 'sand' for the ground, 'sun' for a sun, and 'eye' for dark pupils.
- Center the main subject and fill about 60 percent of the frame.

EXAMPLE (a fish):
{\"viewBox\":\"0 0 1000 1000\",\"paths\":[
{\"id\":\"background\",\"slot\":\"water\",\"d\":\"M 40,40 L 960,40 L 960,960 L 40,960 Z\"},
{\"id\":\"tail\",\"slot\":\"fin\",\"d\":\"M 640,500 L 900,340 L 900,660 Z\"},
{\"id\":\"top-fin\",\"slot\":\"fin\",\"d\":\"M 380,350 C 410,210 540,210 560,340 Z\"},
{\"id\":\"body\",\"slot\":\"body\",\"d\":\"M 120,500 C 220,280 560,260 720,500 C 560,740 220,720 120,500 Z\"},
{\"id\":\"eye\",\"slot\":\"eye\",\"d\":\"M 222,450 a 38,38 0 1,0 76,0 a 38,38 0 1,0 -76,0 Z\"}
]}

Return ONLY a valid JSON object like the example: {\"viewBox\": ..., \"paths\": [{\"id\", \"slot\", \"d\"}]}.";
}

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
                            "slot" => ["type" => "STRING"],
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

// Active Gemini models with progressive fallback (fastest, production-ready models first)
$modelsToTry = [
    'gemini-flash-lite-latest',
    'gemini-3.1-flash-lite',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-3.6-flash',
    'gemini-3.8-flash'
];

$successfulResponse = null;
$lastHttpCode = 0;
$lastError = "";

foreach ($modelsToTry as $model) {
    $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . urlencode($apiKey);

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 20);
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
        $rawText = null;

        // Search through candidate parts for the JSON string
        if (!empty($result["candidates"][0]["content"]["parts"])) {
            foreach ($result["candidates"][0]["content"]["parts"] as $part) {
                if (!empty($part["text"])) {
                    $candidateText = trim($part["text"]);
                    if (strpos($candidateText, '{') !== false) {
                        $rawText = $candidateText;
                        break;
                    } elseif (!$rawText) {
                        $rawText = $candidateText;
                    }
                }
            }
        }

        if ($rawText) {
            // Strip markdown code fences if present (e.g. ```json ... ```)
            $cleanJson = trim($rawText);
            if (preg_match('/^```(?:json)?\s*(.*?)\s*```$/is', $cleanJson, $matches)) {
                $cleanJson = trim($matches[1]);
            } else if (preg_match('/\{[\s\S]*\}/', $cleanJson, $matches)) {
                $cleanJson = trim($matches[0]);
            }

            $parsedImage = json_decode($cleanJson, true);
            if (is_array($parsedImage) && !empty($parsedImage['paths']) && (!$numbered || numberedLooksValid($parsedImage))) {
                $successfulResponse = $parsedImage;
                break; // Successfully generated!
            }
        }
    } else {
        $errorResult = json_decode($response, true);
        $errMsg = $errorResult["error"]["message"] ?? "HTTP $lastHttpCode";
        $lastError = "Model $model failed: $errMsg";
        logApiError($lastError, $subject, $lastHttpCode > 0 ? $lastHttpCode : 500);
    }
}

if (!$successfulResponse) {
    $statusToSet = $lastHttpCode > 0 ? $lastHttpCode : 500;
    http_response_code($statusToSet);
    logApiError("All Gemini models failed for subject: $subject. Last error: $lastError", $subject, $statusToSet);
    if (!$servedFromCache) {
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
    $entry = [
        'id' => !empty($p['id']) ? strval($p['id']) : 'part-' . ($index + 1),
        'd' => $d,
        'fill' => '#FFFFFF',
        'stroke' => !empty($p['stroke']) ? strval($p['stroke']) : '#000000',
        'strokeWidth' => !empty($p['strokeWidth']) ? floatval($p['strokeWidth']) : 3
    ];
    if ($numbered) {
        $entry['slot'] = !empty($p['slot']) ? strtolower(preg_replace('/[^a-zA-Z0-9_-]/', '', strval($p['slot']))) : 'part';
        $entry['strokeWidth'] = 6;
    }
    $sanitizedPaths[] = $entry;
}

$finalOutput = [
    'viewBox' => $successfulResponse['viewBox'] ?? ($numbered ? '0 0 1000 1000' : '0 0 500 500'),
    'paths' => $sanitizedPaths
];
if ($numbered) {
    $finalOutput['numbered'] = true;
}

// Save to cache
if (!empty($sanitizedPaths)) {
    $cacheData = [];
    if (file_exists($cacheFile)) {
        $existingCache = json_decode(@file_get_contents($cacheFile), true);
        if (is_array($existingCache)) {
            $cacheData = $existingCache;
        }
    }

    $cacheLimit = $numbered ? 24 : 30; // keep the latest N pictures per cache file
    if (count($cacheData) >= $cacheLimit) {
        array_shift($cacheData); // Keep latest N
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

// Return clean JSON (skipped when a cached picture was already sent and this run was only refilling the cache)
if (!$servedFromCache) {
    http_response_code(200);
    echo json_encode($finalOutput, JSON_UNESCAPED_SLASHES);
}