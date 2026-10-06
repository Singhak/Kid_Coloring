<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Cache-Control: private, max-age=3600");
require_once __DIR__ . '/pricing-helper.php';
echo json_encode(pppQuote(pppDetectCountry()));
