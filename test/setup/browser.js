/** @import { Page } from '@playwright/test'; */
/**
 * Installs and pauses the test clock at a fixed time.
 * @param {Page} page The test page.
 */
export async function setupClock(page) {
    await page.clock.setFixedTime(new Date('2026-09-15T12:30:00Z'));
}
