<?php
/**
 * Pinterest Auto-Publish RSS 2.0 Feed Generator for Coloro.in
 * Standard: RSS 2.0 with Media RSS and Enclosure extensions
 * URL: https://coloro.in/api/pinterest-feed.php or https://coloro.in/pinterest-feed.xml
 */

header('Content-Type: application/rss+xml; charset=utf-8');

$baseUrl = 'https://coloro.in';

// 1. Load Community User-Colored Artworks
$communityManifestPath = __DIR__ . '/../community-pins/manifest.json';
if (!file_exists($communityManifestPath)) {
    $communityManifestPath = __DIR__ . '/../../dist/community-pins/manifest.json';
}

$communityPins = [];
if (file_exists($communityManifestPath)) {
    $communityData = json_decode(file_get_contents($communityManifestPath), true);
    if (!empty($communityData['pins'])) {
        $communityPins = $communityData['pins'];
    }
}

// 2. Load Curated Static Template Pins
$manifestPath = __DIR__ . '/../pinterest-pins/manifest.json';
if (!file_exists($manifestPath)) {
    $manifestPath = __DIR__ . '/../../dist/pinterest-pins/manifest.json';
}

$curatedPins = [];
if (file_exists($manifestPath)) {
    $manifestData = json_decode(file_get_contents($manifestPath), true);
    if (!empty($manifestData['pins'])) {
        $curatedPins = $manifestData['pins'];
    }
}

// Combine: Newest community art first, followed by curated schedule
$pins = array_merge($communityPins, $curatedPins);

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Coloro: Free Kids Coloring Sheets &amp; Printable Art</title>
    <link><?= $baseUrl ?></link>
    <description>Daily free printable high-contrast coloring sheets, alphabet activities, and online magic drawing for kids.</description>
    <language>en-us</language>
    <atom:link href="<?= $baseUrl ?>/pinterest-feed.xml" rel="self" type="application/rss+xml" />

<?php foreach ($pins as $pin): 
    $title = htmlspecialchars($pin['title'] ?? 'Free Printable Coloring Page | Coloro', ENT_QUOTES | ENT_XML1, 'UTF-8');
    $link = htmlspecialchars($pin['destinationUrl'] ?? $baseUrl, ENT_QUOTES | ENT_XML1, 'UTF-8');
    $guid = 'coloro-' . ($pin['id'] ?? uniqid());
    $desc = $pin['description'] ?? 'Download free printable coloring pages for kids at Coloro.in';
    $mediaUrl = !empty($pin['imageUrl']) ? $pin['imageUrl'] : ($baseUrl . '/pinterest-pins/' . ($pin['id'] ?? 'pin') . '.png');
    $category = htmlspecialchars($pin['categoryLabel'] ?? 'Coloring Pages', ENT_QUOTES | ENT_XML1, 'UTF-8');
    
    $pubDate = !empty($pin['publishedAt']) 
        ? gmdate('D, d M Y H:i:s \G\M\T', strtotime($pin['publishedAt']))
        : gmdate('D, d M Y H:i:s \G\M\T', strtotime(($pin['scheduledDate'] ?? date('Y-m-d')) . ' ' . ($pin['scheduledTime'] ?? '08:00:00')));
?>
    <item>
      <title><?= $title ?></title>
      <link><?= $link ?></link>
      <guid isPermaLink="false"><?= $guid ?></guid>
      <pubDate><?= $pubDate ?></pubDate>
      <description><![CDATA[<?= $desc ?>]]></description>
      <enclosure url="<?= $mediaUrl ?>" length="15000" type="image/png" />
      <media:content url="<?= $mediaUrl ?>" medium="image" type="image/png" width="1000" height="1500" />
      <category><?= $category ?></category>
    </item>
<?php endforeach; ?>
  </channel>
</rss>
