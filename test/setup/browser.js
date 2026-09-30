/** @import { Page } from '@playwright/test'; */

/**
 * Fixes the current date without pausing animation timers.
 * @param {Page} page The Playwright page.
 * @returns {Promise<void>} The promise.
 */
export async function setupClock(page) {
    await page.clock.setFixedTime(new Date('2026-09-15T12:30:00Z'));
}
