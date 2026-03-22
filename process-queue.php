<?php
/**
 * KidColor Queue Processor
 * This handles background AI generation for Hostinger.
 */

$queueDir = __DIR__ . '/queue';
$queueFile = $queueDir . '/tasks.txt';
$logFile = __DIR__ . '/api_error.log';

// Helper function for cron logging
function logCronError($message, $subject) {
    global $logFile;
    $timestamp = date("Y-m-d H:i:s");
    file_put_contents($logFile, "[$timestamp] [CRON - Subject: $subject] " . print_r($message, true) . PHP_EOL, FILE_APPEND);
}

if (!file_exists($queueFile)) {
    exit; // No queue file means no pending tasks
}

$startTime = time();
$maxExecutionTime = 50; // Run for max 50 seconds to fit within a 1-minute cron schedule

while (time() - $startTime < $maxExecutionTime) {
    $fp = fopen($queueFile, "c+");
    if (!$fp) break;

    // Safely lock the file to prevent conflicts
    if (flock($fp, LOCK_EX)) {
        $lines = file($queueFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        
        if (empty($lines)) {
            flock($fp, LOCK_UN);
            fclose($fp);
            break; // Queue is completely empty
        }

        // Pop the first task off the queue
        $taskJson = array_shift($lines);

        // Save remaining tasks back to the queue file
        ftruncate($fp, 0);
        rewind($fp);
        if (!empty($lines)) {
            fwrite($fp, implode(PHP_EOL, $lines) . PHP_EOL);
        }
        flock($fp, LOCK_UN);
        fclose($fp);

        // Process the extracted task
        $task = json_decode($taskJson, true);
        if ($task) {
            processTask($task);
        }
    } else {
        fclose($fp);
        break; // Could not get lock, we'll try again next minute
    }
    
    // Sleep briefly to avoid tripping rate limiters between requests
    sleep(2);
}

function processTask($task) {
    $provider = $task['provider'] ?? '';
    $subject = $task['subject'] ?? '';
    $category = $task['category'] ?? $subject;

    if (!$subject) return;

    $cacheDir = __DIR__ . '/cache';
    if (!is_dir($cacheDir)) mkdir($cacheDir, 0777, true);
    
    $safeSubject = preg_replace('/[^a-zA-Z0-9_-]/', '_', strtolower($category));
    $cacheFile = $cacheDir . '/' . $safeSubject . '.json';

    if ($provider === 'openrouter') {
        $apiKey = "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";
        $url = "https://openrouter.ai/api/v1/chat/completions";
        $data = [
            "models" => ["nvidia/nemotron-3-super-120b-a12b:free","arcee-ai/trinity-mini:free","openrouter/free"],
            "messages" => [
                ["role" => "system", "content" => "You are a specialized SVG path generator for kids' coloring books. You only output valid JSON."],
                ["role" => "user", "content" => "Generate a simple, bold line art SVG of a {$subject} for a kids' coloring book.\nThe SVG should consist of multiple closed paths so they can be filled with color.\nThe drawing should be clear and easy for a child to color.\nReturn ONLY a JSON object with:\n{\n  \"viewBox\": \"0 0 500 500\",\n  \"paths\": [\n    { \"id\": \"part-name\", \"d\": \"SVG_PATH_DATA\" }\n  ]\n}\nEnsure all paths are closed (end with Z). Do not include fill colors."]
            ],
            "response_format" => ["type" => "json_object"]
        ];
        $headers = [
            "Authorization: Bearer $apiKey",
            "HTTP-Referer: https://kidcolor.storywalla.com",
            "X-Title: KidColor App",
            "Content-Type: application/json"
        ];
    } else if ($provider === 'gemini') {
        $apiKey = "AIzaSyAZqyz7HPmEFPGD-mf5_A6iGHJCgwaA3Yo";
        $model = "gemini-3-flash-preview";
        $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key=" . $apiKey;
        $prompt = "Generate a simple, bold line art SVG of a {$subject} for a kids' coloring book.\nThe SVG should consist of multiple closed paths so they can be filled with color.\nThe drawing should be clear and easy for a child to color.\nReturn ONLY a JSON object with the following structure:\n{\n  \"viewBox\": \"0 0 500 500\",\n  \"paths\": [\n    { \"id\": \"part-name\", \"d\": \"SVG_PATH_DATA\" }\n  ]\n}\nEnsure all paths are closed (end with Z). Do not include any fill colors in the paths.";
        $data = [
            "contents" => [["parts" => [["text" => $prompt]]]],
            "generationConfig" => [
                "responseMimeType" => "application/json",
                "responseSchema" => ["type" => "OBJECT", "properties" => ["viewBox" => [ "type" => "STRING" ], "paths" => ["type" => "ARRAY", "items" => ["type" => "OBJECT", "properties" => ["id" => [ "type" => "STRING" ], "d" => [ "type" => "STRING" ], "stroke" => [ "type" => "STRING" ], "strokeWidth" => [ "type" => "NUMBER" ]], "required" => ["id", "d"]]]], "required" => ["viewBox", "paths"]]
            ]
        ];
        $headers = [
            "Content-Type: application/json",
            "HTTP-Referer: https://kidcolor.storywalla.com"
        ];
    } else {
        return;
    }

    // Make the API request
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    
    $response = curl_exec($ch);
    if (curl_errno($ch)) { logCronError("cURL Error: " . curl_error($ch), $subject); curl_close($ch); return; }
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) return;
    
    $result = json_decode($response, true);
    $content = $provider === 'openrouter' ? ($result["choices"][0]["message"]["content"] ?? null) : ($result["candidates"][0]["content"]["parts"][0]["text"] ?? null);

    if ($content) {
        $newImage = json_decode($content, true);
        if ($newImage && isset($newImage['paths'])) {
            $cacheData = [];
            if (file_exists($cacheFile)) { $fileData = json_decode(file_get_contents($cacheFile), true); if (is_array($fileData)) { $cacheData = $fileData; } }
            if (count($cacheData) >= 30) { array_shift($cacheData); }
            $cacheData[] = $newImage;
            file_put_contents($cacheFile, json_encode($cacheData), LOCK_EX);
        }
    }
}