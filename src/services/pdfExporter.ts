/**
 * Printable Coloring Sheet Exporter (A4 / Letter Print-Ready)
 */

export function printColoringSheet(
  lineArtCanvas: HTMLCanvasElement | null,
  title: string = 'Coloring Masterpiece'
): boolean {
  if (!lineArtCanvas) return false;

  const dataUrl = lineArtCanvas.toDataURL('image/png');

  // Create a dedicated print iframe to ensure perfect print styling without disturbing the main UI
  const printFrame = document.createElement('iframe');
  printFrame.style.position = 'fixed';
  printFrame.style.right = '0';
  printFrame.style.bottom = '0';
  printFrame.style.width = '0';
  printFrame.style.height = '0';
  printFrame.style.border = '0';
  document.body.appendChild(printFrame);

  const doc = printFrame.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(printFrame);
    return false;
  }

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>KidColor - ${title}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 1.5cm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            text-align: center;
            color: #2D3436;
            background: #fff;
            padding: 20px 10px;
          }
          .header {
            margin-bottom: 25px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px dashed #E0E0E0;
            padding-bottom: 12px;
          }
          .logo {
            font-size: 22px;
            font-weight: 900;
            color: #2D3436;
            letter-spacing: -0.5px;
          }
          .logo span {
            color: #FF6B6B;
          }
          .artist-line {
            font-size: 14px;
            font-weight: bold;
            color: #555;
          }
          .canvas-frame {
            width: 100%;
            max-width: 580px;
            margin: 0 auto;
            border: 3px solid #333;
            border-radius: 16px;
            padding: 15px;
            background: #FFFFFF;
          }
          .coloring-img {
            width: 100%;
            height: auto;
            display: block;
          }
          .footer {
            margin-top: 25px;
            font-size: 12px;
            font-weight: 600;
            color: #888;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🎨 Kid<span>Color</span> Magic Studio</div>
          <div class="artist-line">Little Artist: ______________________ Date: ________</div>
        </div>

        <div class="canvas-frame">
          <img src="${dataUrl}" class="coloring-img" alt="${title}" />
        </div>

        <div class="footer">
          <span>✨ Print, color with real crayons & hang on your fridge!</span>
          <span>kidcolor.storywalla.com</span>
        </div>
      </body>
    </html>
  `);
  doc.close();

  // Trigger print once content is loaded
  printFrame.contentWindow?.focus();
  setTimeout(() => {
    try {
      printFrame.contentWindow?.print();
    } catch (e) {
      console.error('Print failed:', e);
    } finally {
      setTimeout(() => {
        if (document.body.contains(printFrame)) {
          document.body.removeChild(printFrame);
        }
      }, 2000);
    }
  }, 350);

  return true;
}
