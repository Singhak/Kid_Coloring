<?php
/**
 * Coloro Queue Processor
 * Handles background AI generation for Hostinger cron jobs.
 */

require_once __DIR__ . '/logger.php';
initApiLogging('process-queue.php');

$queueDir = __DIR__ . '/queue';
$queueFile = $queueDir . '/tasks.txt';

function loadEnv($path = __DIR__ . '/.env') {
    $vars = [];
    if (file_exists($path) && is_readable($path)) {
        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || strpos($line, '#') === 0) continue;
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

if (!file_exists($queueFile)) {
    exit;
}

$startTime = time();
$maxExecutionTime = 50; // Run for max 50 seconds to fit within a 1-minute cron schedule

while (time() - $startTime < $maxExecutionTime) {
    $fp = fopen($queueFile, "c+");
    if (!$fp) break;

    if (flock($fp, LOCK_EX)) {
        $lines = file($queueFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        if (empty($lines)) {
            flock($fp, LOCK_UN);
            fclose($fp);
            break;
        }

        $taskJson = array_shift($lines);

        ftruncate($fp, 0);
        rewind($fp);
        if (!empty($lines)) {
            fwrite($fp, implode(PHP_EOL, $lines) . PHP_EOL);
        }
        flock($fp, LOCK_UN);
        fclose($fp);

        $task = json_decode($taskJson, true);
        if ($task) {
            logApiCall("CRON: Processing background task", $task);
            processTask($task);
        }
    } else {
        fclose($fp);
        break;
    }
    
    sleep(2);
}

function processTask($task) {
    $provider = $task['provider'] ?? '';
    $subject = $task['subject'] ?? '';
    $category = $task['category'] ?? $subject;

    if (!$subject) return;

    $cacheDir = __DIR__ . '/cache';
    if (!is_dir($cacheDir)) @mkdir($cacheDir, 0777, true);
    
    $safeSubject = preg_replace('/[^a-zA-Z0-9_-]/', '_', strtolower($category));
    $cacheFile = $cacheDir . '/' . $safeSubject . '.json';
    $env = loadEnv();

    $content = null;

    if ($provider === 'openrouter') {
        $apiKey = $env['OPENROUTER_API_KEY'] ?? getenv("OPENROUTER_API_KEY");
        if (!$apiKey) return;

        $url = "https://openrouter.ai/api/v1/chat/completions";
        $data = [
            "models" => [
                "google/gemini-2.0-flash-exp:free",
                "meta-llama/llama-3.3-70b-instruct:free",
                "mistralai/mistral-small-24b-instruct-2501:free",
                "openrouter/auto"
            ],
            "messages" => [
                ["role" => "system", "content" => "You are a specialized SVG path generator for kids' coloring books. Output valid JSON only."],
                ["role" => "user", "content" => "Generate a simple, bold line art SVG of a {$subject} for a kids' coloring book. Return ONLY a JSON object with viewBox and closed paths."]
            ],
            "response_format" => ["type" => "json_object"]
        ];
        
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 40);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Authorization: Bearer $apiKey",
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
        }
    } else { // Gemini (default)
        $apiKey = $env['GEMINI_API_KEY'] ?? $env['API_KEY'] ?? $env['GOOGLE_API_KEY'] ?? getenv("GEMINI_API_KEY") ?? getenv("API_KEY") ?? getenv("GOOGLE_API_KEY");
        if (!$apiKey) return;

        $models = [
            "gemini-flash-lite-latest",
            "gemini-3.1-flash-lite",
            "gemini-3.5-flash-lite",
            "gemini-3.5-flash",
            "gemini-flash-latest",
            "gemini-3.6-flash",
            "gemini-3.8-flash"
        ];
        $prompt = "You are an expert children's coloring book illustrator. Create a delightful, cute, cartoon vector line-art drawing of: {$subject}.\nRequirements: Children ages 3-8, cute storybook style, bold continuous black outlines (strokeWidth 3-4), 8-25 closed paths with spacious interiors for kids to color. STRICTLY NO solid black fills, NO dark backgrounds, NO shading, NO textures. Every path must end with 'Z'. Return JSON: { \"viewBox\": \"0 0 500 500\", \"paths\": [ { \"id\": \"part-name\", \"d\": \"...\", \"stroke\": \"#000000\", \"strokeWidth\": 3 } ] }";
        
        $data = [
            "contents" => [["parts" => [["text" => $prompt]]]],
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

        foreach ($models as $m) {
            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$m}:generateContent?key=" . urlencode($apiKey);
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 20);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "Content-Type: application/json",
                "Referer: https://coloro.in"
            ]);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 200 && $response) {
                $result = json_decode($response, true);
                $rawText = null;
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
                    $content = $rawText;
                    break;
                }
            }
        }
    }

    if ($content) {
        $cleanJson = trim($content);
        if (preg_match('/^```(?:json)?\s*(.*?)\s*```$/is', $cleanJson, $matches)) {
            $cleanJson = trim($matches[1]);
        } else if (preg_match('/\{[\s\S]*\}/', $cleanJson, $matches)) {
            $cleanJson = trim($matches[0]);
        }

        $newImage = json_decode($cleanJson, true);
        if ($newImage && !empty($newImage['paths'])) {
            $cacheData = [];
            if (file_exists($cacheFile)) {
                $fileData = json_decode(@file_get_contents($cacheFile), true);
                if (is_array($fileData)) $cacheData = $fileData;
            }
            if (count($cacheData) >= 30) array_shift($cacheData);
            $cacheData[] = $newImage;
            logApiCall("Generated new image for subject '$subject' and cached it.", ["subject" => $subject]);
            @file_put_contents($cacheFile, json_encode($cacheData, JSON_UNESCAPED_SLASHES), LOCK_EX);
        }
    }
}