<?php
/**
 * Dedicated "Color by Kids" Pinterest Auto-Publish RSS Feed
 * URL: https://coloro.in/api/pinterest-community-feed.php or https://coloro.in/community-feed.xml
 *
 * Board on Pinterest: "Color by Kids" or "Colored by Kids 🎨 | Coloro Little Artists"
 */

header('Content-Type: application/rss+xml; charset=utf-8');

$baseUrl = 'https://coloro.in';

// Load Community User-Colored Artworks
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

// Fallback sample items if community folder is just created
if (empty($communityPins)) {
    $manifestPath = __DIR__ . '/../pinterest-pins/manifest.json';
    if (!file_exists($manifestPath)) {
        $manifestPath = __DIR__ . '/../../dist/pinterest-pins/manifest.json';
    }
    if (file_exists($manifestPath)) {
        $manifestData = json_decode(file_get_contents($manifestPath), true);
        if (!empty($manifestData['pins'])) {
            $communityPins = array_slice($manifestData['pins'], 0, 15);
        }
    }
}

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:media="http://search.yahoo.com/mrss/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Color by Kids 🎨 | Coloro Young Artists Showcase</title>
    <link><?= $baseUrl ?></link>
    <description>Artworks and magical coloring pages colored live by kids and toddlers on Coloro.in.</description>
    <language>en-us</language>
    <atom:link href="<?= $baseUrl ?>/community-feed.xml" rel="self" type="application/rss+xml" />

<?php foreach ($communityPins as $pin): 
    $rawTitle = !empty($pin['title']) ? $pin['title'] : 'Color by Kids Masterpiece';
    if (strpos($rawTitle, 'Colored by') === false && strpos($rawTitle, 'Color by') === false) {
        $rawTitle = 'Color by Kids: ' . $rawTitle;
    }
    $title = htmlspecialchars($rawTitle, ENT_QUOTES | ENT_XML1, 'UTF-8');
    $link = htmlspecialchars($pin['destinationUrl'] ?? $baseUrl, ENT_QUOTES | ENT_XML1, 'UTF-8');
    $guid = 'coloro-kid-' . ($pin['id'] ?? uniqid());
    $desc = !empty($pin['description']) ? $pin['description'] : 'Check out this awesome artwork colored by a young artist on Coloro.in! Download the free printable coloring sheet or paint online with magical glitter brushes at Coloro.in.';
    $mediaUrl = !empty($pin['imageUrl']) ? $pin['imageUrl'] : ($baseUrl . '/pinterest-pins/' . ($pin['id'] ?? 'pin') . '.png');
    $category = htmlspecialchars($pin['categoryLabel'] ?? 'Color by Kids', ENT_QUOTES | ENT_XML1, 'UTF-8');
    
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
