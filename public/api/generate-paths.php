<?php
require_once __DIR__ . '/logger.php';
initApiLogging('generate-paths.php');

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
            logApiCall("Coloring page served from cache", ["subject" => $subject, "category" => $category]);
            echo json_encode($selectedImage);
            $servedFromCache = true;

            // Queue background cron task
            $queueDir = __DIR__ . '/queue';
            if (!is_dir($queueDir)) {
                @mkdir($queueDir, 0777, true);
            }
            $queueFile = $queueDir . '/tasks.txt';
            $task = json_encode(["provider" => "openrouter", "subject" => $subject, "category" => $category]) . PHP_EOL;
            if (!file_exists($queueFile) || filesize($queueFile) < 500000) {
                @file_put_contents($queueFile, $task, FILE_APPEND | LOCK_EX);
            }

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
if (!file_exists($queueFile) || filesize($queueFile) < 500000) {
    @file_put_contents($queueFile, $task, FILE_APPEND | LOCK_EX);
}

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
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        "Authorization: Bearer $openRouterApiKey",
        "HTTP-Referer: https://coloro.in",
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
        logApiError("OpenRouter request failed (HTTP $httpCode): " . substr($response, 0, 300), $subject, $httpCode ?: 500);
    }
}

// Fallback: If OpenRouter failed or no key, try Gemini automatically
if (!$finalOutput && $geminiApiKey) {
    logApiCall("OpenRouter unavailable or failed. Falling back to Gemini for subject: $subject", ["subject" => $subject], "NOTICE");

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

    $models = [
        "gemini-flash-lite-latest",
        "gemini-3.1-flash-lite",
        "gemini-3.5-flash-lite",
        "gemini-3.5-flash",
        "gemini-flash-latest",
        "gemini-3.6-flash",
        "gemini-3.8-flash"
    ];

    foreach ($models as $m) {
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$m}:generateContent?key=" . urlencode($geminiApiKey);
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Content-Type: application/json",
            "Referer: https://coloro.in"
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($geminiPayload));
        $resp = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($code === 200 && $resp) {
            $gResult = json_decode($resp, true);
            $rawText = null;

            if (!empty($gResult["candidates"][0]["content"]["parts"])) {
                foreach ($gResult["candidates"][0]["content"]["parts"] as $part) {
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
    http_response_code(500);
    logApiError("All AI path generation providers failed for subject: $subject", $subject, 500);
    if (!$servedFromCache) {
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

logApiCall("Coloring page generated successfully", [
    "subject" => $subject,
    "category" => $category,
    "paths_count" => count($sanitizedPaths)
]);

http_response_code(200);
echo json_encode($cleanResult, JSON_UNESCAPED_SLASHES);