<?php
/**
 * Purchasing-power-parity (PPP) pricing for the website checkout.
 * Single source of truth: used by geo-pricing.php (what the UI shows) and
 * create-cashfree-order.php (what is actually charged). The client never sets the amount.
 *
 * India pays INR. Everyone else pays USD according to a tier for their country.
 * USD must be enabled on the Cashfree account (international payments).
 * Keep the Google Play per-country prices in line with the same tiers.
 */

require_once __DIR__ . '/env-helper.php';

/**
 * Master switch, read from the .env file: INTERNATIONAL_PAYMENTS_ENABLED=true|false (default false).
 * Keep it false until international payments (USD) are enabled on the Cashfree account: while off,
 * every visitor is quoted and charged in INR. Set true to charge the regional USD tiers below to
 * visitors outside India.
 */
function pppInternationalEnabled(): bool {
    $v = coloroLoadEnv()['INTERNATIONAL_PAYMENTS_ENABLED']
        ?? $_SERVER['INTERNATIONAL_PAYMENTS_ENABLED']
        ?? getenv('INTERNATIONAL_PAYMENTS_ENABLED')
        ?: 'false';
    return in_array(strtolower(trim((string)$v)), ['1', 'true', 'yes', 'on'], true);
}

const PPP_TIERS = [
    1 => ['currency' => 'USD', 'monthly' => 1.99, 'annual' => 7.99],  // high income
    2 => ['currency' => 'USD', 'monthly' => 0.99, 'annual' => 3.99],  // middle income (default)
    3 => ['currency' => 'USD', 'monthly' => 0.59, 'annual' => 2.49],  // lower income
];
const PPP_INDIA = ['currency' => 'INR', 'monthly' => 99.00, 'annual' => 499.00];

const PPP_TIER_1 = ['US','CA','GB','IE','AU','NZ','SG','JP','KR','HK','TW','MO','BN','IL','AE','SA','QA','KW','BH','OM',
    'CH','NO','SE','DK','FI','IS','DE','FR','NL','BE','AT','LU','IT','ES','PT','GR','CY','MT','SI','EE','LV','LT','CZ','SK'];
const PPP_TIER_3 = ['PK','BD','NP','LK','AF','MM','KH','LA','BT','MN','PH','VN','NG','KE','GH','UG','TZ','ET','EG','MA','DZ',
    'TN','ZW','ZM','SN','CM','CI','RW','MZ','MW','BF','ML','NE','TD','SD','SS','SO','YE','SY','IQ','LB','JO','UA','UZ',
    'KG','TJ','TM','BO','HN','NI','HT','CU','VE'];

/** Best-effort visitor country (ISO alpha-2) from CDN headers, else a cached IP lookup. Null if unknown. */
function pppDetectCountry(): ?string {
    foreach (['HTTP_CF_IPCOUNTRY', 'HTTP_X_COUNTRY_CODE', 'GEOIP_COUNTRY_CODE', 'HTTP_X_VERCEL_IP_COUNTRY'] as $h) {
        $v = strtoupper(trim($_SERVER[$h] ?? ''));
        if (preg_match('/^[A-Z]{2}$/', $v)) return $v;
    }
    $ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
    $ip = trim(explode(',', $ip)[0]);
    if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) return null;

    $cache = sys_get_temp_dir() . '/coloro_geo_' . md5($ip);
    if (is_file($cache) && time() - filemtime($cache) < 86400) {
        $v = trim((string)@file_get_contents($cache));
        return preg_match('/^[A-Z]{2}$/', $v) ? $v : null;
    }
    $ctx = stream_context_create(['http' => ['timeout' => 2]]);
    $v = strtoupper(trim((string)@file_get_contents("http://ip-api.com/line/{$ip}?fields=countryCode", false, $ctx)));
    if (preg_match('/^[A-Z]{2}$/', $v)) {
        @file_put_contents($cache, $v);
        return $v;
    }
    return null;
}

/** Price quote for a country: ['country','tier','currency','monthly','annual']. Unknown country -> tier 2. Always INR while INTERNATIONAL_PAYMENTS_ENABLED is off. */
function pppQuote(?string $country): array {
    if (!pppInternationalEnabled() || $country === 'IN') {
        return ['country' => $country, 'tier' => 0] + PPP_INDIA;
    }
    $tier = in_array($country, PPP_TIER_1, true) ? 1 : (in_array($country, PPP_TIER_3, true) ? 3 : 2);
    return ['country' => $country, 'tier' => $tier] + PPP_TIERS[$tier];
}
