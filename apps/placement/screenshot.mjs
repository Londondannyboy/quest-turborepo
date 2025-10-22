import { chromium } from 'playwright';

async function captureScreenshot() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 }
  });

  // Navigate to the dev server
  await page.goto('http://localhost:4321', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  // Wait a bit for any animations
  await page.waitForTimeout(1000);

  // Take screenshot
  await page.screenshot({
    path: 'homepage-screenshot.png',
    fullPage: true
  });

  console.log('Screenshot saved to homepage-screenshot.png');

  await browser.close();
}

captureScreenshot().catch(console.error);
