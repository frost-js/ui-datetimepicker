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
 * @param {object} fixtures The test fixtures.
 * @param {Page} fixtures.page The test page.
 * @returns {Promise<void>} Resolves when the input markup is ready.
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
