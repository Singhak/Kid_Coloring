<?php
/**
 * Coloro - tolerant .env reader.
 *
 * parse_ini_file() returns false for the WHOLE file when any one line is not valid INI
 * (for example a "#" comment containing parentheses or quotes), which silently makes every
 * setting look missing. This reader goes line by line, so one odd line cannot hide the rest.
 */

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'env-helper.php') {
    http_response_code(403);
    exit;
}

if (!function_exists('coloroParseEnvFile')) {
    /** @return array<string,string> */
    function coloroParseEnvFile(string $path): array
    {
        $vars = [];
        if (!is_readable($path)) return $vars;
        $lines = @file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
        foreach ($lines as $line) {
            $line = trim(ltrim($line, "\xEF\xBB\xBF")); // BOM, whitespace
            if ($line === '' || $line[0] === '#' || $line[0] === ';') continue;
            $eq = strpos($line, '=');
            if ($eq === false) continue;
            $key = trim(substr($line, 0, $eq));
            if ($key === '' || !preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/', $key)) continue;
            $val = trim(substr($line, $eq + 1));
            if ($val !== '' && $val[0] !== '"' && $val[0] !== "'") {
                $comment = strpos($val, ' #'); // inline comment on unquoted values
                if ($comment !== false) $val = rtrim(substr($val, 0, $comment));
            }
            if (strlen($val) >= 2 && ($val[0] === '"' || $val[0] === "'") && substr($val, -1) === $val[0]) {
                $val = substr($val, 1, -1);
            }
            $vars[$key] = $val;
        }
        return $vars;
    }
}

if (!function_exists('coloroLoadEnv')) {
    /**
     * Merge every .env found next to the API (api/.env wins over the parent folders).
     * @return array<string,string>
     */
    function coloroLoadEnv(): array
    {
        $env = [];
        foreach ([dirname(__DIR__) . '/.env', __DIR__ . '/../.env', __DIR__ . '/.env'] as $path) {
            $env = array_merge($env, coloroParseEnvFile($path));
        }
        return $env;
    }
}
