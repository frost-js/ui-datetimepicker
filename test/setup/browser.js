/** @import { Page } from '@playwright/test'; */

/**
 * Fixes the current date while allowing timers and animations to run.
 * @param {Page} page The test page.
 */
export async function setupClock(page) {
    await page.clock.setFixedTime(new Date('2026-09-15T12:30:00Z'));
}

/**
 * Creates the labeled input and outside control for picker interaction tests.
 * @param {{page: Page}} fixtures The Playwright fixtures.
 */
export async function setupInput({ page }) {
    await page.evaluate(() => {
        $.setHtml(document.body,
            '<label for="date">Date</label>' +
            '<input id="date" class="input-outline">' +
            '<button id="outside" style="position:absolute;right:0;top:0">Outside</button>',
        );
    });
}
