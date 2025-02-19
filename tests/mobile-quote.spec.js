const { test, expect } = require('@playwright/test');

test('mobile quote button visibility', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE viewport

  // Navigate to quote page
  await page.goto('http://localhost:8080/quote/');

  // Try to click the button immediately without scrolling
  try {
    await page.click('button.continue-button', { timeout: 2000 });
  } catch (error) {
    console.log('Initial click failed as expected');
  }

  // Verify button exists but might be out of viewport
  const button = await page.$('button.continue-button');
  expect(button).toBeTruthy();

  // Scroll slightly and try clicking again
  await page.evaluate(() => window.scrollBy(0, 100));
  await page.click('button.continue-button');
});
